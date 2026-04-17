import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  char,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: varchar('role', { length: 20 }).notNull().default('student'),
  countryCode: char('country_code', { length: 2 }).notNull().default('NG'),
  currency: char('currency', { length: 3 }).notNull().default('NGN'),
  languagePreference: varchar('language_preference', { length: 10 }).notNull().default('en'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  emailVerifyToken: varchar('email_verify_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at', { withTimezone: true }),
  googleOauthId: varchar('google_oauth_id', { length: 255 }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  paystackCustomerCode: varchar('paystack_customer_code', { length: 255 }).unique(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  xpTotal: integer('xp_total').notNull().default(0),
  streakCurrent: integer('streak_current').notNull().default(0),
  streakLastActivity: date('streak_last_activity'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  onboardingAnswers: jsonb('onboarding_answers'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: index('idx_users_email').on(t.email),
  usernameIdx: index('idx_users_username').on(t.username),
  roleIdx: index('idx_users_role').on(t.role),
}));

// ─── learning_paths ───────────────────────────────────────────────────────────

export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  estimatedHours: integer('estimated_hours'),
  position: integer('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── courses ─────────────────────────────────────────────────────────────────

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  whatYouLearn: jsonb('what_you_learn').notNull().default(sql`'[]'::jsonb`),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  trailerMuxId: varchar('trailer_mux_id', { length: 255 }),
  instructorId: uuid('instructor_id').notNull().references(() => users.id),
  learningPathId: uuid('learning_path_id').references(() => learningPaths.id),
  level: varchar('level', { length: 20 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  priceNgn: integer('price_ngn').notNull().default(0),
  priceUsd: integer('price_usd').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  hasAiVsManual: boolean('has_ai_vs_manual').notNull().default(false),
  hasPromptLab: boolean('has_prompt_lab').notNull().default(false),
  hasClientBrief: boolean('has_client_brief').notNull().default(false),
  hasCapstone: boolean('has_capstone').notNull().default(false),
  whatsappGroupUrl: varchar('whatsapp_group_url', { length: 500 }),
  totalLessons: integer('total_lessons').notNull().default(0),
  totalDurationSecs: integer('total_duration_secs').notNull().default(0),
  enrolmentCount: integer('enrolment_count').notNull().default(0),
  ratingAverage: numeric('rating_average', { precision: 3, scale: 2 }).notNull().default('0'),
  ratingCount: integer('rating_count').notNull().default(0),
  firstPublishedAt: timestamp('first_published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  slugIdx: index('idx_courses_slug').on(t.slug),
  categoryIdx: index('idx_courses_category').on(t.category),
  levelIdx: index('idx_courses_level').on(t.level),
  instructorIdx: index('idx_courses_instructor').on(t.instructorId),
  publishedIdx: index('idx_courses_published').on(t.isPublished),
}));

// ─── sections ────────────────────────────────────────────────────────────────

export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  position: integer('position').notNull().default(0),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  courseIdx: index('idx_sections_course').on(t.courseId, t.position),
}));

// ─── lessons ─────────────────────────────────────────────────────────────────

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  position: integer('position').notNull().default(0),
  type: varchar('type', { length: 30 }).notNull(),
  durationSecs: integer('duration_secs'),
  xpReward: integer('xp_reward').notNull().default(10),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  sectionIdx: index('idx_lessons_section').on(t.sectionId, t.position),
  typeIdx: index('idx_lessons_type').on(t.type),
}));

// ─── lesson_video_content ─────────────────────────────────────────────────────

