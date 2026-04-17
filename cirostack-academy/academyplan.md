# CiroStack Academy — Implementation Plan

> Volt (Next.js frontend agent) implementation roadmap.
> Backend: Ferro spec in `ferro_academy_spec.md`. Screens: `nova_figma_screen_list.html`.

---

## Project location

```
C:\Users\USER\Desktop\cirostackacademy\cirostack-academy\
```

---

## Phase 1 — Foundation (do first, everything depends on this)

### 1.1 Config files
- [ ] `package.json` — Next.js 15, React 19, Zustand 5, Tailwind v4, Lucide, Framer Motion
- [ ] `next.config.ts` — image domains (Mux, S3), headers
- [ ] `tsconfig.json` — strict, `@/*` alias
- [ ] `postcss.config.mjs` — `@tailwindcss/postcss`
- [ ] `.env.local` — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`
- [ ] `eslint.config.mjs`

### 1.2 Global styles
- [ ] `src/app/globals.css` — CSS variables (light/dark tokens), `@theme` block, keyframes, body/heading fonts
- [ ] `src/app/layout.tsx` — root layout with ThemeProvider, ToastContainer, FOUC-prevention script

### 1.3 Core types
- [ ] `src/types/index.ts` — all TypeScript interfaces from Ferro spec (User, Course, Lesson, Enrollment, etc.)

### 1.4 Providers
- [ ] `src/lib/providers/ThemeProvider.tsx` — reads `useThemeStore`, applies `.dark` to `<html>`

### 1.5 API client
- [ ] `src/lib/api/client.ts` — `apiGet`, `apiPost`, `apiPatch`, `apiDelete` — reads token from `useAuthStore`

---

## Phase 2 — State Management

### Zustand stores (all in `src/lib/store/`)
- [ ] `useThemeStore.ts` — `light | dark | system`, persisted as `academy-theme`
- [ ] `useAuthStore.ts` — `user`, `isLoggedIn`, `token`, `login()`, `logout()`, persisted as `academy-auth`
- [ ] `usePlayerStore.ts` — `activeLessonId`, `activeTab`, `isSidebarOpen`, `isAiDrawerOpen`, `notes`
- [ ] `useAiTutorStore.ts` — `conversations: Record<lessonId, AiTutorMessage[]>`, `isLoading`
- [ ] `useToastStore.ts` — `toasts[]`, `show()`, `dismiss()` + `toast.success/error/warning/info` helpers
- [ ] `useCheckoutStore.ts` — `courseId`, `plan`, `promoCode`, `promoDiscount`

---

## Phase 3 — Config

- [ ] `src/config/nav.ts` — sidebar nav items per role (student, instructor, admin), public nav items, page title map
- [ ] `src/middleware.ts` — cookie-based route protection for `/dashboard/*`, `/instructor/*`, `/admin/*`

---

## Phase 4 — UI Components (`src/components/ui/`)

All primitive components (no business logic):

- [ ] `Button.tsx` — primary, outline, ghost, destructive; all sizes; loading spinner state
- [ ] `Input.tsx` — with label, error message, icon slot
- [ ] `PasswordInput.tsx` — show/hide toggle
- [ ] `Badge.tsx` — variants: default, success, warning, danger, blue, purple, outline
- [ ] `LevelBadge.tsx` — beginner (green) / intermediate (amber) / advanced (red)
- [ ] `ProgressBar.tsx` — with label and percentage
- [ ] `Skeleton.tsx` — animated pulse loader
- [ ] `Modal.tsx` — overlay, close on outside click, escape key
- [ ] `ToastContainer.tsx` — fixed bottom-right, reads `useToastStore`
- [ ] `Avatar.tsx` — with fallback initials
- [ ] `Tabs.tsx` — controlled tabs with underline or pill variants
- [ ] `Tooltip.tsx` — hover tooltip

---

## Phase 5 — Layout Components (`src/components/layout/`)

- [ ] `Navbar.tsx` — public nav: logo, nav links, login/signup buttons (or avatar if logged in); mobile hamburger; theme toggle
- [ ] `Footer.tsx` — public footer: links, social icons, CiroStack branding
- [ ] `AuthLayout.tsx` — centered card layout for all `/auth/*` pages
- [ ] `DashboardShell.tsx` — `DashboardSidebar` + top nav + children
- [ ] `DashboardSidebar.tsx` — role-based nav items, XP bar + streak, collapse on mobile
- [ ] `DashboardTopNav.tsx` — page title, breadcrumb, notifications, avatar dropdown
- [ ] `InstructorShell.tsx` — instructor layout variant
- [ ] `AdminShell.tsx` — admin layout variant

---

## Phase 6 — Course Components (`src/components/course/`)

- [ ] `CourseCard.tsx` — thumbnail, title, instructor, rating, price, level badge, enrolled/completed states
- [ ] `CourseCatalogFilter.tsx` — filter sidebar: category chips, level radio, price range, duration
- [ ] `CourseCurriculum.tsx` — accordion sections, lesson list with type icons, locked/unlocked, duration
- [ ] `CourseEnrolCta.tsx` — sticky sidebar: price, enrol button, features list, money-back note
- [ ] `CourseReviews.tsx` — rating breakdown, review list
- [ ] `LearningPathCard.tsx` — path card with course sequence timeline

---

## Phase 7 — Player Components (`src/components/player/`)

- [ ] `LessonSidebar.tsx` — collapsible lesson tree, completion checkmarks, active lesson highlight
- [ ] `VideoPlayer.tsx` — Mux player embed, chapter markers overlay
- [ ] `WrittenContent.tsx` — Markdown renderer, code block syntax highlight, "explain this line" hover
- [ ] `CodeSandbox.tsx` — Monaco editor + output console, run button, reset, language selector
- [ ] `AiVsManualToggle.tsx` — split-pane view for code lessons
- [ ] `StealThePromptPanel.tsx` — prompt list with copy + save-to-library
- [ ] `QuizPlayer.tsx` — question cards (multiple choice / code challenge / short answer), progress indicator
- [ ] `QuizResults.tsx` — score, pass/fail, question breakdown
- [ ] `AiTutorDrawer.tsx` — slide-in chat panel, reads `useAiTutorStore`
- [ ] `PromptLab.tsx` — prompt input, model selector, run output, score breakdown
- [ ] `LessonCompleteModal.tsx` — XP earned, next lesson CTA

---

## Phase 8 — Dashboard Components (`src/components/dashboard/`)

- [ ] `StreakCalendar.tsx` — GitHub-style heatmap calendar
- [ ] `XpBar.tsx` — level + progress to next level
- [ ] `CourseProgressCard.tsx` — enrolled course with progress bar and resume button
- [ ] `CertificateCard.tsx` — certificate preview, download PDF, share to LinkedIn
- [ ] `CapstoneProjectCard.tsx` — project with live URL, status badge, instructor score
- [ ] `PromptLibraryItem.tsx` — prompt card with tag, copy, edit, delete

---

## Phase 9 — Pages (all 52 screens)

### Public (Section 1 from Nova spec)
- [ ] `src/app/page.tsx` — **Homepage** (Screen 01): Hero, stats bar, featured courses, category chips, AI value prop, testimonials, pricing teaser, footer
- [ ] `src/app/courses/page.tsx` — **Course catalog** (Screen 02): filter sidebar, course grid, sort, empty state
- [ ] `src/app/courses/[slug]/page.tsx` — **Course landing** (Screen 03): course hero, what you'll learn, curriculum, instructor bio, reviews, sticky CTA
- [ ] `src/app/paths/page.tsx` — **Learning paths** (Screen 04): path cards with sequence visualisation
- [ ] `src/app/pricing/page.tsx` — **Pricing** (Screen 05): per-course vs subscription toggle, NGN/USD, plan table, FAQ
- [ ] `src/app/about/page.tsx` — **About** (Screen 06): origin, instructors, AI philosophy, talent pipeline
- [ ] `src/app/u/[username]/page.tsx` — **Public profile** (Screen 07): courses, projects, certs, XP, badges

### Auth (Section 2)
- [ ] `src/app/auth/signup/page.tsx` — **Sign up** (Screen 08)
- [ ] `src/app/auth/login/page.tsx` — **Sign in** (Screen 09)
- [ ] `src/app/auth/forgot-password/page.tsx` — **Forgot password** (Screen 10) — 4 states
- [ ] `src/app/auth/onboarding/page.tsx` — **Onboarding quiz** (Screen 11) — 3-step
- [ ] `src/app/auth/verify-email/page.tsx` — **Email verification** (Screen 12)

### Student dashboard (Section 3)
- [ ] `src/app/dashboard/page.tsx` — **Dashboard home** (Screen 13): resume CTA, streak, XP, in-progress, recommendations
- [ ] `src/app/dashboard/learning/page.tsx` — **My learning** (Screen 14)
- [ ] `src/app/dashboard/certificates/page.tsx` — **My certificates** (Screen 15)
- [ ] `src/app/dashboard/projects/page.tsx` — **My projects** (Screen 16)
- [ ] `src/app/dashboard/prompts/page.tsx` — **Prompt library** (Screen 17)
- [ ] `src/app/dashboard/leaderboard/page.tsx` — **Leaderboard** (Screen 18)
- [ ] `src/app/dashboard/settings/page.tsx` — **Account settings** (Screen 19)

### Course player (Section 4)
- [ ] `src/app/learn/[slug]/[lessonId]/page.tsx` — **Player** (Screens 20–28): tabbed player (video/written/code/quiz), AI tutor drawer, lesson sidebar

### Assessments (Section 5)
- [ ] Quiz results — integrated in player page (Screen 29)
- [ ] Certificate screen — `/certificates/[id]` (Screen 30)
- [ ] `src/app/arena/[courseId]/page.tsx` — **AI Debugging Arena** (Screen 31)
- [ ] Client brief — part of player (Screen 32)
- [ ] `src/app/learn/[slug]/[lessonId]/capstone/page.tsx` — **Ship It submission** (Screen 33)
- [ ] XP widget — component on dashboard (Screen 34)

### Billing (Section 6)
- [ ] `src/app/checkout/course/page.tsx` — **Course checkout** (Screen 35)
- [ ] `src/app/checkout/subscription/page.tsx` — **Subscription checkout** (Screen 36)
- [ ] `src/app/checkout/success/page.tsx` — **Purchase success** (Screen 37)
- [ ] `src/app/billing/page.tsx` — **Billing management** (Screen 38)
- [ ] Cancel subscription flow — modal within billing page (Screen 39)

### Instructor (Section 7)
- [ ] `src/app/instructor/page.tsx` — **Instructor home** (Screen 40)
- [ ] `src/app/instructor/courses/page.tsx` — **Course builder** (Screen 41)
- [ ] `src/app/instructor/courses/[id]/page.tsx` — **Lesson editors** (Screens 42–44)
- [ ] `src/app/instructor/courses/[id]/prompts/page.tsx` — **Prompt editor** (Screen 45)
- [ ] `src/app/instructor/courses/[id]/quiz/page.tsx` — **Quiz builder** (Screen 45b)
- [ ] `src/app/instructor/submissions/page.tsx` — **Ship It reviews** (Screen 46)
- [ ] `src/app/instructor/analytics/[courseId]/page.tsx` — **Student analytics** (Screen 47)

### Admin (Section 8)
- [ ] `src/app/admin/page.tsx` — **Admin overview** (Screen 48)
- [ ] `src/app/admin/users/page.tsx` — **User management** (Screen 49)
- [ ] `src/app/admin/courses/page.tsx` — **Course management** (Screen 50)
- [ ] `src/app/admin/promos/page.tsx` — **Promo codes** (Screen 51)
- [ ] `src/app/admin/talent/page.tsx` — **Talent pipeline** (Screen 52)

---

## Phase 10 — Polish

- [ ] Loading states: skeleton loaders for all major sections
- [ ] Error states: error boundaries, API error handling with toasts
- [ ] Empty states: illustrated empty states for all list pages
- [ ] Responsive: test and fix all mobile breakpoints
- [ ] Dark mode: ensure full dark mode coverage
- [ ] Accessibility: semantic HTML, aria labels, keyboard navigation
- [ ] SEO: metadata per page, `generateMetadata` for dynamic routes
- [ ] Performance: dynamic imports for Monaco Editor and course player

---

## Implementation order (start here)

1. Phase 1 (foundation) → Phase 2 (stores) → Phase 3 (config)
2. Phase 4 (UI components) → Phase 5 (layout components)
3. Phase 9 launch-priority pages first:
   - Homepage (01)
   - Course catalog (02) + Course landing (03)
   - Sign up (08) + Sign in (09)
   - Dashboard home (13) + My learning (14)
   - Course player (20-23)
   - Course checkout (35-36)
4. Remaining pages
5. Phase 10 polish
