import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import {
  lessonProgress,
  lessons,
  sections,
  enrollments,
  xpEvents,
  users,
  certificates,
} from '@/db/schema.js';
import { eq, and, count, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { emitEvent } from '@/services/armory.js';
import { awardBadgesForEvent } from '@/modules/gamification/badges.service.js';
import { updateStreak } from '@/modules/gamification/streak.service.js';
import { generateCertificate } from '@/services/certificate.js';
import { courses } from '@/db/schema.js';

export const progressRouter = Router();

progressRouter.post('/lessons/:id', requireAuth, async (req, res, next) => {
  try {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, req.params.id),
      with: { section: true },
    });
    if (!lesson) throw new AppError(404, 'Lesson not found');

    const section = lesson.section as { courseId: string };
    const userId = req.user!.sub;

    // Upsert lesson progress
    const existing = await db.query.lessonProgress.findFirst({
      where: and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, req.params.id)),
    });

    if (existing?.completedAt) {
      // Already complete, just return
      res.json({ data: existing });
      return;
    }

    const [progress] = existing
      ? await db
          .update(lessonProgress)
          .set({ completedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, req.params.id)))
          .returning()
      : await db
          .insert(lessonProgress)
          .values({ userId, lessonId: req.params.id, completedAt: new Date() })
          .returning();

    // Award XP
    await db.insert(xpEvents).values({
      userId,
      eventType: 'lesson_complete',
      xpAmount: lesson.xpReward,
      referenceId: lesson.id,
    });
    await db
      .update(users)
      .set({ xpTotal: sql`${users.xpTotal} + ${lesson.xpReward}`, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Update streak
    await updateStreak(userId);

    // Check if course is now complete
    const totalLessonsResult = await db
      .select({ cnt: count() })
      .from(lessons)
      .innerJoin(sections, eq(sections.id, lessons.sectionId))
      .where(eq(sections.courseId, section.courseId));
    const total = Number(totalLessonsResult[0]?.cnt ?? 0);

    const completedResult = await db
      .select({ cnt: count() })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(sections, eq(sections.id, lessons.sectionId))
      .where(
        and(
          eq(sections.courseId, section.courseId),
          eq(lessonProgress.userId, userId),
          sql`${lessonProgress.completedAt} IS NOT NULL`,
        ),
      );
    const completed = Number(completedResult[0]?.cnt ?? 0);

    if (total > 0 && completed >= total) {
      // Mark enrollment complete
      await db
        .update(enrollments)
        .set({ completedAt: new Date() })
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, section.courseId)));

      // Award course_complete XP
      await db.insert(xpEvents).values({
        userId,
        eventType: 'course_complete',
        xpAmount: 100,
        referenceId: section.courseId as unknown as string,
      });
      await db
        .update(users)
        .set({ xpTotal: sql`${users.xpTotal} + 100`, updatedAt: new Date() })
        .where(eq(users.id, userId));

      const course = await db.query.courses.findFirst({ where: eq(courses.id, section.courseId) });
      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

      // Fire Armory event
      await emitEvent('academy.course.completed', {
        userId,
        userFullName: user?.fullName ?? '',
        courseId: section.courseId,
        courseTitle: course?.title ?? '',
        enrollmentId: (await db.query.enrollments.findFirst({
          where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, section.courseId)),
        }))?.id ?? '',
        completedAt: new Date().toISOString(),
      });

      // Generate certificate
      if (user && course) {
        generateCertificate(userId, course.id, user.fullName, user.email, course.title).catch(
          (e) => console.error('[progress] cert generation error:', e),
        );
      }
    }

    await awardBadgesForEvent(userId, 'lesson_complete', lesson.id);

    res.json({ data: progress });
  } catch (err) {
    next(err);
  }
});

progressRouter.patch('/lessons/:id', requireAuth, async (req, res, next) => {
  try {
    const body = z
      .object({
        notes: z.string().optional(),
        lastPositionSecs: z.number().int().min(0).optional(),
      })
      .parse(req.body);

    const userId = req.user!.sub;
    const existing = await db.query.lessonProgress.findFirst({
      where: and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, req.params.id)),
    });

    if (existing) {
      const [updated] = await db
        .update(lessonProgress)
        .set({ ...body, updatedAt: new Date() })
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, req.params.id)))
        .returning();
      res.json({ data: updated });
    } else {
      const [created] = await db
        .insert(lessonProgress)
        .values({ userId, lessonId: req.params.id, ...body })
        .returning();
      res.json({ data: created });
    }
  } catch (err) {
    next(err);
  }
});
