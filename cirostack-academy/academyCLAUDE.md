# CLAUDE.md — CiroStack Academy

> Instructions for Claude Code when working on this repository.

## What this is

**CiroStack Academy** is a paid learning platform at `academy.cirostack.com`. It's a standalone Next.js 15 app built by Volt (the React/Next.js agent). Think lightweight Udemy/Scrimba — CiroStack-branded, targeting devs and the general public.

Frontend lives at `cirostack-academy/`. Backend (Axon) is a separate repo. This file covers the frontend only.

---

## Project location

```
C:\Users\USER\Desktop\cirostackacademy\cirostack-academy\
```

Run commands from inside `cirostack-academy/`.

## Commands

```bash
bun install          # install deps
bun run dev          # dev server on :3000
bun run build        # production build
bun run lint         # eslint
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| React | 19 |
| TypeScript | 5, strict mode |
| Styling | Tailwind CSS v4 (CSS-based config) |
| State | Zustand 5 (persist middleware) |
| Fonts | Inter (body) + Space Grotesk (headings) via `next/font/google` |
| Icons | Lucide React |
| HTTP | native `fetch` + API client in `src/lib/api/client.ts` |
| Animation | Framer Motion (minimal, meaningful only) |

---

## Coding conventions (follow exactly)

### `"use client"` directive
- Add to every file using hooks, browser APIs, or event handlers
- Pages that are pure server renders (no interactivity, no hooks) omit it

### Component structure
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import CourseCard from '@/components/course/CourseCard';

interface Props {
  title: string;
  courseId?: string;
}

export default function MyComponent({ title, courseId }: Props) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Naming
- **Files**: PascalCase for components (`CourseCard.tsx`), camelCase for stores/utils (`useAuthStore.ts`)
- **Components**: default export, PascalCase name
- **Stores**: `use{Feature}Store` pattern
- **Booleans**: prefix with `is`, `has`, `can` — `isLoading`, `hasEnrolled`, `canPublish`
- **Callbacks**: prefix with `on` — `onEnrol`, `onSubmit`, `onChange`

### Imports order
1. React/Next.js (`'use client'` first, then React, then next/*)
2. Third-party libraries (zustand, framer-motion, lucide-react)
3. Internal stores (`@/lib/store/*`)
4. Internal components (`@/components/*`)
5. Internal utilities/types (`@/lib/*`, `@/types/*`)
6. Types last (`import type { ... }`)

### TypeScript
- Strict mode on — no `any`, use `unknown` if needed
- Interfaces for object shapes (not `type` for objects)
- `export type` for type-only re-exports
- JSDoc on public interfaces

### Tailwind
- Utility-first, no custom CSS unless unavoidable
- Dark mode via `.dark` class on `<html>` (class-based, not `prefers-color-scheme`)
- Mobile-first: base styles → `sm:` → `md:` → `lg:`
- Dark variants: `dark:bg-[#0A0E1A]`
- Never use inline `style=` for things Tailwind can do

### Zustand store pattern
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (user, token) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: 'academy-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Toast pattern
```typescript
import { toast } from '@/lib/store/useToastStore';

toast.success('Enrolled successfully!');
toast.error('Payment failed. Please retry.');
```

### API calls
```typescript
import { apiGet, apiPost } from '@/lib/api/client';

// Inside a component or store action
const courses = await apiGet<Course[]>('/courses?category=web_dev');
const result = await apiPost<EnrollmentResult>('/enrollments', { courseId });
```

---

## Route structure

```
/                          Public homepage
/courses                   Course catalog
/courses/[slug]            Course landing page
/paths                     Learning paths
/pricing                   Pricing page
/about                     About page
/u/[username]              Public student profile

/auth/signup               Sign up
/auth/login                Sign in
/auth/forgot-password      Password reset flow
/auth/onboarding           Post-signup quiz
/auth/verify-email         Email verification

/dashboard                 Student dashboard home
/dashboard/learning        My enrolled courses
/dashboard/certificates    My certificates
/dashboard/projects        Ship It projects
/dashboard/prompts         Prompt library
/dashboard/leaderboard     XP leaderboard
/dashboard/settings        Account settings

/learn/[slug]/[lessonId]   Course player (video/written/code/quiz)

/checkout/course           Course purchase
/checkout/subscription     Subscription checkout
/checkout/success          Purchase confirmation
/billing                   Billing management

/instructor                Instructor home
/instructor/courses        Course builder
/instructor/courses/[id]   Course editor
/instructor/submissions    Ship It reviews
/instructor/analytics      Student analytics

/admin                     Admin overview
/admin/users               User management
/admin/courses             Course management
/admin/promos              Promo codes
/admin/talent              Talent pipeline board
```

---

## Key stores

| Store | Persisted | Purpose |
|---|---|---|
| `useAuthStore` | Yes (`academy-auth`) | User session, role, JWT |
| `useThemeStore` | Yes (`academy-theme`) | light/dark/system |
| `usePlayerStore` | No | Active lesson, sidebar state, AI drawer open |
| `useAiTutorStore` | No | Conversation history per lesson |
| `useToastStore` | No | Toast notification queue |
| `useCheckoutStore` | No | Cart/checkout state |

---

## Backend API

Base URL: `https://academy-api.cirostack.com/v1` (dev: `http://localhost:4000/v1`)

Set via `NEXT_PUBLIC_API_URL` env var.

Auth: Bearer JWT in `Authorization` header. Token stored in `useAuthStore`.

All TypeScript interfaces are in `src/types/index.ts` — mirrors Ferro spec exactly.

---

## Environment variables

```
NEXT_PUBLIC_API_URL=https://academy-api.cirostack.com/v1
NEXT_PUBLIC_SITE_URL=https://academy.cirostack.com
```

---

## Route protection (middleware.ts)

- `/dashboard/*` — requires `student`, `instructor`, or `admin` role
- `/instructor/*` — requires `instructor` or `admin`
- `/admin/*` — requires `admin`
- `/learn/*` — requires enrollment check (done in the page, not middleware)
- All others: public

---

## Design language

- **Primary**: `#1A6FE8` (CiroStack blue)
- **AI/Purple**: `#7C3AED` (Prompt Lab, AI features)
- **Success/XP**: `#10B981` (green)
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`
- **Dark bg**: `#0A0E1A`
- **Card dark**: `#0F1629`
- **Border dark**: `#1E2A45`
- **Code surface**: `#0D1117`
- Fonts: Space Grotesk (headings `font-display`), Inter (body `font-sans`)
- No box shadows — border-based elevation (as per Nova's design spec)
- Rounded corners: `rounded-lg` (8px) default, `rounded-xl` (12px) for cards

---

## Special feature notes

### Course player tabs
The `/learn/[slug]/[lessonId]` page has 4 tabs driven by lesson type:
1. **Video** — Mux player + note panel + AI tutor drawer
2. **Written** — Markdown rendered, "explain this line" hover interaction
3. **Code** — Monaco editor + console output + AI vs Manual toggle + Steal the Prompt panel
4. **Quiz** — Question cards, multiple types, submit flow

### AI features (Cipher)
All AI calls go through the API (`/ai-tutor/chat`, `/prompt-lab/run`). Never call Claude directly from the frontend.

### Payments
- Nigeria → Paystack (redirect to hosted page)
- International → Stripe (redirect to hosted page)
- Currency auto-detected by user's `country_code` from their profile
- Both return to `/checkout/success?ref={paymentId}`

### Gamification
- XP and streaks displayed in `DashboardSidebar` and `DashboardHome`
- Streak is a GitHub-style heatmap calendar
- Level = `Math.floor(xpTotal / 500) + 1`
