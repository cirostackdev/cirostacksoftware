import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { liveSessions } from '@/db/schema.js';
import { eq, gt } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';

export const liveSessionsRouter = Router();

liveSessionsRouter.get('/', async (_req, res, next) => {
  try {
    const upcoming = await db.query.liveSessions.findMany({
      where: gt(liveSessions.scheduledAt, new Date()),
      with: {
        instructor: { columns: { id: true, fullName: true, avatarUrl: true } },
        course: { columns: { id: true, title: true, slug: true } },
      },
    });
    res.json({ data: upcoming });
  } catch (err) {
    next(err);
  }
});

liveSessionsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await db.query.liveSessions.findFirst({
      where: eq(liveSessions.id, req.params.id),
      with: {
        instructor: { columns: { id: true, fullName: true, avatarUrl: true } },
        course: { columns: { id: true, title: true, slug: true } },
      },
    });
    if (!session) throw new AppError(404, 'Session not found');
    res.json({ data: session });
  } catch (err) {
    next(err);
  }
});

const sessionSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().default(90),
  streamUrl: z.string().url().optional(),
  courseId: z.string().uuid().optional(),
});

liveSessionsRouter.post(
  '/instructor',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = sessionSchema.parse(req.body);
      const [session] = await db
        .insert(liveSessions)
        .values({ ...body, instructorId: req.user!.sub, scheduledAt: new Date(body.scheduledAt) })
        .returning();
      res.status(201).json({ data: session });
    } catch (err) {
      next(err);
    }
  },
);

liveSessionsRouter.patch(
  '/instructor/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const raw = sessionSchema
        .extend({ recordingUrl: z.string().url().optional() })
        .partial()
        .parse(req.body);
      const body = { ...raw, scheduledAt: raw.scheduledAt ? new Date(raw.scheduledAt) : undefined };
      const [updated] = await db
        .update(liveSessions)
        .set(body)
        .where(eq(liveSessions.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Session not found');
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);