export const lessonVideoContent = pgTable('lesson_video_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }).unique(),
  muxAssetId: varchar('mux_asset_id', { length: 255 }).notNull(),
  muxPlaybackId: varchar('mux_playback_id', { length: 255 }).notNull(),
  transcript: text('transcript'),
  chapters: jsonb('chapters').notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── lesson_written_content ───────────────────────────────────────────────────

export const lessonWrittenContent = pgTable('lesson_written_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }).unique(),
  contentMd: text('content_md').notNull(),
  contentPidginMd: text('content_pidgin_md'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── lesson_code_content ──────────────────────────────────────────────────────

export const lessonCodeContent = pgTable('lesson_code_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }).unique(),
  starterCode: text('starter_code').notNull(),
  solutionCode: text('solution_code').notNull(),
  manualSolution: text('manual_solution'),
  language: varchar('language', { length: 30 }).notNull(),
  testCases: jsonb('test_cases').notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── lesson_prompts ───────────────────────────────────────────────────────────

export const lessonPrompts = pgTable('lesson_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  promptText: text('prompt_text').notNull(),
  modelUsed: varchar('model_used', { length: 20 }).notNull(),
  contextNote: varchar('context_note', { length: 500 }),
  tag: varchar('tag', { length: 30 }).notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  lessonIdx: index('idx_lesson_prompts_lesson').on(t.lessonId, t.position),
}));

// ─── quiz_questions ───────────────────────────────────────────────────────────

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  options: jsonb('options'),
  correctAnswer: text('correct_answer'),
  gradingRubric: text('grading_rubric'),
  points: integer('points').notNull().default(10),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  lessonIdx: index('idx_quiz_questions_lesson').on(t.lessonId, t.position),
}));

// ─── enrollments ─────────────────────────────────────────────────────────────

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  paymentId: uuid('payment_id'),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => ({
  uqUserCourse: uniqueIndex('uq_enrollments_user_course').on(t.userId, t.courseId),
  userIdx: index('idx_enrollments_user').on(t.userId),
  courseIdx: index('idx_enrollments_course').on(t.courseId),
}));

// ─── lesson_progress ──────────────────────────────────────────────────────────

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  lastPositionSecs: integer('last_position_secs').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uqUserLesson: uniqueIndex('uq_lesson_progress_user_lesson').on(t.userId, t.lessonId),
  userIdx: index('idx_lesson_progress_user').on(t.userId),
  lessonIdx: index('idx_lesson_progress_lesson').on(t.lessonId),
}));

// ─── quiz_attempts ────────────────────────────────────────────────────────────

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  score: integer('score').notNull().default(0),
  maxScore: integer('max_score').notNull(),
  passed: boolean('passed').notNull().default(false),
  answers: jsonb('answers').notNull().default(sql`'[]'::jsonb`),
  aiFeedback: text('ai_feedback'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => ({
  userLessonIdx: index('idx_quiz_attempts_user_lesson').on(t.userId, t.lessonId),
}));

// ─── certificates ─────────────────────────────────────────────────────────────

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  verificationCode: varchar('verification_code', { length: 32 }).notNull().unique(),
  pdfUrl: varchar('pdf_url', { length: 500 }),
}, (t) => ({
  uqUserCourse: uniqueIndex('uq_certificates_user_course').on(t.userId, t.courseId),
}));

