import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { lessons, enrollments, sections } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';

export const lessonsRouter = Router();

// Get lesson (requires enrollment unless free preview)
lessonsRouter.get('/lessons/:id', requireAuth, async (req, res, next) => {
  try {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, req.params.id),
      with: {
        section: { with: { course: true } },
      },
    });
    if (!lesson) throw new AppError(404, 'Lesson not found');

    if (!lesson.isFreePreview) {
      const section = lesson.section as { courseId: string };
      const enrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, req.user!.sub),
          eq(enrollments.courseId, section.courseId),
        ),
      });
      if (!enrollment) throw new AppError(403, 'Not enrolled in this course');
    }

    res.json({ data: lesson });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor lesson CRUD ───────────────────────────────────────────────────

const lessonCreateSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().default(0),
  type: z.enum(['video', 'written', 'code', 'quiz', 'prompt_lab', 'ai_debug', 'client_brief', 'capstone']),
  durationSecs: z.number().int().optional(),
  xpReward: z.number().int().default(10),
  isFreePreview: z.boolean().default(false),
});

lessonsRouter.post(
  '/instructor/sections/:sectionId/lessons',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = lessonCreateSchema.parse(req.body);
      const [lesson] = await db
        .insert(lessons)
        .values({ ...body, sectionId: req.params.sectionId })
        .returning();
      res.status(201).json({ data: lesson });
    } catch (err) {
      next(err);
    }
  },
);

lessonsRouter.patch(
  '/instructor/lessons/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = lessonCreateSchema.partial().parse(req.body);
      const [updated] = await db
        .update(lessons)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(lessons.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Lesson not found');
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

lessonsRouter.delete(
  '/instructor/lessons/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const deleted = await db.delete(lessons).where(eq(lessons.id, req.params.id)).returning();
      if (!deleted.length) throw new AppError(404, 'Lesson not found');
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);

lessonsRouter.post(
  '/instructor/lessons/:id/reorder',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const { position } = z.object({ position: z.number().int() }).parse(req.body);
      await db.update(lessons).set({ position }).where(eq(lessons.id, req.params.id));
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);
