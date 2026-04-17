# Todo — Features to build / broken things to fix

> Refinements to existing working features are in refine.md. This file covers broken flows, missing features, and unbuilt pages.

---

## Critical — Broken flows (users hit a wall)

- [ ] **Forgot password token hardcoded** — `auth/forgot-password/page.tsx:41` uses `'demo'` as the reset token instead of reading `?token=` from the URL. Password reset is completely broken.
- [ ] **Email verification never auto-triggers** — `auth/verify-email/page.tsx` never reads the `?token=` URL param or calls the verify endpoint. Users land on the page and nothing happens.
- [ ] **`POST /auth/resend-verification` missing** — Frontend calls it (`verify-email/page.tsx:20`), backend route does not exist. Resend button throws a 404.
- [ ] **RESEND_API_KEY not set** — No verification or password reset emails ever send until this is added to Railway backend env vars.

---

## High — Core features not wired up

### Video player
- [ ] Video tab in lesson player is a grey placeholder box — integrate `@mux/mux-player-react` using `videoContent.muxPlaybackId` and `videoContent.muxToken`
- [ ] Chapter timestamps shown but not seekable — wire up after Mux player is integrated

### Code sandbox
- [ ] "Run" button in code lesson tab is not connected — wire to `POST /v1/sandbox/execute` and render stdout/stderr in the output panel

### Quiz engine
- [ ] Quiz tab in lesson player shows a static string — fetch questions from `GET /v1/quizzes/lessons/:lessonId`, render them, and submit to `POST /v1/quizzes/lessons/:lessonId/attempt`

### Google OAuth
- [ ] No Google sign-in button on login or signup pages — backend `POST /auth/google` is complete; add frontend button with `@react-oauth/google` and set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Payments (Stripe)

- [ ] `PAYSTACK_WEBHOOK_SECRET` not set — all Paystack webhook events fail signature verification

### AI features
- [ ] theres nothing called armory, or cipher. build what you need
- [ ] Prompt lab scores are always hardcoded 70 points — wire real evaluation
- [ ] `open_answer` quiz questions award 50% with no feedback — implement async grading or synchronous evaluation

---

## Medium — Missing pages and UI

### Legal pages (referenced but don't exist)
- [ ] Build `/legal/terms` — linked from signup checkbox
- [ ] Build `/legal/privacy` — linked from signup checkbox

### Unbuilt lesson types
- [ ] `ai_debug`, `prompt_lab`, `client_brief`, `capstone` lesson types have no UI in the player — add dedicated panels or redirect to the relevant feature page for each

### AI vs Manual Split View
- [ ] Not implemented anywhere — homepage and pricing list it as a core differentiator
- [ ] Add `split_view` content type to lessons schema and content module
- [ ] Build side-by-side panel in lesson player (left = manual, right = AI-assisted)
- [ ] Add split_view tab in instructor course builder

### Prompt Lab
- [ ] Backend module exists at `/prompt-lab`, no frontend at all
- [ ] Build `/dashboard/prompt-lab` page: system prompt editor, user message input, streamed response panel, save-to-library button

### Capstone Projects ("Ship It")
- [ ] No student submission UI — build `/dashboard/projects/[id]` with repo link, live URL, description fields
- [ ] No project status tracker — pending review / scored / flagged for Orion
- [ ] No instructor submission review UI at `/instructor/submissions` — build scoring form + talent pipeline flag toggle

### Learning Paths
- [ ] `/paths` page is a stub — build listing page and `/paths/[slug]` detail page with course sequence and enroll CTA
- [ ] Show path progress for students already enrolled in constituent courses

### Talent Pipeline (student view)
- [ ] Admin can flag students but students have no visibility — build `/dashboard/talent` showing referral status (not flagged / under review / referred / hired)

### User Profile
- [ ] `/u/[username]` is likely a stub — build public profile showing bio, completed courses, certificates, XP level, link from leaderboard

---

## Low — Polish and edge cases

### Auth UX
- [ ] Onboarding page silently redirects to `/dashboard` on API error — show a toast and stay on the page
- [ ] "Skip for now" on verify-email goes to dashboard with no indication of what features are locked without a verified email
- [ ] "Enrol now" on course detail goes straight to checkout regardless of login state — redirect unauthenticated users to `/auth/login?redirect=...`

### Misc wiring
- [ ] Live sessions RSVP button on dashboard is not connected to any endpoint
- [ ] Bookmark toggle on `CourseCard` only updates local state — persist to backend or remove the button
- [ ] Mux webhook route is mounted at wrong path in `index.ts` — double-check `/v1/content/mux-webhook` vs the actual path in `contentRouter`
- [ ] Certificate PDF generation in `services/certificate.ts` — verify it produces a real PDF and uploads to S3, not a stub

### Database
- [ ] Add index on `payments(status)` — used in analytics queries
- [ ] Add index on `capstone_projects(status)` — used in instructor submission queries
- [ ] Seed data only has full curriculum for featured courses — add lightweight sections/lessons for all 7 remaining seeded courses so the player works end-to-end with any course

---

## Environment variables still needed in Railway

| Variable | Service | Why |
|---|---|---|
| `RESEND_API_KEY` | Backend | Email verification + password reset |
| `ARMORY_INTERNAL_KEY` | Backend | AI tutor, quiz grading, prompt lab |
| `PAYSTACK_WEBHOOK_SECRET` | Backend | Webhook signature verification |
| `STRIPE_SECRET_KEY` | Backend | Stripe checkout |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook verification |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Frontend | Google OAuth button |
| `NEXT_PUBLIC_SITE_URL` | Frontend | Metadata / OG tags |

---

## Feature status

| Feature | Backend | Frontend |
|---|---|---|
| Auth email/password | ✅ | ✅ |
| Course catalog | ✅ | ✅ |
| Enrollments + progress | ✅ | ✅ |
| Gamification / XP / leaderboard | ✅ | ✅ |
| Certificates | ✅ | ✅ |
| Billing / subscriptions | ✅ | ✅ |
| Prompt library | ✅ | ✅ |
| Instructor course management | ✅ | ✅ |
| Video player (Mux) | ✅ | ❌ placeholder |
| Code sandbox (Piston) | ✅ | ❌ not wired |
| Quiz engine | ✅ | ❌ not wired |
| Google OAuth | ✅ | ❌ no button |
| Forgot password | ✅ | ❌ token hardcoded |
| Email verification | ⚠️ missing resend route | ❌ never auto-verifies |
| Admin dashboard | ✅ | ❌ mock data |
| Instructor analytics | ✅ | ❌ mock data |
| AI Tutor (Cipher) | ✅ | ⚠️ UI exists, key missing |
| Prompt Lab | ✅ | ❌ no frontend |
| AI vs Manual split view | ❌ | ❌ |
| Capstone submission | ✅ | ❌ no UI |
| Learning paths | ✅ | ❌ stub |
| Talent pipeline (student) | ✅ admin only | ❌ |
| Live sessions | ✅ | ❌ not wired |
| Legal pages | n/a | ❌ |
| Payments (Paystack) | ⚠️ missing webhook secret | ✅ |
| Payments (Stripe) | ❌ missing keys | ✅ |
