# CiroStack Academy — Backend TODO
> Axon implementation guide · Based on `ferro_academy_spec.md`
> Runtime: Bun + TypeScript · Framework: Express · ORM: Drizzle · DB: Postgres

---

## Implementation order

Work top-to-bottom. Each section depends on the one above it.

```
1. Project scaffold → 2. DB + schema → 3. Auth → 4. Courses/Content
→ 5. Enrollments/Progress → 6. Quizzes/Certs → 7. Payments
→ 8. AI features → 9. Gamification → 10. Admin → 11. Frontend wiring
```

---

## 1. Project Scaffold

- [ ] Init `academy-api/` with `bun init`
- [ ] `package.json` — deps: `express`, `drizzle-orm`, `postgres`, `jsonwebtoken`, `bcrypt`, `zod`, `cors`, `helmet`, `express-rate-limit`, `@aws-sdk/client-s3`, `stripe`, `puppeteer`
- [ ] `tsconfig.json` — strict, `moduleResolution: bundler`, path alias `@/*`
- [ ] `src/index.ts` — Express app bootstrap, apply middleware, mount routers, start Bun server on port 4000
- [ ] `src/middleware/errorHandler.ts` — global error handler, maps Zod/Drizzle errors to clean JSON responses
- [ ] `src/middleware/rateLimit.ts` — general API limiter (100 req/min), sandbox limiter (30 exec/hr/user)
- [ ] `CLAUDE.md` — agent instructions per Axon's existing pattern

---

## 2. Config & Secrets

- [ ] `src/config/secrets.ts` — fetch all secrets from Broker at `secret/cirostack/academy/*` on startup; cache in memory; hard-fail if any secret missing

Secrets to fetch:
```
postgres-url · jwt-access-secret · jwt-refresh-secret
mux-token-id · mux-token-secret
paystack-secret-key · paystack-webhook-secret
stripe-secret-key · stripe-webhook-secret
aws-access-key · aws-secret-key · aws-s3-bucket
piston-api-url · armory-url · armory-internal-key
```

---

## 3. Database

### 3.1 Connection
- [ ] `src/db/index.ts` — Drizzle + `postgres` driver, export `db` singleton

### 3.2 Schema (`src/db/schema.ts`)
Implement all 26 tables from the Ferro spec:

- [ ] `users`
- [ ] `learning_paths`
- [ ] `courses`
- [ ] `sections`
- [ ] `lessons`
- [ ] `lesson_video_content`
- [ ] `lesson_written_content`
- [ ] `lesson_code_content`
- [ ] `lesson_prompts`
- [ ] `quiz_questions`
- [ ] `enrollments`
- [ ] `lesson_progress`
- [ ] `quiz_attempts`
- [ ] `certificates`
- [ ] `subscriptions`
- [ ] `payments`
- [ ] `promo_codes`
- [ ] `user_prompt_library`
- [ ] `prompt_lab_attempts`
- [ ] `capstone_projects`
- [ ] `talent_pipeline`
- [ ] `xp_events`
- [ ] `badges`
- [ ] `user_badges`
- [ ] `live_sessions`
- [ ] `ai_tutor_conversations`

### 3.3 Migrations
- [ ] `drizzle.config.ts` — point to schema, set migrations output dir
- [ ] Run `bun drizzle-kit generate` and commit first migration
- [ ] Seed script: `src/db/seed.ts` — insert demo courses, badge definitions, admin user

---

## 4. Auth Module (`src/modules/auth/`)

- [ ] `auth.router.ts` — mount all auth routes
- [ ] `auth.service.ts`:
  - [ ] `register(email, password, fullName)` — hash password, insert user, send verify email, return JWT pair
  - [ ] `login(email, password)` — verify hash, rotate refresh token, return access + refresh
  - [ ] `googleOAuth(googleIdToken)` — verify with Google, upsert user, return JWT pair
  - [ ] `refresh(refreshToken)` — validate httpOnly cookie, issue new access token
  - [ ] `logout(userId)` — invalidate refresh token
  - [ ] `forgotPassword(email)` — generate reset token, send email via `email.service.ts`
  - [ ] `resetPassword(token, newPassword)` — verify token, update hash
  - [ ] `verifyEmail(token)` — set `email_verified_at`
- [ ] `src/middleware/auth.ts`:
  - [ ] `requireAuth` — verify Bearer JWT, attach `req.user`
  - [ ] `requireRole(...roles)` — role guard factory used on protected routes

---

## 5. Courses & Content

### 5.1 Public catalog (`src/modules/courses/`)
- [ ] `GET /courses` — filter by `category`, `level`, `price_max`, `is_free`, `sort`; paginated
- [ ] `GET /courses/:slug` — full course detail including instructor profile, curriculum preview
- [ ] `GET /courses/:slug/preview` — free preview lessons only
- [ ] `GET /learning-paths` — all published paths
- [ ] `GET /learning-paths/:slug` — path with ordered course list

