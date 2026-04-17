import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { aiTutorConversations, lessons } from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { chat } from '@/services/anthropic.js';

export const aiTutorRouter = Router();

aiTutorRouter.post('/chat', requireAuth, async (req, res, next) => {
  try {
    const { lessonId, message } = z
      .object({ lessonId: z.string().uuid(), message: z.string().min(1) })
      .parse(req.body);

    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
    if (!lesson) throw new AppError(404, 'Lesson not found');

    let convo = await db.query.aiTutorConversations.findFirst({
      where: and(
        eq(aiTutorConversations.userId, req.user!.sub),
        eq(aiTutorConversations.lessonId, lessonId),
      ),
    });

    const existingMessages = (convo?.messages as Array<{ role: string; content: string; createdAt: string }>) ?? [];
    const userMessage = { role: 'user', content: message, createdAt: new Date().toISOString() };
    const updatedMessages = [...existingMessages, userMessage];

    if (!convo) {
      const [created] = await db
        .insert(aiTutorConversations)
        .values({ userId: req.user!.sub, lessonId, messages: updatedMessages })
        .returning();
      convo = created;
    } else {
      await db
        .update(aiTutorConversations)
        .set({ messages: updatedMessages, updatedAt: new Date() })
        .where(eq(aiTutorConversations.id, convo.id));
    }

    const system = `You are a helpful coding tutor for CiroStack Academy. The student is on the lesson: "${lesson.title}" (type: ${lesson.type}). Answer concisely and practically. If they share code, help debug it. Stay focused on the lesson topic.`;

    const anthropicMessages = existingMessages
      .slice(-10)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    anthropicMessages.push({ role: 'user', content: message });

    let replyContent: string;
    try {
      replyContent = await chat(system, anthropicMessages);
    } catch (err) {
      console.error('[ai-tutor] Anthropic error:', err);
      replyContent = 'AI tutor is currently unavailable. Please try again later.';
    }

    const assistantMessage = {
      role: 'assistant',
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    await db
      .update(aiTutorConversations)
      .set({ messages: [...updatedMessages, assistantMessage], updatedAt: new Date() })
      .where(eq(aiTutorConversations.id, convo!.id));

    res.json({ data: assistantMessage });
  } catch (err) {
    next(err);
  }
});

aiTutorRouter.get('/:lessonId/history', requireAuth, async (req, res, next) => {
  try {
    const convo = await db.query.aiTutorConversations.findFirst({
      where: and(
        eq(aiTutorConversations.userId, req.user!.sub),
        eq(aiTutorConversations.lessonId, req.params.lessonId),
      ),
    });
    res.json({ data: convo ?? { messages: [] } });
  } catch (err) {
    next(err);
  }
});

aiTutorRouter.delete('/:lessonId/history', requireAuth, async (req, res, next) => {
  try {
    await db
      .update(aiTutorConversations)
      .set({ messages: [], updatedAt: new Date() })
      .where(
        and(
          eq(aiTutorConversations.userId, req.user!.sub),
          eq(aiTutorConversations.lessonId, req.params.lessonId),
        ),
      );
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});
