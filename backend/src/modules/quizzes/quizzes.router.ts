import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { quizQuestions, quizAttempts, xpEvents, users } from '@/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { grade } from '@/services/anthropic.js';
import { awardBadgesForEvent } from '@/modules/gamification/badges.service.js';

export const quizzesRouter = Router();

// Get quiz questions (no correct answers for students)
quizzesRouter.get('/lessons/:id/quiz', requireAuth, async (req, res, next) => {
  try {
    const questions = await db.query.quizQuestions.findMany({
      where: eq(quizQuestions.lessonId, req.params.id),
    });
    // Strip correct_answer for students
    const safe = questions.map(({ correctAnswer: _ca, gradingRubric: _gr, ...q }) => q);
    res.json({ data: safe });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.post('/lessons/:id/quiz/attempt', requireAuth, async (req, res, next) => {
  try {
    const { answers } = z
      .object({
        answers: z.array(z.object({ questionId: z.string().uuid(), answer: z.string() })),
      })
      .parse(req.body);

    const questions = await db.query.quizQuestions.findMany({
      where: eq(quizQuestions.lessonId, req.params.id),
    });

    const maxScore = questions.reduce((s, q) => s + q.points, 0);
    let score = 0;
    const gradedAnswers: Array<{
      questionId: string;
      answer: string;
      isCorrect: boolean;
      pointsEarned: number;
    }> = [];
    let aiFeedback: string | null = null;

    for (const q of questions) {
      const submitted = answers.find((a) => a.questionId === q.id);
      const answer = submitted?.answer ?? '';

      if (q.type === 'multiple_choice' || q.type === 'code_challenge') {
        const isCorrect = q.correctAnswer !== null && answer.trim() === q.correctAnswer.trim();
        const points = isCorrect ? q.points : 0;
        score += points;
        gradedAnswers.push({ questionId: q.id, answer, isCorrect, pointsEarned: points });
      } else if (q.type === 'open_answer') {
        try {
          const rubric = q.gradingRubric ? `Grading rubric: ${q.gradingRubric}` : '';
          const prompt = `You are grading a quiz answer. Question: "${q.questionText}". ${rubric}\nStudent answer: "${answer}"\nAvailable points: ${q.points}.\nRespond with JSON only: {"points": <number 0-${q.points}>, "feedback": "<one sentence>"}`;
          const raw = await grade(prompt);
          const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as { points?: number; feedback?: string };
          const points = Math.min(Math.max(Math.round(parsed.points ?? 0), 0), q.points);
          score += points;
          gradedAnswers.push({ questionId: q.id, answer, isCorrect: points > 0, pointsEarned: points });
          aiFeedback = parsed.feedback ?? null;
        } catch {
          const points = Math.floor(q.points / 2);
          score += points;
          gradedAnswers.push({ questionId: q.id, answer, isCorrect: false, pointsEarned: points });
          aiFeedback = 'Answer received.';
        }
      }
    }

    const passed = maxScore > 0 && score / maxScore >= 0.7;

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId: req.user!.sub,
        lessonId: req.params.id,
        score,
        maxScore,
        passed,
        answers: gradedAnswers,
        aiFeedback,
        completedAt: new Date(),
      })
      .returning();

    if (passed) {
      const xpReward = 20;
      await db.insert(xpEvents).values({
        userId: req.user!.sub,
        eventType: 'quiz_pass',
        xpAmount: xpReward,
        referenceId: attempt.id,
      });
      await db
        .update(users)
        .set({ xpTotal: sql`${users.xpTotal} + ${xpReward}`, updatedAt: new Date() })
        .where(eq(users.id, req.user!.sub));
      await awardBadgesForEvent(req.user!.sub, 'quiz_pass', attempt.id);
    }

    res.status(201).json({ data: attempt });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.get('/lessons/:id/quiz/attempts', requireAuth, async (req, res, next) => {
  try {
    const attempts = await db.query.quizAttempts.findMany({
      where: and(
        eq(quizAttempts.userId, req.user!.sub),
        eq(quizAttempts.lessonId, req.params.id),
      ),
    });
    res.json({ data: attempts });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.get('/quiz-attempts/:id', requireAuth, async (req, res, next) => {
  try {
    const attempt = await db.query.quizAttempts.findFirst({
      where: and(eq(quizAttempts.id, req.params.id), eq(quizAttempts.userId, req.user!.sub)),
    });
    if (!attempt) throw new AppError(404, 'Attempt not found');
    res.json({ data: attempt });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor quiz management ───────────────────────────────────────────────

quizzesRouter.get(
  '/instructor/lessons/:id/quiz',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const questions = await db.query.quizQuestions.findMany({
        where: eq(quizQuestions.lessonId, req.params.id),
      });
      res.json({ data: questions });
    } catch (err) {
      next(err);
    }
  },
);

const questionSchema = z.object({
  questionText: z.string().min(1),
  type: z.enum(['multiple_choice', 'code_challenge', 'open_answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  gradingRubric: z.string().optional(),
  points: z.number().int().default(10),
  position: z.number().int().default(0),
});

quizzesRouter.post(
  '/instructor/lessons/:id/quiz/questions',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = questionSchema.parse(req.body);
      const [q] = await db
        .insert(quizQuestions)
        .values({ lessonId: req.params.id, ...body })
        .returning();
      res.status(201).json({ data: q });
    } catch (err) {
      next(err);
    }
  },
);

quizzesRouter.patch(
  '/instructor/quiz-questions/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = questionSchema.partial().parse(req.body);
      const [updated] = await db
        .update(quizQuestions)
        .set(body)
        .where(eq(quizQuestions.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Question not found');
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

quizzesRouter.delete(
  '/instructor/quiz-questions/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const deleted = await db.delete(quizQuestions).where(eq(quizQuestions.id, req.params.id)).returning();
      if (!deleted.length) throw new AppError(404, 'Question not found');
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);
