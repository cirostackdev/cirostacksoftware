import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import {
  users,
  enrollments,
  courses,
  subscriptions,
  payments,
  talentPipeline,
  capstoneProjects,
  lessons,
  sections,
  lessonProgress,
  quizAttempts,
  quizQuestions,
  aiTutorConversations,
  promptLabAttempts,
} from '@/db/schema.js';
import { eq, and, gte, count, sum, sql, ilike, desc, or } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { emitEvent } from '@/services/armory.js';

export const adminRouter = Router();

// ─── Platform analytics ───────────────────────────────────────────────────────

adminRouter.get('/analytics', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalStudents] = await db.select({ cnt: count() }).from(users).where(eq(users.role, 'student'));
    const [newSignups] = await db.select({ cnt: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo));
    const [activeSubs] = await db.select({ cnt: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    // MRR — sum of active subscription amounts from payments in last 30 days
    const [mrrResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(eq(payments.status, 'success'), gte(payments.createdAt, thirtyDaysAgo)));

    const [cancelledSubs] = await db.select({ cnt: count() }).from(subscriptions).where(eq(subscriptions.status, 'cancelled'));
    const totalSubsCount = Number(activeSubs.cnt) + Number(cancelledSubs.cnt);
    const churnRate = totalSubsCount > 0 ? Number(cancelledSubs.cnt) / totalSubsCount : 0;

    res.json({
      data: {
        totalStudents: Number(totalStudents.cnt),
        newSignupsLast30Days: Number(newSignups.cnt),
        activeSubscriptions: Number(activeSubs.cnt),
        mrr: Number(mrrResult.total ?? 0),
        churnRate: Math.round(churnRate * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── User management ──────────────────────────────────────────────────────────

adminRouter.get('/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const filters = [];
    if (role) filters.push(eq(users.role, role));
    if (search) {
      filters.push(or(ilike(users.email, `%${search}%`), ilike(users.fullName, `%${search}%`)));
    }

    const rows = await db.query.users.findMany({
      where: filters.length ? and(...filters) : undefined,
      limit,
      offset: (page - 1) * limit,
      orderBy: desc(users.createdAt),
      columns: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        xpTotal: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    });

    res.json({ data: rows, meta: { page, limit } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { role, courseId } = z
      .object({
        role: z.enum(['student', 'instructor', 'admin', 'banned']).optional(),
        courseId: z.string().uuid().optional(), // manual enrollment
      })
      .parse(req.body);

    if (role) {
      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, req.params.id));
    }

    if (courseId) {
      await db
        .insert(enrollments)
        .values({ userId: req.params.id, courseId })
        .onConflictDoNothing();
    }

    const updated = await db.query.users.findFirst({ where: eq(users.id, req.params.id) });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Talent pipeline ──────────────────────────────────────────────────────────

adminRouter.get('/talent-pipeline', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const entries = await db.query.talentPipeline.findMany({
      with: {
        user: { columns: { id: true, fullName: true, email: true, username: true } },
        capstoneProject: true,
      },
    });
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/talent-pipeline/:id/refer', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const entry = await db.query.talentPipeline.findFirst({
      where: eq(talentPipeline.id, req.params.id),
      with: {
        user: true,
        capstoneProject: { with: { course: true } },
      },
    });
    if (!entry) throw new AppError(404, 'Talent pipeline entry not found');

    const project = entry.capstoneProject as {
      liveUrl: string;
      title: string;
      techStack: string[];
      instructorScore: number;
      course: { title: string };
    };
    const user = entry.user as { fullName: string; email: string };

    await emitEvent('academy.talent.referred', {
      talentPipelineId: entry.id,
      userId: entry.userId,
      userFullName: user.fullName,
      userEmail: user.email,
      capstoneProjectUrl: project.liveUrl,
      capstoneTitle: project.title,
      skillTags: entry.skillTags,
      courseTitle: project.course.title,
      instructorScore: project.instructorScore,
    });

    const [updated] = await db
      .update(talentPipeline)
      .set({ status: 'referred', referredToOrionAt: new Date(), updatedAt: new Date() })
      .where(eq(talentPipeline.id, req.params.id))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor analytics ─────────────────────────────────────────────────────

adminRouter.get('/instructor/analytics/:courseId', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    const [enrollmentCount] = await db
      .select({ cnt: count() })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));

    const [completedCount] = await db
      .select({ cnt: count() })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), sql`${enrollments.completedAt} IS NOT NULL`));

    const completionRate =
      Number(enrollmentCount.cnt) > 0
        ? Number(completedCount.cnt) / Number(enrollmentCount.cnt)
        : 0;

    // Drop-off by lesson
    const allLessons = await db.query.lessons.findMany({
      with: { section: true },
    });
    const courseLessons = allLessons.filter(
      (l) => (l.section as { courseId: string }).courseId === courseId,
    );

    const dropoff = await Promise.all(
      courseLessons.map(async (lesson) => {
        const [reached] = await db
          .select({ cnt: count() })
          .from(lessonProgress)
          .where(eq(lessonProgress.lessonId, lesson.id));
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          studentsReached: Number(reached.cnt),
          reachPercent:
            Number(enrollmentCount.cnt) > 0
              ? Math.round((Number(reached.cnt) / Number(enrollmentCount.cnt)) * 100)
              : 0,
        };
      }),
    );

    // Quiz pass rates
    const quizLessons = courseLessons.filter((l) => l.type === 'quiz');
    const quizStats = await Promise.all(
      quizLessons.map(async (lesson) => {
        const [total] = await db.select({ cnt: count() }).from(quizAttempts).where(eq(quizAttempts.lessonId, lesson.id));
        const [passed] = await db
          .select({ cnt: count() })
          .from(quizAttempts)
          .where(and(eq(quizAttempts.lessonId, lesson.id), eq(quizAttempts.passed, true)));
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          passRate: Number(total.cnt) > 0 ? Number(passed.cnt) / Number(total.cnt) : 0,
        };
      }),
    );

    // AI tutor query volume
    const aiVolume = await Promise.all(
      courseLessons.map(async (lesson) => {
        const [cnt] = await db
          .select({ cnt: count() })
          .from(aiTutorConversations)
          .where(eq(aiTutorConversations.lessonId, lesson.id));
        return { lessonId: lesson.id, conversationCount: Number(cnt.cnt) };
      }),
    );

    // Prompt lab attempts
    const promptLabStats = await Promise.all(
      courseLessons.map(async (lesson) => {
        const [cnt] = await db
          .select({ cnt: count() })
          .from(promptLabAttempts)
          .where(eq(promptLabAttempts.lessonId, lesson.id));
        return { lessonId: lesson.id, attemptCount: Number(cnt.cnt) };
      }),
    );

    res.json({
      data: {
        enrollmentCount: Number(enrollmentCount.cnt),
        completionRate: Math.round(completionRate * 100) / 100,
        dropoff,
        quizStats,
        aiTutorVolume: aiVolume,
        promptLabStats,
      },
    });
  } catch (err) {
    next(err);
  }
});
