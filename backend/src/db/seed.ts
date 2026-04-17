import { loadSecrets } from '../config/secrets.js';
import { getDb } from './index.js';
import { users, courses, sections, lessons, badges, learningPaths, enrollments, lessonProgress, certificates, xpEvents } from './schema.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function seed() {
  await loadSecrets();
  const db = getDb();

  console.log('[seed] starting...');

  // ─── Users ───────────────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@cirostack.com',
      passwordHash: adminPassword,
      fullName: 'CiroStack Admin',
      username: 'cirostack_admin',
      role: 'admin',
      emailVerifiedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();
  console.log('[seed] admin:', admin?.id ?? 'already exists');

  const instructorPassword = await bcrypt.hash('Instructor@1234', 12);
  const [instructor] = await db
    .insert(users)
    .values({
      email: 'instructor@cirostack.com',
      passwordHash: instructorPassword,
      fullName: 'Tobi Adeyemi',
      username: 'tobi',
      role: 'instructor',
      emailVerifiedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();
  console.log('[seed] instructor:', instructor?.id ?? 'already exists');

  const studentPassword = await bcrypt.hash('Student@1234', 12);
  const [student] = await db
    .insert(users)
    .values({
      email: 'student@cirostack.com',
      passwordHash: studentPassword,
      fullName: 'Ada Okafor',
      username: 'ada',
      role: 'student',
      emailVerifiedAt: new Date(),
      xpTotal: 320,
      streakCurrent: 5,
      streakLastActivity: new Date().toISOString().slice(0, 10),
    })
    .onConflictDoNothing()
    .returning();
  console.log('[seed] student:', student?.id ?? 'already exists');

  const instructorId = instructor?.id ?? (
    await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, 'instructor@cirostack.com') })
  )?.id!;

  const studentId = student?.id ?? (
    await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, 'student@cirostack.com') })
  )?.id!;

  // ─── Learning path ─────────────────────────────────────────────────────────

  const [path] = await db
    .insert(learningPaths)
    .values({
      title: 'Full-Stack AI Developer',
      slug: 'full-stack-ai-developer',
      description: 'Go from zero to building AI-powered web apps. Master frontend, backend, and AI integration.',
      estimatedHours: 80,
      position: 0,
      isPublished: true,
    })
    .onConflictDoNothing()
    .returning();
  console.log('[seed] learning path:', path?.id ?? 'already exists');

  const pathId = path?.id ?? (
    await db.query.learningPaths.findFirst({ where: (lp, { eq }) => eq(lp.slug, 'full-stack-ai-developer') })
  )?.id;

  // ─── Courses ───────────────────────────────────────────────────────────────

  const courseData = [
    {
      title: 'AI-Assisted Frontend Development',
      slug: 'ai-assisted-frontend',
      description: 'Learn to build production-quality React apps using AI as a genuine coding partner. Master prompt engineering, AI debugging, and the split-view workflow.',
      whatYouLearn: [
        'Build React apps from scratch using AI-first workflow',
        'Write effective prompts for code generation and refactoring',
        'Understand AI output — not just copy-paste it',
        'Use Monaco Editor with AI suggestions inline',
        'Debug with Cipher AI Tutor step-by-step',
        'Ship a full capstone project to production',
      ],
      level: 'beginner' as const,
      category: 'web_dev' as const,
      priceNgn: 2900000,
      priceUsd: 2900,
      isPublished: true,
      isFeatured: true,
      hasAiVsManual: true,
      hasPromptLab: true,
      hasClientBrief: true,
      hasCapstone: true,
      enrolmentCount: 1847,
      ratingAverage: 4.8,
      ratingCount: 312,
      totalLessons: 10,
      totalDurationSecs: 28800,
      learningPathId: pathId,
      instructorId,
    },
    {
      title: 'Figma to Code with AI',
      slug: 'figma-to-code',
      description: 'Take any Figma design and turn it into pixel-perfect, responsive code using AI tools. Learn the modern design-to-dev workflow.',
      whatYouLearn: [
        'Export designs from Figma efficiently',
        'Use AI to generate component code from designs',
        'Build responsive layouts with Tailwind CSS',
        'Match designs pixel-perfectly',
      ],
      level: 'beginner' as const,
      category: 'ui_ux' as const,
      priceNgn: 1900000,
      priceUsd: 1900,
      isPublished: true,
      isFeatured: true,
      hasAiVsManual: false,
      hasPromptLab: true,
      hasClientBrief: true,
      hasCapstone: false,
      enrolmentCount: 900,
      ratingAverage: 4.7,
      ratingCount: 180,
      totalLessons: 8,
      totalDurationSecs: 18000,
      instructorId,
    },
    {
      title: 'Node.js + Drizzle + Postgres API',
      slug: 'nodejs-drizzle-postgres',
      description: 'Build type-safe REST APIs with Node.js, Drizzle ORM, and PostgreSQL. Deploy to production with best practices.',
      whatYouLearn: [
        'Set up a Node.js API with TypeScript',
        'Model data with Drizzle ORM',
        'Write migrations and seed scripts',
        'Implement JWT authentication',
        'Deploy to production',
      ],
      level: 'intermediate' as const,
      category: 'web_dev' as const,
      priceNgn: 2400000,
      priceUsd: 2400,
      isPublished: true,
      isFeatured: false,
      hasAiVsManual: true,
      hasPromptLab: false,
      hasClientBrief: false,
      hasCapstone: true,
      enrolmentCount: 654,
      ratingAverage: 4.9,
      ratingCount: 97,
      totalLessons: 12,
      totalDurationSecs: 32400,
      learningPathId: pathId,
      instructorId,
    },
    {
      title: 'React Architecture Patterns',
      slug: 'react-architecture',
      description: 'Go beyond basics. Learn the patterns that senior React engineers use to build scalable, maintainable applications.',
      whatYouLearn: [
        'Compound components and render props',
        'State management with Zustand',
        'Performance optimisation techniques',
        'Testing React components',
      ],
      level: 'intermediate' as const,
      category: 'web_dev' as const,
      priceNgn: 2200000,
      priceUsd: 2200,
      isPublished: true,
      isFeatured: true,
      hasAiVsManual: true,
      hasPromptLab: false,
      hasClientBrief: false,
      hasCapstone: true,
      enrolmentCount: 600,
      ratingAverage: 4.9,
      ratingCount: 90,
      totalLessons: 8,
      totalDurationSecs: 21600,
      instructorId,
    },
    {
      title: 'UI/UX Design Fundamentals',
      slug: 'ui-ux-fundamentals',
      description: 'Learn the principles of great UI/UX design. Go from blank canvas to polished product with real design systems.',
      whatYouLearn: [
        'Design principles and colour theory',
        'Build a design system in Figma',
        'User research and wireframing',
        'Prototype and user test your designs',
      ],
      level: 'beginner' as const,
      category: 'ui_ux' as const,
      priceNgn: 1500000,
      priceUsd: 1500,
      isPublished: true,
      isFeatured: false,
      hasAiVsManual: false,
      hasPromptLab: false,
      hasClientBrief: true,
      hasCapstone: false,
      enrolmentCount: 420,
      ratingAverage: 4.6,
      ratingCount: 68,
      totalLessons: 10,
      totalDurationSecs: 18000,
      instructorId,
    },
    {
      title: 'AI & ML for Web Developers',
      slug: 'ai-ml-for-web-devs',
      description: 'Integrate AI APIs into your web apps. Build features with OpenAI, Claude, and Gemini — no ML background needed.',
      whatYouLearn: [
        'Call LLM APIs from your web app',
        'Build a chatbot with streaming responses',
        'Image generation and analysis',
        'Prompt engineering for production',
        'Handle rate limits and costs',
      ],
      level: 'intermediate' as const,
      category: 'ai_ml' as const,
      priceNgn: 2700000,
      priceUsd: 2700,
      isPublished: true,
      isFeatured: true,
      hasAiVsManual: true,
      hasPromptLab: true,
      hasClientBrief: false,
      hasCapstone: true,
      enrolmentCount: 780,
      ratingAverage: 4.8,
      ratingCount: 143,
      totalLessons: 14,
      totalDurationSecs: 36000,
      instructorId,
    },
    {
      title: 'Cloud DevOps for Developers',
      slug: 'cloud-devops',
      description: 'Stop being blocked by ops. Learn Docker, CI/CD, and cloud deployment so you can ship without DevOps help.',
      whatYouLearn: [
        'Docker and docker-compose',
        'GitHub Actions CI/CD pipelines',
        'Deploy to Railway, Fly.io, and AWS',
        'Monitoring and alerting',
      ],
      level: 'intermediate' as const,
      category: 'cloud_devops' as const,
      priceNgn: 2000000,
      priceUsd: 2000,
      isPublished: true,
      isFeatured: false,
      hasAiVsManual: false,
      hasPromptLab: false,
      hasClientBrief: false,
      hasCapstone: true,
      enrolmentCount: 310,
      ratingAverage: 4.7,
      ratingCount: 52,
      totalLessons: 10,
      totalDurationSecs: 25200,
      instructorId,
    },
    {
      title: 'Build a SaaS Product from Scratch',
      slug: 'build-saas',
      description: 'End-to-end guide to building and launching a SaaS product. From idea validation to first paying customer.',
      whatYouLearn: [
        'Validate your idea quickly',
        'Build an MVP with Next.js and Drizzle',
        'Implement payments with Stripe/Paystack',
        'Launch on Product Hunt',
        'Acquire your first 100 users',
      ],
      level: 'advanced' as const,
      category: 'startups' as const,
      priceNgn: 3500000,
      priceUsd: 3500,
      isPublished: true,
      isFeatured: false,
      hasAiVsManual: false,
      hasPromptLab: false,
      hasClientBrief: true,
      hasCapstone: true,
      enrolmentCount: 230,
      ratingAverage: 4.8,
      ratingCount: 41,
      totalLessons: 18,
      totalDurationSecs: 54000,
      instructorId,
    },
  ];

  const insertedCourses: (typeof courses.$inferSelect)[] = [];
  for (const c of courseData) {
    const [inserted] = await db.insert(courses).values(c).onConflictDoNothing().returning();
    if (inserted) {
      insertedCourses.push(inserted);
      console.log('[seed] course:', inserted.slug);
    } else {
      const existing = await db.query.courses.findFirst({ where: eq(courses.slug, c.slug) });
      if (existing) insertedCourses.push(existing);
    }
  }

  // ─── Sections + lessons for first course ─────────────────────────────────

  const mainCourse = insertedCourses.find((c) => c.slug === 'ai-assisted-frontend');
  if (mainCourse) {
    const existingSections = await db.query.sections.findMany({
      where: eq(sections.courseId, mainCourse.id),
    });

    if (existingSections.length === 0) {
      const [sec1] = await db.insert(sections).values({ courseId: mainCourse.id, title: 'Getting started', position: 0, isFreePreview: true }).returning();
      const [sec2] = await db.insert(sections).values({ courseId: mainCourse.id, title: 'React fundamentals the AI way', position: 1, isFreePreview: false }).returning();
      const [sec3] = await db.insert(sections).values({ courseId: mainCourse.id, title: 'State management with AI assistance', position: 2, isFreePreview: false }).returning();
      const [sec4] = await db.insert(sections).values({ courseId: mainCourse.id, title: 'Ship It — Capstone Project', position: 3, isFreePreview: false }).returning();

      await db.insert(lessons).values([
        { sectionId: sec1.id, title: 'Welcome & course overview', type: 'video', position: 0, xpReward: 10, isFreePreview: true, durationSecs: 480 },
        { sectionId: sec1.id, title: 'Setting up your AI-first dev environment', type: 'written', position: 1, xpReward: 10, isFreePreview: true },
        { sectionId: sec1.id, title: 'Module quiz', type: 'quiz', position: 2, xpReward: 30 },
        { sectionId: sec2.id, title: 'Components & props — generate with AI, understand manually', type: 'video', position: 0, xpReward: 20, durationSecs: 1800 },
        { sectionId: sec2.id, title: 'AI vs Manual: building a card component', type: 'code', position: 1, xpReward: 30 },
        { sectionId: sec2.id, title: 'Steal the Prompt: component generation prompts', type: 'prompt_lab', position: 2, xpReward: 40 },
        { sectionId: sec3.id, title: 'Zustand stores with AI generation', type: 'video', position: 0, xpReward: 20, durationSecs: 2400 },
        { sectionId: sec3.id, title: 'Debugging state bugs with Cipher AI Tutor', type: 'ai_debug', position: 1, xpReward: 50 },
        { sectionId: sec4.id, title: 'Client brief: build a task management SaaS', type: 'client_brief', position: 0, xpReward: 100 },
        { sectionId: sec4.id, title: 'Deploy and submit your capstone', type: 'capstone', position: 1, xpReward: 200 },
      ]);
      console.log('[seed] sections + lessons created for', mainCourse.slug);
    }
  }

  // ─── Student enrollment + partial progress ─────────────────────────────────

  if (studentId && mainCourse) {
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId: studentId, courseId: mainCourse.id, progressPercent: 20 })
      .onConflictDoNothing()
      .returning();

    if (enrollment) {
      // Mark first two lessons complete
      const firstSections = await db.query.sections.findMany({
        where: eq(sections.courseId, mainCourse.id),
        with: { lessons: true },
      });
      const firstLesson = firstSections[0]?.lessons?.[0];
      const secondLesson = firstSections[0]?.lessons?.[1];

      if (firstLesson) {
        await db.insert(lessonProgress).values({ userId: studentId, lessonId: firstLesson.id, completedAt: new Date() }).onConflictDoNothing();
        await db.insert(xpEvents).values({ userId: studentId, eventType: 'lesson_complete', xpAmount: firstLesson.xpReward, referenceId: firstLesson.id }).onConflictDoNothing();
      }
      if (secondLesson) {
        await db.insert(lessonProgress).values({ userId: studentId, lessonId: secondLesson.id, completedAt: new Date() }).onConflictDoNothing();
        await db.insert(xpEvents).values({ userId: studentId, eventType: 'lesson_complete', xpAmount: secondLesson.xpReward, referenceId: secondLesson.id }).onConflictDoNothing();
      }
      console.log('[seed] student enrollment + progress created');
    }
  }

  // ─── Certificate for student (react-architecture course) ──────────────────

  const reactCourse = insertedCourses.find((c) => c.slug === 'react-architecture');
  if (studentId && reactCourse) {
    const [completedEnrollment] = await db
      .insert(enrollments)
      .values({ userId: studentId, courseId: reactCourse.id, progressPercent: 100, completedAt: new Date() })
      .onConflictDoNothing()
      .returning();

    if (completedEnrollment) {
      await db
        .insert(certificates)
        .values({
          userId: studentId,
          courseId: reactCourse.id,
          verificationCode: `CIRO-2025-REACT-${randomUUID().slice(0, 4).toUpperCase()}`,
        })
        .onConflictDoNothing();
      console.log('[seed] certificate created');
    }
  }

  // ─── Badges ───────────────────────────────────────────────────────────────

  await db
    .insert(badges)
    .values([
      { name: '7-Day Streak', description: 'Learned for 7 days in a row', imageUrl: '🔥', conditionType: 'streak', conditionValue: 7 },
      { name: '30-Day Streak', description: 'Learned for 30 days in a row', imageUrl: '🔥', conditionType: 'streak', conditionValue: 30 },
      { name: '100-Day Streak', description: 'Learned for 100 days in a row', imageUrl: '🏆', conditionType: 'streak', conditionValue: 100 },
      { name: 'First Course Complete', description: 'Completed your first course', imageUrl: '🎓', conditionType: 'course_complete', conditionValue: 1 },
      { name: 'Prompt Master', description: 'Scored 90+ in Prompt Lab', imageUrl: '⚡', conditionType: 'prompt_lab', conditionValue: 1 },
      { name: 'Ship It', description: 'Had a capstone project approved', imageUrl: '🚀', conditionType: 'capstone', conditionValue: 1 },
      { name: 'Rising Star', description: 'Reached 500 XP', imageUrl: '⭐', conditionType: 'xp_threshold', conditionValue: 500 },
      { name: 'Expert', description: 'Reached 5000 XP', imageUrl: '💎', conditionType: 'xp_threshold', conditionValue: 5000 },
    ])
    .onConflictDoNothing();
  console.log('[seed] badges seeded');

  console.log('\n[seed] complete ✓');
  console.log('─────────────────────────────────');
  console.log('  Admin:      admin@cirostack.com     / Admin@1234');
  console.log('  Instructor: instructor@cirostack.com / Instructor@1234');
  console.log('  Student:    student@cirostack.com   / Student@1234');
  console.log('─────────────────────────────────');

  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] error:', err);
  process.exit(1);
});
