import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { db } from '@/db/index.js';
import {
  lessonVideoContent,
  lessonWrittenContent,
  lessonCodeContent,
  lessons,
  enrollments,
  lessonProgress,
  users,
} from '@/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { getPlaybackToken, getUploadUrl as muxUpload } from '@/services/mux.js';

export const contentRouter = Router();

async function assertEnrolled(userId: string, lessonId: string) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { section: { with: { course: true } } },
  });
  if (!lesson) throw new AppError(404, 'Lesson not found');
  const courseId = (lesson.section as { courseId: string }).courseId;
  if (!lesson.isFreePreview) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    });
    if (!enrollment) throw new AppError(403, 'Not enrolled in this course');
  }
  return { lesson, courseId };
}

// ─── Video content ────────────────────────────────────────────────────────────

contentRouter.get('/lessons/:id/video', requireAuth, async (req, res, next) => {
  try {
    await assertEnrolled(req.user!.sub, req.params.id);
    const video = await db.query.lessonVideoContent.findFirst({
      where: eq(lessonVideoContent.lessonId, req.params.id),
    });
    if (!video) throw new AppError(404, 'Video content not found');

    const muxToken = getPlaybackToken(video.muxPlaybackId);
    res.json({ data: { ...video, muxToken } });
  } catch (err) {
    next(err);
  }
});

contentRouter.patch(
  '/instructor/lessons/:id/video',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          muxAssetId: z.string(),
          muxPlaybackId: z.string(),
          transcript: z.string().optional(),
          chapters: z.array(z.object({ timeSecs: z.number(), title: z.string() })).optional(),
        })
        .parse(req.body);

      const existing = await db.query.lessonVideoContent.findFirst({
        where: eq(lessonVideoContent.lessonId, req.params.id),
      });

      const record = existing
        ? await db
            .update(lessonVideoContent)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(lessonVideoContent.lessonId, req.params.id))
            .returning()
            .then((r) => r[0])
        : await db
            .insert(lessonVideoContent)
            .values({ lessonId: req.params.id, ...body, chapters: body.chapters ?? [] })
            .returning()
            .then((r) => r[0]);

      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  },
);

// Mux upload URL
contentRouter.post(
  '/instructor/lessons/:id/video/upload-url',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const result = await muxUpload(req.params.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// Mux webhook
contentRouter.post('/payments/mux-webhook', async (req, res, next) => {
  try {
    const event = req.body as { type: string; data: { passthrough: string; playback_ids: Array<{ id: string }> }; id: string };
    if (event.type === 'video.asset.ready') {
      const lessonId = event.data.passthrough;
      const playbackId = event.data.playback_ids?.[0]?.id;
      if (lessonId && playbackId) {
        await db
          .update(lessonVideoContent)
          .set({ muxPlaybackId: playbackId, updatedAt: new Date() })
          .where(eq(lessonVideoContent.lessonId, lessonId));
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─── Written content ──────────────────────────────────────────────────────────

contentRouter.get('/lessons/:id/written', requireAuth, async (req, res, next) => {
  try {
    const { lesson } = await assertEnrolled(req.user!.sub, req.params.id);
    const written = await db.query.lessonWrittenContent.findFirst({
      where: eq(lessonWrittenContent.lessonId, req.params.id),
    });
    if (!written) throw new AppError(404, 'Written content not found');

    // Serve pidgin variant if user prefers it
    const userData = await db.query.users.findFirst({
      where: eq(users.id, req.user!.sub),
    });
    const content =
      userData?.languagePreference === 'pcm' && written.contentPidginMd
        ? written.contentPidginMd
        : written.contentMd;

    res.json({ data: { ...written, contentMd: content, hasPidginVariant: !!written.contentPidginMd } });
  } catch (err) {
    next(err);
  }
});

contentRouter.patch(
  '/instructor/lessons/:id/written',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          contentMd: z.string(),
          contentPidginMd: z.string().optional(),
        })
        .parse(req.body);

      const existing = await db.query.lessonWrittenContent.findFirst({
        where: eq(lessonWrittenContent.lessonId, req.params.id),
      });

      const record = existing
        ? await db
            .update(lessonWrittenContent)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(lessonWrittenContent.lessonId, req.params.id))
            .returning()
            .then((r) => r[0])
        : await db
            .insert(lessonWrittenContent)
            .values({ lessonId: req.params.id, contentMd: body.contentMd, contentPidginMd: body.contentPidginMd })
            .returning()
            .then((r) => r[0]);

      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Code content ─────────────────────────────────────────────────────────────

contentRouter.get('/lessons/:id/code', requireAuth, async (req, res, next) => {
  try {
    const { lesson } = await assertEnrolled(req.user!.sub, req.params.id);
    const code = await db.query.lessonCodeContent.findFirst({
      where: eq(lessonCodeContent.lessonId, req.params.id),
    });
    if (!code) throw new AppError(404, 'Code content not found');

    // Only expose solution after lesson is completed
    const progress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, req.user!.sub),
        eq(lessonProgress.lessonId, req.params.id),
      ),
    });
    const completed = !!progress?.completedAt;

    res.json({
      data: {
        ...code,
        solutionCode: completed ? code.solutionCode : null,
        manualSolution: completed ? code.manualSolution : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

contentRouter.patch(
  '/instructor/lessons/:id/code',
  requireAuth,
  requireRole('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          starterCode: z.string(),
          solutionCode: z.string(),
          manualSolution: z.string().optional(),
          language: z.enum(['javascript', 'typescript', 'python', 'dart', 'bash', 'go', 'rust']),
          testCases: z.array(z.object({ input: z.string(), expectedOutput: z.string() })).optional(),
        })
        .parse(req.body);

      const existing = await db.query.lessonCodeContent.findFirst({
        where: eq(lessonCodeContent.lessonId, req.params.id),
      });

      const record = existing
        ? await db
            .update(lessonCodeContent)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(lessonCodeContent.lessonId, req.params.id))
            .returning()
            .then((r) => r[0])
        : await db
            .insert(lessonCodeContent)
            .values({ lessonId: req.params.id, testCases: body.testCases ?? [], ...body })
            .returning()
            .then((r) => r[0]);

      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  },
);
