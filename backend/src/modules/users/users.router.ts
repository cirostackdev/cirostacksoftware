import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { users } from '@/db/schema.js';
import { eq } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';

export const usersRouter = Router();

const updateMeSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  avatarUrl: z.string().url().optional(),
  languagePreference: z.enum(['en', 'pcm']).optional(),
  countryCode: z.string().length(2).optional(),
  currency: z.enum(['NGN', 'USD']).optional(),
});

function sanitize(user: typeof users.$inferSelect) {
  const { passwordHash, refreshToken, emailVerifyToken, passwordResetToken, passwordResetExpiresAt, ...safe } = user;
  return safe;
}

usersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ data: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, req.user!.sub))
      .returning();
    res.json({ data: sanitize(updated) });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete('/me', requireAuth, async (req, res, next) => {
  try {
    // Soft delete: set role to banned, clear sensitive data
    await db
      .update(users)
      .set({ role: 'banned', passwordHash: null, refreshToken: null, updatedAt: new Date() })
      .where(eq(users.id, req.user!.sub));
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/me/onboarding', requireAuth, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.sub) });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ data: { completed: user.onboardingCompleted, answers: user.onboardingAnswers } });
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/me/onboarding', requireAuth, async (req, res, next) => {
  try {
    const { answers } = z.object({ answers: z.record(z.unknown()) }).parse(req.body);
    await db
      .update(users)
      .set({ onboardingCompleted: true, onboardingAnswers: answers, updatedAt: new Date() })
      .where(eq(users.id, req.user!.sub));
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:username', async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.username, req.params.username) });
    if (!user) throw new AppError(404, 'User not found');
    // Return only public fields
    res.json({
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        xpTotal: user.xpTotal,
        streakCurrent: user.streakCurrent,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});
