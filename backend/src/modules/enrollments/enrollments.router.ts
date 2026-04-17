import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { enrollments, lessons, lessonProgress, sections, subscriptions } from '@/db/schema.js';
import { eq, and, count, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { courses } from '@/db/schema.js';

export const enrollmentsRouter = Router();

enrollmentsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const myEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, req.user!.sub),
      with: {
        course: {
          with: {
            instructor: { columns: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Compute progress percent for each enrollment
    const enriched = await Promise.all(
      myEnrollments.map(async (e) => {
        const totalLessonsResult = await db
          .select({ cnt: count() })
          .from(lessons)
          .innerJoin(sections, eq(sections.id, lessons.sectionId))
          .where(eq(sections.courseId, e.courseId));
        const total = Number(totalLessonsResult[0]?.cnt ?? 0);

        const completedResult = await db
          .select({ cnt: count() })
          .from(lessonProgress)
          .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
          .innerJoin(sections, eq(sections.id, lessons.sectionId))
          .where(
            and(
              eq(sections.courseId, e.courseId),
              eq(lessonProgress.userId, req.user!.sub),
              sql`${lessonProgress.completedAt} IS NOT NULL`,
            ),
          );
        const completed = Number(completedResult[0]?.cnt ?? 0);

        return {
          ...e,
          progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),
    );

    res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
});

enrollmentsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = z.object({ courseId: z.string().uuid() }).parse(req.body);

    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) throw new AppError(404, 'Course not found');

    const existing = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, req.user!.sub), eq(enrollments.courseId, courseId)),
    });
    if (existing) throw new AppError(409, 'Already enrolled');

    // Free course or active subscription
    const isFree = course.priceNgn === 0 && course.priceUsd === 0;
    if (!isFree) {
      const sub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.userId, req.user!.sub),
          eq(subscriptions.status, 'active'),
        ),
      });
      if (!sub) throw new AppError(402, 'Payment required to enroll');
    }

    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId: req.user!.sub, courseId })
      .returning();

    // Increment enrollment count
    await db
      .update(courses)
      .set({ enrolmentCount: sql`${courses.enrolmentCount} + 1` })
      .where(eq(courses.id, courseId));

    res.status(201).json({ data: enrollment });
  } catch (err) {
    next(err);
  }
});

enrollmentsRouter.get('/:courseId/progress', requireAuth, async (req, res, next) => {
  try {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, req.user!.sub),
        eq(enrollments.courseId, req.params.courseId),
      ),
    });
    if (!enrollment) throw new AppError(404, 'Not enrolled');

    const progressRows = await db.query.lessonProgress.findMany({
      where: and(
        eq(lessonProgress.userId, req.user!.sub),
      ),
      with: {
        lesson: {
          with: { section: true },
        },
      },
    });

    // Filter to this course
    const filtered = progressRows.filter(
      (p) => (p.lesson as { section: { courseId: string } }).section.courseId === req.params.courseId,
    );

    const progressMap: Record<string, typeof filtered[0]> = {};
    for (const p of filtered) {
      progressMap[p.lessonId] = p;
    }

    res.json({ data: progressMap });
  } catch (err) {
    next(err);
  }
});