// ─── subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  plan: varchar('plan', { length: 20 }).notNull(),
  currency: char('currency', { length: 3 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  pauseCollectionUntil: timestamp('pause_collection_until', { withTimezone: true }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  paystackSubscriptionCode: varchar('paystack_subscription_code', { length: 255 }).unique(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelReason: varchar('cancel_reason', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── promo_codes ──────────────────────────────────────────────────────────────

export const promoCodes = pgTable('promo_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  value: integer('value').notNull(),
  currency: char('currency', { length: 3 }),
  courseId: uuid('course_id').references(() => courses.id),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').references(() => courses.id),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  promoCodeId: uuid('promo_code_id').references(() => promoCodes.id),
  amount: integer('amount').notNull(),
  currency: char('currency', { length: 3 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerReference: varchar('provider_reference', { length: 255 }).notNull(),
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('idx_payments_user').on(t.userId),
  statusIdx: index('idx_payments_status').on(t.status),
  referenceIdx: index('idx_payments_reference').on(t.providerReference),
}));

// ─── user_prompt_library ──────────────────────────────────────────────────────

export const userPromptLibrary = pgTable('user_prompt_library', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  sourcePromptId: uuid('source_prompt_id').references(() => lessonPrompts.id),
  promptText: text('prompt_text').notNull(),
  modelUsed: varchar('model_used', { length: 20 }).notNull(),
  tag: varchar('tag', { length: 30 }),
  customLabel: varchar('custom_label', { length: 100 }),
  isCustom: boolean('is_custom').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('idx_prompt_library_user').on(t.userId),
}));

// ─── prompt_lab_attempts ──────────────────────────────────────────────────────

export const promptLabAttempts = pgTable('prompt_lab_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  promptText: text('prompt_text').notNull(),
  modelUsed: varchar('model_used', { length: 20 }).notNull(),
  output: text('output').notNull(),
  precisionScore: integer('precision_score').notNull(),
  efficiencyScore: integer('efficiency_score').notNull(),
  completionScore: integer('completion_score').notNull(),
  totalScore: integer('total_score').notNull(),
  scoringRationale: text('scoring_rationale'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userLessonIdx: index('idx_prompt_lab_user_lesson').on(t.userId, t.lessonId),
}));

// ─── capstone_projects ────────────────────────────────────────────────────────

export const capstoneProjects = pgTable('capstone_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  liveUrl: varchar('live_url', { length: 500 }).notNull(),
  githubUrl: varchar('github_url', { length: 500 }),
  screenshotUrl: varchar('screenshot_url', { length: 500 }),
  techStack: jsonb('tech_stack').notNull().default(sql`'[]'::jsonb`),
  isPublic: boolean('is_public').notNull().default(false),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  instructorScore: integer('instructor_score'),
  instructorFeedback: text('instructor_feedback'),
  isTalentPipelineFlagged: boolean('is_talent_pipeline_flagged').notNull().default(false),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
}, (t) => ({
  uqUserCourse: uniqueIndex('uq_capstone_user_course').on(t.userId, t.courseId),
  statusIdx: index('idx_capstone_status').on(t.status),
  pipelineIdx: index('idx_capstone_pipeline').on(t.isTalentPipelineFlagged),
}));

// ─── talent_pipeline ──────────────────────────────────────────────────────────

export const talentPipeline = pgTable('talent_pipeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  capstoneProjectId: uuid('capstone_project_id').notNull().references(() => capstoneProjects.id),
  skillTags: jsonb('skill_tags').notNull().default(sql`'[]'::jsonb`),
  status: varchar('status', { length: 20 }).notNull().default('flagged'),
  referredToOrionAt: timestamp('referred_to_orion_at', { withTimezone: true }),
  orionEventId: varchar('orion_event_id', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── xp_events ───────────────────────────────────────────────────────────────

export const xpEvents = pgTable('xp_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  xpAmount: integer('xp_amount').notNull(),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index('idx_xp_events_user').on(t.userId),
}));

// ─── badges ───────────────────────────────────────────────────────────────────

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  conditionType: varchar('condition_type', { length: 30 }).notNull(),
  conditionValue: integer('condition_value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── user_badges ──────────────────────────────────────────────────────────────

export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  badgeId: uuid('badge_id').notNull().references(() => badges.id),
  earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uqUserBadge: uniqueIndex('uq_user_badges').on(t.userId, t.badgeId),
}));

// ─── live_sessions ────────────────────────────────────────────────────────────

export const liveSessions = pgTable('live_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(90),
  streamUrl: varchar('stream_url', { length: 500 }),
  recordingUrl: varchar('recording_url', { length: 500 }),
  courseId: uuid('course_id').references(() => courses.id),
  instructorId: uuid('instructor_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── ai_tutor_conversations ───────────────────────────────────────────────────

export const aiTutorConversations = pgTable('ai_tutor_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  messages: jsonb('messages').notNull().default(sql`'[]'::jsonb`),
  modelUsed: varchar('model_used', { length: 20 }).notNull().default('claude'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uqUserLesson: uniqueIndex('uq_ai_tutor_user_lesson').on(t.userId, t.lessonId),
  userLessonIdx: index('idx_ai_tutor_user_lesson').on(t.userId, t.lessonId),
}));

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  lessonProgress: many(lessonProgress),
  xpEvents: many(xpEvents),
  userBadges: many(userBadges),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  payments: many(payments),
  capstoneProjects: many(capstoneProjects),
  aiTutorConversations: many(aiTutorConversations),
  userPromptLibrary: many(userPromptLibrary),
  promptLabAttempts: many(promptLabAttempts),
  talentPipeline: many(talentPipeline),
  liveSessions: many(liveSessions),
  quizAttempts: many(quizAttempts),
}));

