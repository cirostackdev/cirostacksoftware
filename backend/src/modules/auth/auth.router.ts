import { Router } from 'express';
import { z } from 'zod';
import { authLimiter } from '@/middleware/rateLimit.js';
import { requireAuth } from '@/middleware/auth.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body.email, body.password, body.fullName);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { idToken } = z.object({ idToken: z.string() }).parse(req.body);
    const result = await authService.googleOAuth(idToken);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }
    const result = await authService.refresh(token);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await authService.logout(req.user!.sub);
    res.clearCookie('refreshToken');
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.forgotPassword(email);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = z
      .object({ token: z.string(), newPassword: z.string().min(8) })
      .parse(req.body);
    await authService.resetPassword(token, newPassword);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    await authService.resendVerification(req.user!.sub);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// OTP-based verification (POST with code in body — used by the in-app form)
authRouter.post('/verify-email', requireAuth, async (req, res, next) => {
  try {
    const { otp } = z.object({ otp: z.string().length(6) }).parse(req.body);
    await authService.verifyEmail(otp);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// Link-based verification (GET with token in URL — used by email links)
authRouter.get('/verify-email/:token', async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});