### 5.2 Instructor course CRUD
- [ ] `GET /instructor/courses` — my courses
- [ ] `POST /instructor/courses` — create draft; validate slug uniqueness
- [ ] `PATCH /instructor/courses/:id` — update metadata; recalculate `total_duration_secs` denorm on lesson change
- [ ] `DELETE /instructor/courses/:id` — only if unpublished
- [ ] `PATCH /instructor/courses/:id/publish` — toggle; fire `academy.course.published` Armory event on first publish
- [ ] `PATCH /admin/courses/:id/feature` — toggle `is_featured`

### 5.3 Sections & Lessons
- [ ] `GET /courses/:courseId/curriculum` — all sections + lessons; locked lessons return title only
- [ ] `POST /instructor/courses/:courseId/sections`
- [ ] `PATCH /instructor/sections/:id`
- [ ] `DELETE /instructor/sections/:id` — cascade deletes lessons
- [ ] `POST /instructor/sections/:sectionId/lessons`
- [ ] `PATCH /instructor/lessons/:id`
- [ ] `DELETE /instructor/lessons/:id`
- [ ] `POST /instructor/lessons/:id/reorder` — update `position` within section
- [ ] `POST /instructor/sections/:id/reorder`

### 5.4 Lesson Content
- [ ] `GET /lessons/:id` — full lesson payload; enforce enrollment gate (unless `is_free_preview`)
- [ ] `GET /lessons/:id/video` — return `lesson_video_content` + Mux signed playback token (15min TTL)
- [ ] `PATCH /instructor/lessons/:id/video` — set `mux_asset_id`, transcript, chapters
- [ ] `GET /lessons/:id/written` — serve `content_md` or `content_pidgin_md` based on user `language_preference`
- [ ] `PATCH /instructor/lessons/:id/written`
- [ ] `GET /lessons/:id/code` — serve starter code; only send `solution_code` after lesson completed
- [ ] `PATCH /instructor/lessons/:id/code`
- [ ] `GET /lessons/:id/prompts`
- [ ] `POST /instructor/lessons/:id/prompts`
- [ ] `PATCH /instructor/lesson-prompts/:id`
- [ ] `DELETE /instructor/lesson-prompts/:id`

### 5.5 Mux service (`src/services/mux.ts`)
- [ ] `getUploadUrl(lessonId)` — create Mux direct upload URL
- [ ] `getPlaybackToken(playbackId)` — sign JWT for Mux player
- [ ] Mux webhook handler — update `mux_asset_id` when upload completes

### 5.6 S3 service (`src/services/s3.ts`)
- [ ] `getUploadUrl(key, contentType)` — pre-signed PUT URL
- [ ] `getDownloadUrl(key)` — pre-signed GET URL (used for certificates)

---

## 6. Enrollments & Progress

- [ ] `GET /enrollments` — my enrollments with computed `progress_percent`
- [ ] `POST /enrollments` — enroll student; check payment or subscription; increment `enrolment_count` on course
- [ ] `GET /enrollments/:courseId/progress` — full `LessonProgress` map for a course
- [ ] `POST /progress/lessons/:id` — mark lesson complete:
  - Insert/update `lesson_progress` with `completed_at`
  - Award XP (`xp_events` insert + update `users.xp_total`)
  - Update `users.streak_current` + `streak_last_activity`
  - Check if all lessons complete → mark enrollment `completed_at` → fire `academy.course.completed` Armory event → trigger certificate generation
- [ ] `PATCH /progress/lessons/:id` — update notes, `last_position_secs` (video resume)

---

## 7. Quizzes & Certificates

### 7.1 Quizzes
- [ ] `GET /lessons/:id/quiz` — questions without `correct_answer` field
- [ ] `POST /lessons/:id/quiz/attempt` — score submission:
  - Auto-grade `multiple_choice` and `code_challenge`
  - For `open_answer` questions: call Cipher via Armory with rubric + answer
  - Store `quiz_attempts` row with `passed` flag
  - If passed: award XP, check if this triggers course completion
- [ ] `GET /lessons/:id/quiz/attempts` — my attempts
- [ ] `GET /quiz-attempts/:id`
- [ ] Instructor quiz CRUD: `GET`, `POST`, `PATCH`, `DELETE` on `/instructor/lessons/:id/quiz/questions`

### 7.2 Certificates (`src/services/certificate.ts`)
- [ ] `generateCertificate(userId, courseId)`:
  - Insert `certificates` row with random `verification_code`
  - Render HTML template (user name, course name, date) → Puppeteer → PDF
  - Upload PDF to S3
  - Update `pdf_url` in DB
