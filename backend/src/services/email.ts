// Email service — sends transactional emails via Resend.

const FROM = process.env.EMAIL_FROM ?? 'CiroStack Academy <onboarding@resend.dev>';
const SITE_URL = process.env.SITE_URL ?? 'https://academy.cirostack.com';

async function send(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[email] RESEND_API_KEY is not set');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[email] Resend rejected send to ${to}: ${res.status} ${body}`);
  }
}

export async function sendVerificationEmail(to: string, otp: string): Promise<void> {
  await send(
    to,
    'Your CiroStack Academy verification code',
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#E82121">Verify your email</h2>
      <p>Enter this code in the app to verify your email address:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:24px 0;color:#111">${otp}</div>
      <p style="color:#666;font-size:14px">This code expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>`,
  );
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${SITE_URL}/auth/forgot-password?token=${token}`;
  await send(
    to,
    'Reset your CiroStack Academy password',
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#E82121">Reset your password</h2>
      <p>Click the link below to set a new password:</p>
      <p><a href="${link}" style="color:#E82121">${link}</a></p>
      <p style="color:#666;font-size:14px">This link expires in 1 hour. If you didn't request this, ignore it.</p>
    </div>`,
  );
}

export async function sendCertificateEmail(
  to: string,
  courseTitle: string,
  pdfUrl: string,
): Promise<void> {
  await send(
    to,
    `Congratulations — your ${courseTitle} certificate is ready!`,
    `<p>You've completed <strong>${courseTitle}</strong>! 🎉</p>
     <p>Download your certificate here: <a href="${pdfUrl}">${pdfUrl}</a></p>`,
  );
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  await send(
    to,
    'Welcome to CiroStack Academy!',
    `<p>Hey ${firstName}! 👋</p>
     <p>Welcome to CiroStack Academy — your shortcut to real-world tech skills.</p>
     <p><a href="${SITE_URL}/courses">Browse courses →</a></p>`,
  );
}
