import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { courses, learningPaths, users, sections, lessons } from '@/db/schema.js';
import { eq, and, lte, ilike, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { emitEvent } from '@/services/armory.js';

export const coursesRouter = Router();

// ─── Public catalog ───────────────────────────────────────────────────────────

const catalogQuerySchema = z.object({
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  price_max: z.coerce.number().optional(),
  is_free: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'popular', 'rating']).optional().default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

coursesRouter.get('/', async (req, res, next) => {
  try {
    const q = catalogQuerySchema.parse(req.query);
    const offset = (q.page - 1) * q.limit;

    const filters = [eq(courses.isPublished, true)];
    if (q.category) filters.push(eq(courses.category, q.category));
    if (q.level) filters.push(eq(courses.level, q.level));
    if (q.is_free) filters.push(eq(courses.priceNgn, 0));
    if (q.price_max !== undefined) filters.push(lte(courses.priceNgn, q.price_max));

    const orderBy =
      q.sort === 'popular'
        ? desc(courses.enrolmentCount)
        : q.sort === 'rating'
          ? desc(courses.ratingAverage)
          : desc(courses.createdAt);

    const rows = await db.query.courses.findMany({
      where: and(...filters),
      orderBy,
      limit: q.limit,
      offset,
      with: { instructor: { columns: { id: true, fullName: true, avatarUrl: true } } },
    });

    res.json({ data: rows, meta: { page: q.page, limit: q.limit } });
  } catch (err) {
    next(err);
  }
});

coursesRouter.get('/slug/:slug', async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, req.params.slug),
      with: {
        instructor: { columns: { id: true, fullName: true, avatarUrl: true, username: true } },
        sections: { with: { lessons: true } },
      },
    });
    if (!course) throw new AppError(404, 'Course not found');
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
});

coursesRouter.get('/slug/:slug/preview', async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.slug, req.params.slug) });
    if (!course) throw new AppError(404, 'Course not found');

    const sectionsWithFreeLessons = await db.query.sections.findMany({
      where: eq(sections.courseId, course.id),
      with: {
        lessons: { where: eq(lessons.isFreePreview, true) },
      },
    });
    res.json({ data: sectionsWithFreeLessons });
  } catch (err) {
    next(err);
  }
});

// ─── Learning paths ───────────────────────────────────────────────────────────

coursesRouter.get('/learning-paths', async (_req, res, next) => {
  try {
    const paths = await db.query.learningPaths.findMany({
      where: eq(learningPaths.isPublished, true),
      orderBy: asc(learningPaths.position),
    });
    res.json({ data: paths });
  } catch (err) {
    next(err);
  }
});

coursesRouter.get('/learning-paths/:slug', async (req, res, next) => {
  try {
    const path = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.slug, req.params.slug),
    });
    if (!path) throw new AppError(404, 'Learning path not found');
    const pathCourses = await db.query.courses.findMany({
      where: and(eq(courses.learningPathId, path.id), eq(courses.isPublished, true)),
      orderBy: asc(courses.createdAt),
    });
    res.json({ data: { ...path, courses: pathCourses } });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor CRUD ──────────────────────────────────────────────────────────

const courseCreateSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  description: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['ui_ux', 'web_dev', 'mobile', 'ai_ml', 'cloud_devops', 'architecture', 'startups']),
  priceNgn: z.number().int().min(0).default(0),
  priceUsd: z.number().int().min(0).default(0),
  whatYouLearn: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().optional(),
  learningPathId: z.string().uuid().optional(),
  hasAiVsManual: z.boolean().default(false),
  hasPromptLab: z.boolean().default(false),
  hasClientBrief: z.boolean().default(false),
  hasCapstone: z.boolean().default(false),
  whatsappGroupUrl: z.string().url().optional(),
});

coursesRouter.get('/instructor/courses', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const rows = await db.query.courses.findMany({
      where: eq(courses.instructorId, req.user!.sub),
      orderBy: desc(courses.createdAt),
    });
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

coursesRouter.post('/instructor/courses', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const body = courseCreateSchema.parse(req.body);
    const existing = await db.query.courses.findFirst({ where: eq(courses.slug, body.slug) });
    if (existing) throw new AppError(409, 'Slug already in use');

    const [course] = await db
      .insert(courses)
      .values({ ...body, instructorId: req.user!.sub })
      .returning();
    res.status(201).json({ data: course });
  } catch (err) {
    next(err);
  }
});

coursesRouter.patch('/instructor/courses/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) });
    if (!course) throw new AppError(404, 'Course not found');
    if (course.instructorId !== req.user!.sub && req.user!.role !== 'admin') {
      throw new AppError(403, 'Forbidden');
    }

    const body = courseCreateSchema.partial().parse(req.body);
    const [updated] = await db
      .update(courses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(courses.id, req.params.id))
      .returning();
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

coursesRouter.delete('/instructor/courses/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) });
    if (!course) throw new AppError(404, 'Course not found');
    if (course.isPublished) throw new AppError(400, 'Cannot delete a published course');
    if (course.instructorId !== req.user!.sub && req.user!.role !== 'admin') {
      throw new AppError(403, 'Forbidden');
    }
    await db.delete(courses).where(eq(courses.id, req.params.id));
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

coursesRouter.patch('/instructor/courses/:id/publish', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) });
    if (!course) throw new AppError(404, 'Course not found');
    if (course.instructorId !== req.user!.sub && req.user!.role !== 'admin') {
      throw new AppError(403, 'Forbidden');
    }

    const isFirstPublish = !course.isPublished && !course.firstPublishedAt;
    const newStatus = !course.isPublished;
    const [updated] = await db
      .update(courses)
      .set({
        isPublished: newStatus,
        firstPublishedAt: isFirstPublish ? new Date() : course.firstPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, req.params.id))
      .returning();

    if (isFirstPublish) {
      const instructor = await db.query.users.findFirst({ where: eq(users.id, course.instructorId) });
      await emitEvent('academy.course.published', {
        courseId: updated.id,
        courseTitle: updated.title,
        courseSlug: updated.slug,
        category: updated.category,
        level: updated.level,
        instructorName: instructor?.fullName ?? '',
        priceNgn: updated.priceNgn,
        priceUsd: updated.priceUsd,
        thumbnailUrl: updated.thumbnailUrl ?? '',
      });
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

coursesRouter.patch('/admin/courses/:id/feature', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) });
    if (!course) throw new AppError(404, 'Course not found');

    const [updated] = await db
      .update(courses)
      .set({ isFeatured: !course.isFeatured, updatedAt: new Date() })
      .where(eq(courses.id, req.params.id))
      .returning();
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});
