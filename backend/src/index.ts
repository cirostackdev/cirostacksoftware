import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { loadSecrets } from '@/config/secrets.js';
import { errorHandler } from '@/middleware/errorHandler.js';
import { apiLimiter } from '@/middleware/rateLimit.js';

async function bootstrap() {
  await loadSecrets();

  // Lazy-import routers AFTER secrets are loaded (they may import db which needs secrets)
  const { authRouter } = await import('@/modules/auth/auth.router.js');
  const { usersRouter } = await import('@/modules/users/users.router.js');
  const { coursesRouter } = await import('@/modules/courses/courses.router.js');
  const { curriculumRouter } = await import('@/modules/sections/sections.router.js');
  const { lessonsRouter } = await import('@/modules/lessons/lessons.router.js');
  const { contentRouter } = await import('@/modules/content/content.router.js');
  const { promptsRouter } = await import('@/modules/prompts/prompts.router.js');
  const { enrollmentsRouter } = await import('@/modules/enrollments/enrollments.router.js');
  const { progressRouter } = await import('@/modules/progress/progress.router.js');
  const { quizzesRouter } = await import('@/modules/quizzes/quizzes.router.js');
  const { certificatesRouter } = await import('@/modules/certificates/certificates.router.js');
  const { paymentsRouter } = await import('@/modules/payments/payments.router.js');
  const { subscriptionsRouter } = await import('@/modules/subscriptions/subscriptions.router.js');
  const { promptLabRouter } = await import('@/modules/prompt-lab/prompt-lab.router.js');
  const { sandboxRouter } = await import('@/modules/sandbox/sandbox.router.js');
  const { capstoneRouter } = await import('@/modules/capstone/capstone.router.js');
  const { aiTutorRouter } = await import('@/modules/ai-tutor/ai-tutor.router.js');
  const { gamificationRouter } = await import('@/modules/gamification/gamification.router.js');
  const { liveSessionsRouter } = await import('@/modules/live-sessions/live-sessions.router.js');
  const { adminRouter } = await import('@/modules/admin/admin.router.js');
  const { metaRouter } = await import('@/modules/meta/meta.router.js');

  const app = express();

  app.use(helmet());
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:3000', 'https://cirostack.com', 'https://academy.cirostack.com', 'https://cirostackacademy.up.railway.app'];
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  // Raw body for webhook routes — must come before express.json()
  app.use('/v1/payments/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(apiLimiter);

  app.get('/', (_req, res) => {
    res.json({ name: 'CiroStack Academy API', version: '1.0.0', docs: '/v1' });
  });

  // Health check
  app.get('/health', async (_req, res) => {
    try {
      const { db } = await import('@/db/index.js');
      const { sql } = await import('drizzle-orm');
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'ok', db: 'ok' });
    } catch {
      res.status(503).json({ status: 'error', db: 'unreachable' });
    }
  });

  const v1 = express.Router();

  v1.use('/auth', authRouter);
  v1.use('/users', usersRouter);

  // Courses (public + instructor CRUD + learning paths — all on one router)
  v1.use('/courses', coursesRouter);
  v1.use('/learning-paths', coursesRouter);
  v1.use('/instructor', coursesRouter);  // /instructor/courses, /instructor/courses/:id/publish, etc.
  v1.use('/admin', coursesRouter);       // /admin/courses/:id/feature

  // Curriculum + sections
  v1.use('/', curriculumRouter);

  // Lessons
  v1.use('/', lessonsRouter);

  // Lesson content (video, written, code) + mux webhook
  v1.use('/', contentRouter);

  // Lesson prompts + user prompt library
  v1.use('/', promptsRouter);

  v1.use('/enrollments', enrollmentsRouter);
  v1.use('/progress', progressRouter);

  // Quizzes
  v1.use('/', quizzesRouter);

  v1.use('/certificates', certificatesRouter);

  // Payments (course checkout, invoices, webhooks, promo admin CRUD)
  v1.use('/payments', paymentsRouter);
  v1.use('/admin', paymentsRouter); // /admin/promo-codes

  v1.use('/subscriptions', subscriptionsRouter);

  v1.use('/prompt-lab', promptLabRouter);
  v1.use('/prompt-library', promptsRouter);

  v1.use('/sandbox', sandboxRouter);

  // Capstone (student + instructor)
  v1.use('/capstone', capstoneRouter);
  v1.use('/instructor', capstoneRouter);

  v1.use('/ai-tutor', aiTutorRouter);

  // Gamification (XP, badges, leaderboard)
  v1.use('/', gamificationRouter);

  v1.use('/live-sessions', liveSessionsRouter);
  v1.use('/instructor/live-sessions', liveSessionsRouter);

  // Admin (analytics, users, talent pipeline, instructor analytics)
  v1.use('/admin', adminRouter);
  v1.use('/instructor/analytics', adminRouter);

  // Meta Conversions API (pixel server-side events)
  v1.use('/meta', metaRouter);

  app.use('/v1', v1);
  app.use(errorHandler);

  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(PORT, () => {
    console.log(`[academy-api] listening on :${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[academy-api] startup failed:', err);
  process.exit(1);
});
