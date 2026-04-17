// CiroStack Academy — TypeScript types
// Mirrors Ferro architecture spec exactly

// ─── Core entities ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  role: 'student' | 'instructor' | 'admin';
  countryCode: string;
  currency: 'NGN' | 'USD';
  languagePreference: 'en' | 'pcm';
  emailVerifiedAt: string | null;
  xpTotal: number;
  streakCurrent: number;
  streakLastActivity: string | null;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  whatYouLearn: string[];
  thumbnailUrl: string;
  trailerMuxId: string | null;
  instructorId: string;
  instructor?: InstructorProfile;
  learningPathId: string | null;
  level: CourseLevel;
  category: CourseCategory;
  priceNgn: number;
  priceUsd: number;
  isPublished: boolean;
  isFeatured: boolean;
  hasAiVsManual: boolean;
  hasPromptLab: boolean;
  hasClientBrief: boolean;
  hasCapstone: boolean;
  whatsappGroupUrl: string | null;
  totalLessons: number;
  totalDurationSecs: number;
  enrolmentCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type CourseCategory =
  | 'ui_ux'
  | 'web_dev'
  | 'mobile'
  | 'ai_ml'
  | 'cloud_devops'
  | 'architecture'
  | 'startups';

export interface InstructorProfile {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  bio?: string;
  courseCount?: number;
  studentCount?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  estimatedHours: number;
  courses: Course[];
  isPublished: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  position: number;
  isFreePreview: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  position: number;
  type: LessonType;
  durationSecs: number | null;
  xpReward: number;
  isFreePreview: boolean;
  completed?: boolean;
}

export type LessonType =
  | 'video'
  | 'written'
  | 'code'
  | 'quiz'
  | 'prompt_lab'
  | 'ai_debug'
  | 'client_brief'
  | 'capstone';

// ─── Lesson content ──────────────────────────────────────────────────────────

export interface VideoContent {
  lessonId: string;
  muxAssetId: string;
  muxPlaybackId: string;
  muxToken: string;
  transcript: string | null;
  chapters: VideoChapter[];
}

export interface VideoChapter {
  timeSecs: number;
  title: string;
}

export interface WrittenContent {
  lessonId: string;
  contentMd: string;
  hasPidginVariant: boolean;
}

export interface CodeContent {
  lessonId: string;
  starterCode: string;
  solutionCode: string;
  manualSolution: string | null;
  language: CodeLanguage;
  testCases: TestCase[];
}

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'dart'
  | 'bash'
  | 'go'
  | 'rust';

export interface TestCase {
  input: string;
  expectedOutput: string;
  label?: string;
}

export interface LessonPrompt {
  id: string;
  lessonId: string;
  promptText: string;
  modelUsed: AiModel;
  contextNote: string | null;
  tag: PromptTag;
  position: number;
}

export type AiModel = 'claude' | 'gpt4' | 'gemini' | 'copilot';

export type PromptTag =
  | 'architecture'
  | 'debugging'
  | 'refactor'
  | 'generation'
  | 'review'
  | 'explanation'
  | 'testing';

// ─── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  lessonId: string;
  questionText: string;
  type: 'multiple_choice' | 'code_challenge' | 'open_answer';
  options: string[] | null;
  points: number;
  position: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: QuizAnswer[];
  aiFeedback: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

// ─── Progress & enrollment ───────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  lastAccessedLessonId: string | null;
  course?: Course;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  completedAt: string | null;
  notes: string | null;
  lastPositionSecs: number;
}

export interface CourseProgressMap {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: Record<string, LessonProgress>;
}

// ─── Certificates ────────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  verificationCode: string;
  pdfUrl: string | null;
  course?: Pick<Course, 'title' | 'thumbnailUrl' | 'level'>;
}

// ─── Payments & billing ──────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'annual';
  currency: 'NGN' | 'USD';
  status: 'active' | 'cancelled' | 'past_due' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string | null;
  subscriptionId: string | null;
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  provider: 'stripe' | 'paystack';
  providerReference: string;
  invoiceUrl: string | null;
  createdAt: string;
}

export interface CheckoutResponse {
  paymentId: string;
  paymentUrl: string;
  provider: 'stripe' | 'paystack';
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency: 'NGN' | 'USD' | null;
  courseId: string | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

// ─── Unique features ─────────────────────────────────────────────────────────

export interface PromptLabAttempt {
  id: string;
  userId: string;
  lessonId: string;
  promptText: string;
  modelUsed: AiModel;
  output: string;
  precisionScore: number;
  efficiencyScore: number;
  completionScore: number;
  totalScore: number;
  scoringRationale: string | null;
  createdAt: string;
}

export interface UserPromptLibraryItem {
  id: string;
  userId: string;
  sourcePromptId: string | null;
  promptText: string;
  modelUsed: AiModel;
  tag: PromptTag | null;
  customLabel: string | null;
  isCustom: boolean;
  createdAt: string;
}

export interface CapstoneProject {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  description: string;
  liveUrl: string;
  githubUrl: string | null;
  screenshotUrl: string | null;
  techStack: string[];
  isPublic: boolean;
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  instructorScore: number | null;
  instructorFeedback: string | null;
  isTalentPipelineFlagged: boolean;
  submittedAt: string;
  reviewedAt: string | null;
  course?: Pick<Course, 'title' | 'slug'>;
}

export interface TalentPipelineEntry {
  id: string;
  userId: string;
  capstoneProjectId: string;
  skillTags: string[];
  status: 'flagged' | 'referred' | 'engaged' | 'hired';
  referredToOrionAt: string | null;
  orionEventId: string | null;
  notes: string | null;
  createdAt: string;
  user?: Pick<User, 'fullName' | 'email' | 'username' | 'avatarUrl'>;
  capstoneProject?: CapstoneProject;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface XpSummary {
  userId: string;
  xpTotal: number;
  level: number;
  xpToNextLevel: number;
  streakCurrent: number;
  streakLastActivity: string | null;
  recentEvents: XpEvent[];
}

export interface XpEvent {
  id: string;
  eventType: XpEventType;
  xpAmount: number;
  referenceId: string | null;
  createdAt: string;
}

export type XpEventType =
  | 'lesson_complete'
  | 'quiz_pass'
  | 'capstone_approved'
  | 'streak_milestone'
  | 'prompt_lab_score'
  | 'debug_arena_win'
  | 'course_complete';

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  conditionType: string;
  conditionValue: number;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  xpTotal: number;
  level: number;
  streakCurrent: number;
}

// ─── AI Tutor ────────────────────────────────────────────────────────────────

export interface AiTutorMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiTutorConversation {
  id: string;
  userId: string;
  lessonId: string;
  messages: AiTutorMessage[];
  modelUsed: AiModel;
  updatedAt: string;
}

// ─── Live sessions ───────────────────────────────────────────────────────────

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  streamUrl: string | null;
  recordingUrl: string | null;
  courseId: string | null;
}

// ─── API response wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// ─── Catalog query params ────────────────────────────────────────────────────

export interface CourseCatalogParams {
  category?: CourseCategory;
  level?: CourseLevel;
  priceMax?: number;
  isFree?: boolean;
  sort?: 'popular' | 'newest' | 'rating' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
  q?: string;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingAnswer {
  skillLevel: 'complete_beginner' | 'some_experience' | 'professional';
  learningGoal: 'get_hired' | 'freelance' | 'side_project' | 'upskill';
  topics: CourseCategory[];
}
