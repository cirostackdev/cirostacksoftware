# Refine — Polish existing features

Things that work but need to be tightened up before launch.

---

## Auth

- [ ] Auto-refresh access token on 401 — no interceptor exists; expired tokens just throw errors instead of silently refreshing via the `/auth/refresh` cookie endpoint
- [ ] Verify server-side token revocation on logout — currently only clears localStorage + cookie client-side
- [ ] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to frontend env — Google OAuth silently fails without it

---

## Lesson Player (`/learn/[slug]/[lessonId]`)

- [ ] Replace `window.location.href` with `next/navigation` router on lesson navigation (lines 563 & 575) — currently causes full page reload between lessons
- [ ] Add error boundary around the player — a failed API call currently leaves students on a blank screen

---

## Admin Dashboard (`/admin/page.tsx`)

- [ ] Wire all stats to real API data — currently every number (12,841 students, 47 courses, etc.) is hardcoded
- [ ] Bind user management table to `/admin/users` endpoint
- [ ] Bind courses list to `/admin/courses` endpoint

---

## Checkout

- [ ] Replace hardcoded WhatsApp group link in `/checkout/success` — should be per-course or pulled from config
- [ ] Fix `/checkout/course` fetching 100 courses to find one by ID — use a direct API endpoint instead
- [ ] Set real Stripe price IDs in `payments.router.ts` and `subscriptions.router.ts` — currently placeholder strings that will break Stripe checkout

---

## Instructor

- [ ] Complete instructor analytics UI — backend returns drop-off by lesson, quiz pass rates, AI tutor volume; frontend page exists but binding is incomplete
- [ ] Build capstone submission review interface — backend scoring/review API is complete, no UI

---

## Frontend Config

- [ ] Add `CORS_ORIGIN` to backend `.env.example` — currently hardcoded in `index.ts`
- [ ] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to frontend `.env.example`
- [ ] Add `MUX_WEBHOOK_SECRET` to backend `.env.example` — used in content module but missing from the list

---

## UX / Error Handling

- [ ] Add global error boundary component — no fallback UI exists for unexpected crashes
- [ ] Add toast/error message when API calls fail in course catalog, dashboard, lesson player
- [ ] Add retry logic in `client.ts` for transient network errors (single retry with short delay is enough)