export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  learningPath: one(learningPaths, { fields: [courses.learningPathId], references: [learningPaths.id] }),
  sections: many(sections),
  enrollments: many(enrollments),
  certificates: many(certificates),
  capstoneProjects: many(capstoneProjects),
  payments: many(payments),
  promoCodes: many(promoCodes),
  liveSessions: many(liveSessions),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  videoContent: one(lessonVideoContent, { fields: [lessons.id], references: [lessonVideoContent.lessonId] }),
  writtenContent: one(lessonWrittenContent, { fields: [lessons.id], references: [lessonWrittenContent.lessonId] }),
  codeContent: one(lessonCodeContent, { fields: [lessons.id], references: [lessonCodeContent.lessonId] }),
  prompts: many(lessonPrompts),
  quizQuestions: many(quizQuestions),
  lessonProgress: many(lessonProgress),
  quizAttempts: many(quizAttempts),
  aiTutorConversations: many(aiTutorConversations),
  promptLabAttempts: many(promptLabAttempts),
}));

export const lessonVideoContentRelations = relations(lessonVideoContent, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonVideoContent.lessonId], references: [lessons.id] }),
}));

export const lessonWrittenContentRelations = relations(lessonWrittenContent, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonWrittenContent.lessonId], references: [lessons.id] }),
}));

export const lessonCodeContentRelations = relations(lessonCodeContent, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonCodeContent.lessonId], references: [lessons.id] }),
}));

export const lessonPromptsRelations = relations(lessonPrompts, ({ one, many }) => ({
  lesson: one(lessons, { fields: [lessonPrompts.lessonId], references: [lessons.id] }),
  userPromptLibrary: many(userPromptLibrary),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  lesson: one(lessons, { fields: [quizQuestions.lessonId], references: [lessons.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [quizAttempts.lessonId], references: [lessons.id] }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, { fields: [certificates.userId], references: [users.id] }),
  course: one(courses, { fields: [certificates.courseId], references: [courses.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const promoCodesRelations = relations(promoCodes, ({ one }) => ({
  course: one(courses, { fields: [promoCodes.courseId], references: [courses.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  course: one(courses, { fields: [payments.courseId], references: [courses.id] }),
  subscription: one(subscriptions, { fields: [payments.subscriptionId], references: [subscriptions.id] }),
  promoCode: one(promoCodes, { fields: [payments.promoCodeId], references: [promoCodes.id] }),
}));

export const userPromptLibraryRelations = relations(userPromptLibrary, ({ one }) => ({
  user: one(users, { fields: [userPromptLibrary.userId], references: [users.id] }),
  sourcePrompt: one(lessonPrompts, { fields: [userPromptLibrary.sourcePromptId], references: [lessonPrompts.id] }),
}));

export const promptLabAttemptsRelations = relations(promptLabAttempts, ({ one }) => ({
  user: one(users, { fields: [promptLabAttempts.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [promptLabAttempts.lessonId], references: [lessons.id] }),
}));

export const capstoneProjectsRelations = relations(capstoneProjects, ({ one }) => ({
  user: one(users, { fields: [capstoneProjects.userId], references: [users.id] }),
  course: one(courses, { fields: [capstoneProjects.courseId], references: [courses.id] }),
  talentPipeline: one(talentPipeline, { fields: [capstoneProjects.id], references: [talentPipeline.capstoneProjectId] }),
}));

export const talentPipelineRelations = relations(talentPipeline, ({ one }) => ({
  user: one(users, { fields: [talentPipeline.userId], references: [users.id] }),
  capstoneProject: one(capstoneProjects, { fields: [talentPipeline.capstoneProjectId], references: [capstoneProjects.id] }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, { fields: [xpEvents.userId], references: [users.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

export const liveSessionsRelations = relations(liveSessions, ({ one }) => ({
  instructor: one(users, { fields: [liveSessions.instructorId], references: [users.id] }),
  course: one(courses, { fields: [liveSessions.courseId], references: [courses.id] }),
}));

export const aiTutorConversationsRelations = relations(aiTutorConversations, ({ one }) => ({
  user: one(users, { fields: [aiTutorConversations.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [aiTutorConversations.lessonId], references: [lessons.id] }),
}));