- [ ] `GET /certificates` — my certs
- [ ] `GET /certificates/:id`
- [ ] `GET /certificates/:id/download` — return signed S3 URL
- [ ] `GET /certificates/verify/:code` — public; used by the verify page

---

## 8. Payments & Billing

### 8.1 Payments module (`src/modules/payments/`)

**Course purchase:**
- [ ] `POST /payments/checkout/course` — validate course + promo code → initiate Paystack or Stripe checkout → return `paymentUrl`
- [ ] `GET /payments/invoices`

**Subscriptions:**
- [ ] `GET /subscriptions/me`
- [ ] `POST /subscriptions` — initiate subscription checkout (Paystack recurring or Stripe subscription)
- [ ] `POST /subscriptions/me/cancel` — set `cancel_at_period_end = true`
- [ ] `POST /subscriptions/me/pause`

**Webhooks:**
- [ ] `POST /payments/webhook/paystack` — verify HMAC signature; handle `charge.success` → create payment row → enroll student or activate subscription
- [ ] `POST /payments/webhook/stripe` — verify Stripe signature; handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`

**Promo codes:**
- [ ] `POST /payments/validate-promo` — check code valid, not expired, usage limit, applies to this course
- [ ] Admin CRUD: `POST`, `GET`, `PATCH`, `DELETE` on `/admin/promo-codes`

### 8.2 Paystack service (`src/modules/payments/paystack.ts`)
- [ ] `initializeTransaction(email, amount, metadata)` → authorization URL
- [ ] `createSubscription(customerCode, planCode)` → subscription code
- [ ] `verifyWebhookSignature(payload, signature)` → boolean

### 8.3 Stripe service (`src/modules/payments/stripe.ts`)
- [ ] `createCheckoutSession(priceId, customerId, metadata)` → session URL
- [ ] `createSubscription(customerId, priceId)` → subscription
- [ ] `constructWebhookEvent(payload, sig)` → Stripe event

---

## 9. AI Features

### 9.1 AI Tutor (`src/modules/ai-tutor/`)
- [ ] `POST /ai-tutor/chat` — build context `{lesson_title, lesson_type, content_summary, history}` → POST to Armory `academy.ai.tutor.request` → proxy SSE stream back to client; persist message to `ai_tutor_conversations`
- [ ] `GET /ai-tutor/:lessonId/history`
- [ ] `DELETE /ai-tutor/:lessonId/history`

### 9.2 Prompt Lab (`src/modules/prompt-lab/`)
- [ ] `POST /prompt-lab/run` — send prompt to Cipher via Armory; receive scored output (`precision`, `efficiency`, `completion`); store in `prompt_lab_attempts`; award XP
- [ ] `GET /prompt-lab/attempts/:lessonId`

### 9.3 Prompt Library
- [ ] `GET /prompt-library` — my saved prompts
- [ ] `POST /prompt-library` — save custom prompt
- [ ] `POST /prompt-library/steal/:lessonPromptId` — copy lesson prompt to own library
- [ ] `PATCH /prompt-library/:id`
- [ ] `DELETE /prompt-library/:id`

### 9.4 Code Sandbox (`src/modules/sandbox/`)
- [ ] `POST /sandbox/run` — proxy to Piston API (`piston-api-url` from Broker); enforce rate limit (30/hr/user); return stdout, stderr, exit code, compile error

---

## 10. Gamification

- [ ] `GET /xp/me` — `XpSummary` with level, streak, recent XP events
- [ ] `GET /xp/leaderboard` — top 100 by `xp_total`; optionally scoped to a course
- [ ] `GET /badges` — all badge definitions
- [ ] `GET /badges/me` — user's earned badges
- [ ] Badge award logic in `src/modules/gamification/badges.service.ts`:
  - Check + award badge on: lesson complete (streak badges), course complete, XP threshold, prompt lab score, debug arena win, capstone approved
  - Check idempotently — use `UNIQUE(user_id, badge_id)` to avoid duplicates
- [ ] Streak logic in `src/modules/gamification/streak.service.ts`:
  - On every `POST /progress/lessons/:id`: compare `streak_last_activity` date to today
  - If yesterday → increment; if today → no change; if older → reset to 1
  - On milestone (7, 30, 100 days) → insert `xp_events` row for `streak_milestone`

---

## 11. Capstone & Talent Pipeline

- [ ] `POST /capstone` — submit project; validate `live_url` reachable; upload screenshot to S3
- [ ] `GET /capstone` — my submissions
- [ ] `GET /capstone/:id`
- [ ] `PATCH /capstone/:id` — only if status = `pending`
- [ ] `GET /instructor/capstone` — all submissions for courses I own; filter by status
- [ ] `PATCH /instructor/capstone/:id/review` — set score, status, feedback; if `is_talent_pipeline_flagged = true` → insert `talent_pipeline` row; if `status = approved` → award XP
- [ ] `GET /admin/talent-pipeline` — full pipeline with user + project info
- [ ] `POST /admin/talent-pipeline/:id/refer` — fire `academy.talent.referred` Armory event → update status to `referred`

---

## 12. Admin & Instructor Analytics

- [ ] `GET /admin/analytics` — MRR (sum of active subscription amounts), total students, active subscriptions, new signups last 30 days, churn rate
- [ ] `GET /admin/users` — paginated user list; filter by role, search by email/name
- [ ] `PATCH /admin/users/:id` — update role, suspend account (set role to `banned`), manual course enrollment
- [ ] `GET /instructor/analytics/:courseId`:
  - Enrollment count, completion rate, average progress
  - Quiz pass rate per quiz lesson
  - Drop-off by lesson (% of enrolled students who reached each lesson)
  - AI tutor query volume per lesson
  - Prompt lab attempt counts

---

## 13. Live Sessions

- [ ] `GET /live-sessions` — upcoming (filter `scheduled_at > now()`)
- [ ] `GET /live-sessions/:id`
- [ ] `POST /instructor/live-sessions`
- [ ] `PATCH /instructor/live-sessions/:id` — add `recording_url` after session

---

## 14. Armory Service (`src/services/armory.ts`)

- [ ] `emitEvent(eventType, payload)` — POST to `armory-url/events` with `X-Internal-Key` header
- [ ] Events to implement:
  - `academy.course.published` — on first course publish
  - `academy.course.completed` — on enrollment completion
  - `academy.talent.referred` — on talent pipeline referral
  - `academy.ai.tutor.request` — on AI tutor chat message (expects SSE stream back)

---

## 15. Email Service (`src/services/email.ts`)

- [ ] `sendVerificationEmail(to, token)`
- [ ] `sendPasswordResetEmail(to, token)`
- [ ] `sendCertificateEmail(to, courseTitle, pdfUrl)`
- [ ] `sendWelcomeEmail(to, firstName)`

---

## 16. Frontend Wiring (replace all mock data)

Once the backend is live, swap every mock in the Next.js app:

| File | Mock to replace | API endpoint |
|---|---|---|
| `dashboard/page.tsx` | `mockEnrollments` | `GET /enrollments` |
| `dashboard/learning/page.tsx` | `mockEnrollments` | `GET /enrollments` |
| `dashboard/leaderboard/page.tsx` | `MOCK_ENTRIES` | `GET /xp/leaderboard` |
| `courses/page.tsx` | `MOCK_COURSES` | `GET /courses` |
| `courses/[slug]/page.tsx` | static props | `GET /courses/:slug` |
| `learn/[slug]/[lessonId]/page.tsx` | static | `GET /lessons/:id` |
| `AiTutorDrawer.tsx` | `useAiTutorStore.sendMessage` | `POST /ai-tutor/chat` (SSE) |
| `auth/login/page.tsx` | stub | `POST /auth/login` |
| `auth/signup/page.tsx` | stub | `POST /auth/register` |
| `checkout/course/page.tsx` | stub | `POST /payments/checkout/course` |
| `checkout/subscription/page.tsx` | stub | `POST /subscriptions` |
| `dashboard/prompts/page.tsx` | stub | `GET /prompt-library` |
| `dashboard/projects/page.tsx` | stub | `GET /capstone` |
| `dashboard/certificates/page.tsx` | stub | `GET /certificates` |
| `certificates/verify/[code]/page.tsx` | stub | `GET /certificates/verify/:code` |
| `instructor/*` pages | stubs | All `/instructor/*` endpoints |
| `admin/*` pages | stubs | All `/admin/*` endpoints |

Also wire up:
- [ ] `useAuthStore` — connect `login()` and `logout()` to real auth endpoints; store JWT in httpOnly cookie
- [ ] `useAiTutorStore.sendMessage()` — replace stub with real SSE streaming call to `/ai-tutor/chat`
- [ ] `useCheckoutStore` — wire to `/payments/checkout/course` and `/subscriptions`

---

## 17. Deployment checklist

- [ ] Separate Postgres instance (not shared with main CiroStack DB)
- [ ] Bun service on `academy-api.cirostack.com` (Forge handles this)
- [ ] Next.js on `academy.cirostack.com`
- [ ] Paystack + Stripe webhook URLs registered in each dashboard
- [ ] Piston API instance running on EC2 (sandbox execution)
- [ ] Mux webhook URL registered (`/payments/mux-webhook`)
- [ ] All secrets registered in Broker under `secret/cirostack/academy/`
- [ ] Health check endpoint: `GET /health` → `{ status: "ok", db: "ok" }`
