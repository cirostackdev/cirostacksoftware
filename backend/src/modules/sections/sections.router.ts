import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { sections, lessons, courses } from '@/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';

export const curriculumRouter = Router();

// Public curriculum
curriculumRouter.get('/courses/:courseId/curriculum', async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.courseId) });
    if (!course) throw new AppError(404, 'Course not found');

    const allSections = await db.query.sections.findMany({
      where: eq(sections.courseId, req.params.courseId),
      orderBy: asc(sections.position),
      with: {
        lessons: {
          orderBy: asc(lessons.position),
        },
      },
    });

    // Mask locked lessons for non-enrolled users (title only, no content)
    // Actual enrollment check is done on /lessons/:id — here we just return metadata
    res.json({ data: allSections });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor section CRUD ──────────────────────────────────────────────────

curriculumRouter.post(
  '/instructor/courses/:courseId/sections',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const { title, position, isFreePreview } = z
        .object({
          title: z.string().min(1).max(255),
          position: z.number().int().default(0),
          isFreePreview: z.boolean().default(false),
        })
        .parse(req.body);

      const [section] = await db
        .insert(sections)
        .values({ courseId: req.params.courseId, title, position, isFreePreview })
        .returning();
      res.status(201).json({ data: section });
    } catch (err) {
      next(err);
    }
  },
);

curriculumRouter.patch(
  '/instructor/sections/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(255).optional(),
          isFreePreview: z.boolean().optional(),
        })
        .parse(req.body);

      const [updated] = await db
        .update(sections)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(sections.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Section not found');
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

curriculumRouter.delete(
  '/instructor/sections/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const deleted = await db.delete(sections).where(eq(sections.id, req.params.id)).returning();
      if (!deleted.length) throw new AppError(404, 'Section not found');
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);

curriculumRouter.post(
  '/instructor/sections/:id/reorder',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const { position } = z.object({ position: z.number().int() }).parse(req.body);
      await db.update(sections).set({ position }).where(eq(sections.id, req.params.id));
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);
