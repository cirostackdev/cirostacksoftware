import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { promptLabAttempts, xpEvents, users } from '@/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { grade } from '@/services/anthropic.js';
import { awardBadgesForEvent } from '@/modules/gamification/badges.service.js';

export const promptLabRouter = Router();

promptLabRouter.post('/run', requireAuth, async (req, res, next) => {
  try {
    const { lessonId, promptText, modelUsed } = z
      .object({
        lessonId: z.string().uuid(),
        promptText: z.string().min(1),
        modelUsed: z.enum(['claude', 'gpt4', 'gemini', 'copilot']),
      })
      .parse(req.body);

    // Execute the prompt and score it via Anthropic
    const scoringPrompt = `You are evaluating a student's AI prompt for a coding lesson.

Prompt submitted: """${promptText}"""

Score it on three dimensions (0-100 each):
- Precision: Is the prompt specific and unambiguous?
- Efficiency: Is it concise without unnecessary words?
- Completion: Does it fully describe the task?

Also provide a one-sentence rationale and execute the prompt as if you were the AI being prompted (give a short response).

Respond with JSON only:
{"precisionScore": <0-100>, "efficiencyScore": <0-100>, "completionScore": <0-100>, "rationale": "<sentence>", "output": "<response to the prompt>"}`;

    let precisionScore = 70;
    let efficiencyScore = 70;
    let completionScore = 70;
    let output = '';
    let scoringRationale: string | null = null;

    try {
      const raw = await grade(scoringPrompt);
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as {
        precisionScore?: number; efficiencyScore?: number; completionScore?: number;
        rationale?: string; output?: string;
      };
      precisionScore = Math.min(100, Math.max(0, Math.round(parsed.precisionScore ?? 70)));
      efficiencyScore = Math.min(100, Math.max(0, Math.round(parsed.efficiencyScore ?? 70)));
      completionScore = Math.min(100, Math.max(0, Math.round(parsed.completionScore ?? 70)));
      output = parsed.output ?? '';
      scoringRationale = parsed.rationale ?? null;
    } catch {
      output = 'Scoring unavailable — prompt recorded.';
    }

    const totalScore = Math.round((precisionScore + efficiencyScore + completionScore) / 3);

    const [attempt] = await db
      .insert(promptLabAttempts)
      .values({
        userId: req.user!.sub,
        lessonId,
        promptText,
        modelUsed,
        output,
        precisionScore,
        efficiencyScore,
        completionScore,
        totalScore,
        scoringRationale,
      })
      .returning();

    // Award XP proportional to score
    const xpReward = Math.round(totalScore / 10);
    await db.insert(xpEvents).values({
      userId: req.user!.sub,
      eventType: 'prompt_lab_score',
      xpAmount: xpReward,
      referenceId: attempt.id,
    });
    await db
      .update(users)
      .set({ xpTotal: sql`${users.xpTotal} + ${xpReward}`, updatedAt: new Date() })
      .where(eq(users.id, req.user!.sub));

    await awardBadgesForEvent(req.user!.sub, 'prompt_lab', attempt.id);

    res.status(201).json({ data: attempt });
  } catch (err) {
    next(err);
  }
});

promptLabRouter.get('/attempts/:lessonId', requireAuth, async (req, res, next) => {
  try {
    const attempts = await db.query.promptLabAttempts.findMany({
      where: and(
        eq(promptLabAttempts.userId, req.user!.sub),
        eq(promptLabAttempts.lessonId, req.params.lessonId),
      ),
    });
    res.json({ data: attempts });
  } catch (err) {
    next(err);
  }
});
