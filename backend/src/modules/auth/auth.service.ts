import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/db/index.js';
import { users } from '@/db/schema.js';
import { eq } from 'drizzle-orm';
import { secrets } from '@/config/secrets.js';
import { AppError } from '@/middleware/errorHandler.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '@/services/email.js';

const SALT_ROUNDS = 12;
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';

function generateOtp(): string {
  // Cryptographically random 6-digit code
  const num = randomBytes(3).readUIntBE(0, 3) % 900000 + 100000;
  return String(num);
}

function generateUsername(fullName: string): string {
  const base = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `${base}_${randomBytes(3).toString('hex')}`;
}

function issueTokens(userId: string, role: string, email: string) {
  const { jwtAccessSecret, jwtRefreshSecret } = secrets();
  const accessToken = jwt.sign({ sub: userId, role, email }, jwtAccessSecret, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ sub: userId }, jwtRefreshSecret, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
}

export async function register(email: string, password: string, fullName: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const username = generateUsername(fullName);
  const emailVerifyToken = generateOtp();

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      username,
      emailVerifyToken,
    })
    .returning();

  await sendVerificationEmail(user.email, emailVerifyToken);
  await sendWelcomeEmail(user.email, fullName.split(' ')[0]);

  const tokens = issueTokens(user.id, user.role, user.email);
  await db.update(users).set({ refreshToken: tokens.refreshToken }).where(eq(users.id, user.id));

  return { user: sanitizeUser(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user || !user.passwordHash) throw new AppError(401, 'Invalid credentials');
  if (user.role === 'banned') throw new AppError(403, 'Account suspended');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const tokens = issueTokens(user.id, user.role, user.email);
  await db.update(users).set({ refreshToken: tokens.refreshToken }).where(eq(users.id, user.id));

  return { user: sanitizeUser(user), ...tokens };
}

export async function googleOAuth(googleIdToken: string) {
  // Verify Google ID token
  const googleRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`,
  );
  if (!googleRes.ok) throw new AppError(401, 'Invalid Google token');
  const payload = (await googleRes.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  let user = await db.query.users.findFirst({ where: eq(users.googleOauthId, payload.sub) });
  if (!user) {
    user = await db.query.users.findFirst({ where: eq(users.email, payload.email.toLowerCase()) });
  }

  if (!user) {
    const username = generateUsername(payload.name);
    const [created] = await db
      .insert(users)
      .values({
        email: payload.email.toLowerCase(),
        fullName: payload.name,
        username,
        googleOauthId: payload.sub,
        avatarUrl: payload.picture ?? null,
        emailVerifiedAt: new Date(),
      })
      .returning();
    user = created;
    await sendWelcomeEmail(user.email, payload.name.split(' ')[0]);
  } else if (!user.googleOauthId) {
    await db.update(users).set({ googleOauthId: payload.sub }).where(eq(users.id, user.id));
  }

  const tokens = issueTokens(user.id, user.role, user.email);
  await db.update(users).set({ refreshToken: tokens.refreshToken }).where(eq(users.id, user.id));

  return { user: sanitizeUser(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  const { jwtRefreshSecret, jwtAccessSecret } = secrets();
  let payload: { sub: string };
  try {
    payload = jwt.verify(refreshToken, jwtRefreshSecret) as { sub: string };
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) });
  if (!user || user.refreshToken !== refreshToken) throw new AppError(401, 'Refresh token revoked');

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    jwtAccessSecret,
    { expiresIn: ACCESS_TTL },
  );
  return { accessToken };
}

export async function logout(userId: string) {
  await db.update(users).set({ refreshToken: null }).where(eq(users.id, userId));
}

export async function forgotPassword(email: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user) return; // silently succeed to avoid user enumeration

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db
    .update(users)
    .set({ passwordResetToken: token, passwordResetExpiresAt: expiresAt })
    .where(eq(users.id, user.id));

  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.passwordResetToken, token),
  });
  if (
    !user ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt < new Date()
  ) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db
    .update(users)
    .set({ passwordHash, passwordResetToken: null, passwordResetExpiresAt: null })
    .where(eq(users.id, user.id));
}

export async function resendVerification(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new AppError(404, 'User not found');
  if (user.emailVerifiedAt) throw new AppError(400, 'Email already verified');

  const token = generateOtp();
  await db.update(users).set({ emailVerifyToken: token }).where(eq(users.id, userId));
  await sendVerificationEmail(user.email, token);
}

export async function verifyEmail(token: string) {
  const user = await db.query.users.findFirst({ where: eq(users.emailVerifyToken, token) });
  if (!user) throw new AppError(400, 'Invalid verification token');
  if (user.emailVerifiedAt) return; // already verified

  await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), emailVerifyToken: null })
    .where(eq(users.id, user.id));
}

function sanitizeUser(user: typeof users.$inferSelect) {
  const { passwordHash, refreshToken, emailVerifyToken, passwordResetToken, passwordResetExpiresAt, ...safe } = user;
  return safe;
}
