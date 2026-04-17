import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import { capstoneProjects, talentPipeline, xpEvents, users } from '@/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { emitEvent } from '@/services/armory.js';
import { getUploadUrl, s3KeyForCapstoneScreenshot } from '@/services/s3.js';
import { awardBadgesForEvent } from '@/modules/gamification/badges.service.js';

export const capstoneRouter = Router();

const submitSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  liveUrl: z.string().url(),
  githubUrl: z.string().url().optional(),
  techStack: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

capstoneRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body);

    // Validate live URL is reachable
    try {
      const checkRes = await fetch(body.liveUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (!checkRes.ok && checkRes.status !== 405) {
        throw new AppError(400, 'Live URL is not reachable');
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError(400, 'Live URL is not reachable');
    }

    // Pre-signed URL for screenshot upload
    const screenshotKey = s3KeyForCapstoneScreenshot(req.user!.sub, body.courseId);
    const screenshotUploadUrl = await getUploadUrl(screenshotKey, 'image/jpeg').catch(() => null);

    const [project] = await db
      .insert(capstoneProjects)
      .values({
        ...body,
        userId: req.user!.sub,
        screenshotUrl: screenshotKey ? `https://academy-assets.s3.amazonaws.com/${screenshotKey}` : null,
      })
      .returning();

    res.status(201).json({ data: { ...project, screenshotUploadUrl } });
  } catch (err) {
    next(err);
  }
});

capstoneRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const projects = await db.query.capstoneProjects.findMany({
      where: eq(capstoneProjects.userId, req.user!.sub),
    });
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
});

capstoneRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await db.query.capstoneProjects.findFirst({
      where: and(eq(capstoneProjects.id, req.params.id), eq(capstoneProjects.userId, req.user!.sub)),
    });
    if (!project) throw new AppError(404, 'Project not found');
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
});

capstoneRouter.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await db.query.capstoneProjects.findFirst({
      where: and(eq(capstoneProjects.id, req.params.id), eq(capstoneProjects.userId, req.user!.sub)),
    });
    if (!project) throw new AppError(404, 'Project not found');
    if (project.status !== 'pending') throw new AppError(400, 'Can only edit pending projects');

    const body = submitSchema.partial().parse(req.body);
    const [updated] = await db
      .update(capstoneProjects)
      .set(body)
      .where(eq(capstoneProjects.id, req.params.id))
      .returning();
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── Instructor review ────────────────────────────────────────────────────────

capstoneRouter.get(
  '/instructor/capstone',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const status = req.query.status as string | undefined;
      const allProjects = await db.query.capstoneProjects.findMany({
        with: {
          user: { columns: { id: true, fullName: true, username: true, email: true } },
          course: { columns: { id: true, title: true, instructorId: true } },
        },
      });
      const filtered = status
        ? allProjects.filter((p) => p.status === status)
        : allProjects;
      res.json({ data: filtered });
    } catch (err) {
      next(err);
    }
  },
);

capstoneRouter.patch(
  '/instructor/capstone/:id/review',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const { score, status, feedback, isTalentPipelineFlagged } = z
        .object({
          score: z.number().int().min(0).max(100),
          status: z.enum(['approved', 'revision_requested', 'rejected']),
          feedback: z.string().optional(),
          isTalentPipelineFlagged: z.boolean().default(false),
        })
        .parse(req.body);

      const [updated] = await db
        .update(capstoneProjects)
        .set({
          instructorScore: score,
          instructorFeedback: feedback ?? null,
          status,
          isTalentPipelineFlagged,
          reviewedAt: new Date(),
        })
        .where(eq(capstoneProjects.id, req.params.id))
        .returning();
      if (!updated) throw new AppError(404, 'Project not found');

      if (isTalentPipelineFlagged) {
        await db
          .insert(talentPipeline)
          .values({ userId: updated.userId, capstoneProjectId: updated.id, skillTags: updated.techStack })
          .onConflictDoNothing();
      }

      if (status === 'approved') {
        const xpReward = 150;
        await db.insert(xpEvents).values({
          userId: updated.userId,
          eventType: 'capstone_approved',
          xpAmount: xpReward,
          referenceId: updated.id,
        });
        await db
          .update(users)
          .set({ xpTotal: sql`${users.xpTotal} + ${xpReward}`, updatedAt: new Date() })
          .where(eq(users.id, updated.userId));
        await awardBadgesForEvent(updated.userId, 'capstone', updated.id);
      }

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);
