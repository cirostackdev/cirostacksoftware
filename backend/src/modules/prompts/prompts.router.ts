import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { lessonPrompts, userPromptLibrary } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';

export const promptsRouter = Router();

// ─── Lesson prompts (public for enrolled users) ───────────────────────────────

promptsRouter.get('/lessons/:id/prompts', requireAuth, async (req, res, next) => {
  try {
    const prompts = await db.query.lessonPrompts.findMany({
      where: eq(lessonPrompts.lessonId, req.params.id),
    });
    res.json({ data: prompts });
  } catch (err) {
    next(err);
  }
});

const promptSchema = z.object({
  promptText: z.string().min(1),
  modelUsed: z.enum(['claude', 'gpt4', 'gemini', 'copilot']),
  contextNote: z.string().max(500).optional(),
  tag: z.enum(['architecture', 'debugging', 'refactor', 'generation', 'review', 'explanation', 'testing']),
  position: z.number().int().default(0),
});

promptsRouter.post(
  '/instructor/lessons/:id/prompts',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = promptSchema.parse(req.body);
      const [prompt] = await db
        .insert(lessonPrompts)
        .values({ lessonId: req.params.id, ...body })
        .returning();
      res.status(201).json({ data: prompt });
    } catch (err) {
      next(err);
    }
  },
);

promptsRouter.patch(
  '/instructor/lesson-prompts/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = promptSchema.partial().parse(req.body);
      const [updated] = await db
        .update(lessonPrompts)
        .set(body)
        .where(eq(lessonPrompts.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Prompt not found');
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

promptsRouter.delete(
  '/instructor/lesson-prompts/:id',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const deleted = await db.delete(lessonPrompts).where(eq(lessonPrompts.id, req.params.id)).returning();
      if (!deleted.length) throw new AppError(404, 'Prompt not found');
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  },
);

// ─── User prompt library ──────────────────────────────────────────────────────

const libSchema = z.object({
  promptText: z.string().min(1),
  modelUsed: z.enum(['claude', 'gpt4', 'gemini', 'copilot']),
  tag: z.string().optional(),
  customLabel: z.string().max(100).optional(),
});

promptsRouter.get('/prompt-library', requireAuth, async (req, res, next) => {
  try {
    const items = await db.query.userPromptLibrary.findMany({
      where: eq(userPromptLibrary.userId, req.user!.sub),
    });
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

promptsRouter.post('/prompt-library', requireAuth, async (req, res, next) => {
  try {
    const body = libSchema.parse(req.body);
    const [item] = await db
      .insert(userPromptLibrary)
      .values({ userId: req.user!.sub, isCustom: true, ...body })
      .returning();
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

promptsRouter.post('/prompt-library/steal/:lessonPromptId', requireAuth, async (req, res, next) => {
  try {
    const source = await db.query.lessonPrompts.findFirst({
      where: eq(lessonPrompts.id, req.params.lessonPromptId),
    });
    if (!source) throw new AppError(404, 'Lesson prompt not found');

    const [item] = await db
      .insert(userPromptLibrary)
      .values({
        userId: req.user!.sub,
        sourcePromptId: source.id,
        promptText: source.promptText,
        modelUsed: source.modelUsed as 'claude' | 'gpt4' | 'gemini' | 'copilot',
        tag: source.tag,
        isCustom: false,
      })
      .returning();
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

promptsRouter.patch('/prompt-library/:id', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({ customLabel: z.string().optional(), tag: z.string().optional() }).parse(req.body);
    const [updated] = await db
      .update(userPromptLibrary)
      .set(body)
      .where(and(eq(userPromptLibrary.id, req.params.id), eq(userPromptLibrary.userId, req.user!.sub)))
      .returning();
    if (!updated) throw new AppError(404, 'Prompt not found');
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

promptsRouter.delete('/prompt-library/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await db
      .delete(userPromptLibrary)
      .where(and(eq(userPromptLibrary.id, req.params.id), eq(userPromptLibrary.userId, req.user!.sub)))
      .returning();
    if (!deleted.length) throw new AppError(404, 'Prompt not found');
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});
