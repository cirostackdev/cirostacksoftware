import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const sandboxLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  keyGenerator: (req) => (req as unknown as { user?: { id: string } }).user?.id ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Sandbox rate limit reached (30 executions/hour).' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please wait 15 minutes.' },
});
