# CiroStack Academy — Ferro Architecture Spec
> Version: 1.0 | Status: Ready for implementation | Owner: Ferro → Axon (backend), Volt (frontend), Pulse (mobile)

---

## 1. System Architecture Overview

```
                        ┌─────────────────────────────────────┐
                        │           ARMORY (port 18801)        │
                        │        Event bus / Orchestrator      │
                        └───┬─────────────┬──────────────┬────┘
                            │             │              │
                    ┌───────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
                    │  Academy API │ │  Cipher   │ │    Scroll /   │
                    │  (Axon)      │ │ AI Tutor  │ │    Ciro       │
                    │  port 4000   │ │  Agent    │ │    Agents     │
                    └───────┬──────┘ └───────────┘ └───────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
       ┌──────▼──────┐ ┌────▼──────┐  ┌──────▼──────┐
       │  Postgres   │ │  Broker   │  │  Mux API    │
       │  (primary)  │ │ (secrets) │  │  (video)    │
       │             │ │ port 18800│  │             │
       └─────────────┘ └───────────┘  └─────────────┘

Clients:
  - Volt (Next.js web)       → academy.cirostack.com
  - Pulse (Flutter mobile)   → App Store / Play Store
```

### Key Architectural Decisions

- **Runtime**: Bun + TypeScript
- **Framework**: Express (consistent with Axon's existing pattern)
- **ORM**: Drizzle ORM
- **Database**: Postgres (separate instance from main CiroStack DB)
- **Secrets**: All credentials fetched from Broker at runtime via `secret/cirostack/academy/`
- **Video**: Mux for video hosting, transcoding, and streaming
- **Payments**: Paystack (NGN) + Stripe (USD) — both route through same payment module
- **Code execution**: Piston API (self-hosted on EC2) for sandbox code running
- **AI Tutor**: Cipher agent, invoked via Armory HTTP event — never called directly
- **Auth**: JWT (access token 15min, refresh token 30 days, stored httpOnly cookie)
- **File storage**: AWS S3 via Broker-fetched credentials

---

## 2. Database Schema

### 2.1 users

```sql
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 VARCHAR(255) NOT NULL UNIQUE,
  password_hash         VARCHAR(255),                          -- null for OAuth users
  full_name             VARCHAR(255) NOT NULL,
  username              VARCHAR(100) NOT NULL UNIQUE,
  avatar_url            VARCHAR(500),
  role                  VARCHAR(20) NOT NULL DEFAULT 'student'
                          CHECK (role IN ('student','instructor','admin')),
  country_code          CHAR(2) NOT NULL DEFAULT 'NG',
  currency              CHAR(3) NOT NULL DEFAULT 'NGN'
                          CHECK (currency IN ('NGN','USD')),
  language_preference   VARCHAR(10) NOT NULL DEFAULT 'en'
                          CHECK (language_preference IN ('en','pcm')),
  email_verified_at     TIMESTAMPTZ,
  google_oauth_id       VARCHAR(255) UNIQUE,
  stripe_customer_id    VARCHAR(255) UNIQUE,
  paystack_customer_code VARCHAR(255) UNIQUE,
  xp_total              INTEGER NOT NULL DEFAULT 0,
  streak_current        INTEGER NOT NULL DEFAULT 0,
  streak_last_activity  DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### 2.2 learning_paths

```sql
CREATE TABLE learning_paths (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  thumbnail_url    VARCHAR(500),
  estimated_hours  INTEGER,
  position         INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.3 courses

```sql
CREATE TABLE courses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  description           TEXT,
  what_you_learn        JSONB NOT NULL DEFAULT '[]',           -- string[]
  thumbnail_url         VARCHAR(500),
  trailer_mux_id        VARCHAR(255),
  instructor_id         UUID NOT NULL REFERENCES users(id),
  learning_path_id      UUID REFERENCES learning_paths(id),
  level                 VARCHAR(20) NOT NULL
                          CHECK (level IN ('beginner','intermediate','advanced')),
  category              VARCHAR(50) NOT NULL
                          CHECK (category IN (
                            'ui_ux','web_dev','mobile','ai_ml',
                            'cloud_devops','architecture','startups'
                          )),
  price_ngn             INTEGER NOT NULL DEFAULT 0,            -- in kobo
  price_usd             INTEGER NOT NULL DEFAULT 0,            -- in cents
  is_published          BOOLEAN NOT NULL DEFAULT false,
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  has_ai_vs_manual      BOOLEAN NOT NULL DEFAULT false,
  has_prompt_lab        BOOLEAN NOT NULL DEFAULT false,
  has_client_brief      BOOLEAN NOT NULL DEFAULT false,
  has_capstone          BOOLEAN NOT NULL DEFAULT false,
  whatsapp_group_url    VARCHAR(500),
  total_lessons         INTEGER NOT NULL DEFAULT 0,            -- denormalised, updated on lesson add/delete
  total_duration_secs   INTEGER NOT NULL DEFAULT 0,            -- denormalised
  enrolment_count       INTEGER NOT NULL DEFAULT 0,            -- denormalised
  rating_average        NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count          INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published);
```

### 2.4 sections

```sql
CREATE TABLE sections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  position         INTEGER NOT NULL DEFAULT 0,
  is_free_preview  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_course ON sections(course_id, position);
```

### 2.5 lessons

```sql
CREATE TABLE lessons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id       UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  position         INTEGER NOT NULL DEFAULT 0,
  type             VARCHAR(30) NOT NULL
                     CHECK (type IN (
                       'video','written','code','quiz',
                       'prompt_lab','ai_debug','client_brief','capstone'
                     )),
  duration_secs    INTEGER,
  xp_reward        INTEGER NOT NULL DEFAULT 10,
  is_free_preview  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_section ON lessons(section_id, position);
CREATE INDEX idx_lessons_type ON lessons(type);
```

### 2.6 lesson_video_content

```sql
CREATE TABLE lesson_video_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  mux_asset_id     VARCHAR(255) NOT NULL,
  mux_playback_id  VARCHAR(255) NOT NULL,
  transcript       TEXT,
  chapters         JSONB NOT NULL DEFAULT '[]',   -- [{time_secs: 120, title: "..."}]
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.7 lesson_written_content

```sql
CREATE TABLE lesson_written_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  content_md       TEXT NOT NULL,
  content_pidgin_md TEXT,                         -- Nigerian Pidgin English variant
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.8 lesson_code_content

```sql
CREATE TABLE lesson_code_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  starter_code     TEXT NOT NULL,
  solution_code    TEXT NOT NULL,
  manual_solution  TEXT,                           -- for AI vs Manual split view
  language         VARCHAR(30) NOT NULL
                     CHECK (language IN (
                       'javascript','typescript','python','dart',
                       'bash','go','rust'
                     )),
  test_cases       JSONB NOT NULL DEFAULT '[]',    -- [{input, expected_output}]
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.9 lesson_prompts  *(powers "Steal the Prompt")*

```sql
CREATE TABLE lesson_prompts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt_text      TEXT NOT NULL,
  model_used       VARCHAR(20) NOT NULL
                     CHECK (model_used IN ('claude','gpt4','gemini','copilot')),
  context_note     VARCHAR(500),
  tag              VARCHAR(30) NOT NULL
                     CHECK (tag IN (
                       'architecture','debugging','refactor',
                       'generation','review','explanation','testing'
                     )),
  position         INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lesson_prompts_lesson ON lesson_prompts(lesson_id, position);
```

### 2.10 quiz_questions

```sql
CREATE TABLE quiz_questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text    TEXT NOT NULL,
  type             VARCHAR(20) NOT NULL
                     CHECK (type IN ('multiple_choice','code_challenge','open_answer')),
  options          JSONB,                          -- string[] for multiple_choice
  correct_answer   TEXT,                           -- for multiple_choice and code_challenge
  grading_rubric   TEXT,                           -- for open_answer (fed to Cipher for grading)
  points           INTEGER NOT NULL DEFAULT 10,
  position         INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id, position);
```

### 2.11 enrollments

```sql
CREATE TABLE enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  course_id        UUID NOT NULL REFERENCES courses(id),
  payment_id       UUID,                           -- FK to payments, nullable (free/gifted)
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

### 2.12 lesson_progress

```sql
CREATE TABLE lesson_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  lesson_id        UUID NOT NULL REFERENCES lessons(id),
  completed_at     TIMESTAMPTZ,
  notes            TEXT,
  last_position_secs INTEGER DEFAULT 0,           -- video resume position
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
```

### 2.13 quiz_attempts

```sql
CREATE TABLE quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  lesson_id        UUID NOT NULL REFERENCES lessons(id),
  score            INTEGER NOT NULL DEFAULT 0,
  max_score        INTEGER NOT NULL,
  passed           BOOLEAN NOT NULL DEFAULT false,
  answers          JSONB NOT NULL DEFAULT '[]',    -- [{question_id, answer, is_correct, points_earned}]
  ai_feedback      TEXT,                           -- Cipher's grading feedback for open_answer
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
```

### 2.14 certificates

```sql
CREATE TABLE certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  course_id         UUID NOT NULL REFERENCES courses(id),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_code VARCHAR(32) NOT NULL UNIQUE,
  pdf_url           VARCHAR(500),
  UNIQUE(user_id, course_id)
);
```

### 2.15 subscriptions

```sql
CREATE TABLE subscriptions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID NOT NULL REFERENCES users(id) UNIQUE,
  plan                       VARCHAR(20) NOT NULL CHECK (plan IN ('monthly','annual')),
  currency                   CHAR(3) NOT NULL CHECK (currency IN ('NGN','USD')),
  status                     VARCHAR(20) NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','cancelled','past_due','paused')),
  current_period_start       TIMESTAMPTZ NOT NULL,
  current_period_end         TIMESTAMPTZ NOT NULL,
  cancel_at_period_end       BOOLEAN NOT NULL DEFAULT false,
  pause_collection_until     TIMESTAMPTZ,
  stripe_subscription_id     VARCHAR(255) UNIQUE,
  paystack_subscription_code VARCHAR(255) UNIQUE,
  cancelled_at               TIMESTAMPTZ,
  cancel_reason              VARCHAR(255),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.16 payments

```sql
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  course_id           UUID REFERENCES courses(id),
  subscription_id     UUID REFERENCES subscriptions(id),
  promo_code_id       UUID REFERENCES promo_codes(id),
  amount              INTEGER NOT NULL,            -- in lowest denomination
  currency            CHAR(3) NOT NULL CHECK (currency IN ('NGN','USD')),
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','success','failed','refunded')),
  provider            VARCHAR(20) NOT NULL CHECK (provider IN ('stripe','paystack')),
  provider_reference  VARCHAR(255) NOT NULL,
  invoice_url         VARCHAR(500),
  metadata            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(provider_reference);
```

### 2.17 promo_codes

```sql
CREATE TABLE promo_codes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(50) NOT NULL UNIQUE,
  type           VARCHAR(20) NOT NULL CHECK (type IN ('percentage','fixed')),
  value          INTEGER NOT NULL,                -- % or amount in lowest denomination
  currency       CHAR(3) CHECK (currency IN ('NGN','USD')),  -- null = applies to both
  course_id      UUID REFERENCES courses(id),     -- null = global (all courses)
  usage_limit    INTEGER,                         -- null = unlimited
  usage_count    INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.18 user_prompt_library

```sql
CREATE TABLE user_prompt_library (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  source_prompt_id  UUID REFERENCES lesson_prompts(id), -- null if user-created
  prompt_text       TEXT NOT NULL,
  model_used        VARCHAR(20) NOT NULL
                      CHECK (model_used IN ('claude','gpt4','gemini','copilot')),
  tag               VARCHAR(30),
  custom_label      VARCHAR(100),
  is_custom         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_library_user ON user_prompt_library(user_id);
```

### 2.19 prompt_lab_attempts

```sql
CREATE TABLE prompt_lab_attempts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id),
  lesson_id            UUID NOT NULL REFERENCES lessons(id),
  prompt_text          TEXT NOT NULL,
  model_used           VARCHAR(20) NOT NULL,
  output               TEXT NOT NULL,
  precision_score      INTEGER NOT NULL CHECK (precision_score BETWEEN 0 AND 100),
  efficiency_score     INTEGER NOT NULL CHECK (efficiency_score BETWEEN 0 AND 100),
  completion_score     INTEGER NOT NULL CHECK (completion_score BETWEEN 0 AND 100),
  total_score          INTEGER NOT NULL,           -- weighted average of above 3
  scoring_rationale    TEXT,                       -- Cipher's explanation of scores
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_lab_user_lesson ON prompt_lab_attempts(user_id, lesson_id);
```

### 2.20 capstone_projects  *(Ship It)*

```sql
CREATE TABLE capstone_projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id),
  course_id                 UUID NOT NULL REFERENCES courses(id),
  title                     VARCHAR(255) NOT NULL,
  description               TEXT NOT NULL,
  live_url                  VARCHAR(500) NOT NULL,
  github_url                VARCHAR(500),
  screenshot_url            VARCHAR(500),
  tech_stack                JSONB NOT NULL DEFAULT '[]',  -- string[]
  is_public                 BOOLEAN NOT NULL DEFAULT false,
  status                    VARCHAR(30) NOT NULL DEFAULT 'pending'
                              CHECK (status IN (
                                'pending','approved','revision_requested','rejected'
                              )),
  instructor_score          INTEGER CHECK (instructor_score BETWEEN 0 AND 100),
  instructor_feedback       TEXT,
  is_talent_pipeline_flagged BOOLEAN NOT NULL DEFAULT false,
  submitted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at               TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_capstone_status ON capstone_projects(status);
CREATE INDEX idx_capstone_pipeline ON capstone_projects(is_talent_pipeline_flagged);
```

### 2.21 talent_pipeline

```sql
CREATE TABLE talent_pipeline (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  capstone_project_id   UUID NOT NULL REFERENCES capstone_projects(id),
  skill_tags            JSONB NOT NULL DEFAULT '[]',  -- string[]
  status                VARCHAR(20) NOT NULL DEFAULT 'flagged'
                          CHECK (status IN ('flagged','referred','engaged','hired')),
  referred_to_orion_at  TIMESTAMPTZ,
  orion_event_id        VARCHAR(255),               -- Armory event reference
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.22 xp_events

```sql
CREATE TABLE xp_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id),
  event_type     VARCHAR(50) NOT NULL
                   CHECK (event_type IN (
                     'lesson_complete','quiz_pass','capstone_approved',
                     'streak_milestone','prompt_lab_score',
                     'debug_arena_win','course_complete'
                   )),
  xp_amount      INTEGER NOT NULL,
  reference_id   UUID,                             -- lesson_id, quiz_attempt_id, etc.
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id);
```

### 2.23 badges

```sql
CREATE TABLE badges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  image_url        VARCHAR(500) NOT NULL,
  condition_type   VARCHAR(30) NOT NULL
                     CHECK (condition_type IN (
                       'streak','course_complete','xp_threshold',
                       'debug_arena','prompt_lab','capstone'
                     )),
  condition_value  INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.24 user_badges

```sql
CREATE TABLE user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  badge_id    UUID NOT NULL REFERENCES badges(id),
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### 2.25 live_sessions

```sql
CREATE TABLE live_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  stream_url       VARCHAR(500),
  recording_url    VARCHAR(500),
  course_id        UUID REFERENCES courses(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.26 ai_tutor_conversations

```sql
CREATE TABLE ai_tutor_conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id),
  lesson_id    UUID NOT NULL REFERENCES lessons(id),
  messages     JSONB NOT NULL DEFAULT '[]',
               -- [{role: "user"|"assistant", content: "...", created_at: ISO}]
  model_used   VARCHAR(20) NOT NULL DEFAULT 'claude',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)  -- one conversation thread per user per lesson
);

CREATE INDEX idx_ai_tutor_user_lesson ON ai_tutor_conversations(user_id, lesson_id);
```

---

## 3. API Endpoints (OpenAPI 3.0)

Base URL: `https://academy-api.cirostack.com/v1`

Auth: Bearer JWT on all protected routes. Role guards annotated as `[student]`, `[instructor]`, `[admin]`.

### 3.1 Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | public | Register with email+password |
| POST | `/auth/login` | public | Email+password login → JWT |
| POST | `/auth/google` | public | Google OAuth login/register |
| POST | `/auth/logout` | student | Invalidate refresh token |
| POST | `/auth/refresh` | public | Rotate access token via refresh cookie |
| POST | `/auth/forgot-password` | public | Send reset email |
| POST | `/auth/reset-password` | public | Reset with token from email |
| GET | `/auth/verify-email/:token` | public | Verify email address |

### 3.2 Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | student | Get own full profile |
| PATCH | `/users/me` | student | Update profile (name, avatar, language, etc.) |
| DELETE | `/users/me` | student | Delete account (soft delete) |
| GET | `/users/me/onboarding` | student | Get onboarding quiz status |
| POST | `/users/me/onboarding` | student | Submit onboarding quiz answers |
| GET | `/users/:username` | public | Public profile (courses, projects, certs) |

### 3.3 Courses (public catalog)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/courses` | public | Catalog with filters: `category`, `level`, `price_max`, `is_free`, `sort`, `page`, `limit` |
| GET | `/courses/:slug` | public | Full course detail for landing page |
| GET | `/courses/:slug/preview` | public | Free preview lessons list |
| GET | `/learning-paths` | public | All published learning paths |
| GET | `/learning-paths/:slug` | public | Learning path with course sequence |

### 3.4 Courses (instructor CRUD)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/instructor/courses` | instructor | My courses list |
| POST | `/instructor/courses` | instructor | Create course draft |
| PATCH | `/instructor/courses/:id` | instructor | Update course metadata |
| DELETE | `/instructor/courses/:id` | instructor | Delete unpublished course |
| PATCH | `/instructor/courses/:id/publish` | instructor | Publish / unpublish |
| PATCH | `/admin/courses/:id/feature` | admin | Toggle featured flag |

### 3.5 Sections & Lessons

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/courses/:courseId/curriculum` | public | Full curriculum (locked lessons show title only) |
| POST | `/instructor/courses/:courseId/sections` | instructor | Add section |
| PATCH | `/instructor/sections/:id` | instructor | Update section |
| DELETE | `/instructor/sections/:id` | instructor | Delete section |
| POST | `/instructor/sections/:sectionId/lessons` | instructor | Add lesson |
| PATCH | `/instructor/lessons/:id` | instructor | Update lesson metadata |
| DELETE | `/instructor/lessons/:id` | instructor | Delete lesson |
| POST | `/instructor/lessons/:id/reorder` | instructor | Update position within section |
| POST | `/instructor/sections/:id/reorder` | instructor | Update section position |

### 3.6 Lesson Content

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/lessons/:id` | student | Full lesson (requires enrollment unless free preview) |
| GET | `/lessons/:id/video` | student | Video content + Mux playback token |
| PATCH | `/instructor/lessons/:id/video` | instructor | Set Mux asset ID, transcript, chapters |
| GET | `/lessons/:id/written` | student | Written content (en or pcm based on user preference) |
| PATCH | `/instructor/lessons/:id/written` | instructor | Update markdown content |
| GET | `/lessons/:id/code` | student | Code sandbox content |
| PATCH | `/instructor/lessons/:id/code` | instructor | Update starter/solution code |
| GET | `/lessons/:id/prompts` | student | Lesson prompt list (for Steal the Prompt) |
| POST | `/instructor/lessons/:id/prompts` | instructor | Add prompt to lesson |
| PATCH | `/instructor/lesson-prompts/:id` | instructor | Update prompt |
| DELETE | `/instructor/lesson-prompts/:id` | instructor | Delete prompt |

### 3.7 Enrollments & Progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/enrollments` | student | My enrolled courses with progress |
| POST | `/enrollments` | student | Enroll (free or post-payment) |
| GET | `/enrollments/:courseId/progress` | student | Full progress map for a course |
| POST | `/progress/lessons/:id` | student | Mark lesson complete, award XP |
| PATCH | `/progress/lessons/:id` | student | Update notes, video position |

### 3.8 Quizzes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/lessons/:id/quiz` | student | Quiz questions (no correct answers exposed) |
| POST | `/lessons/:id/quiz/attempt` | student | Submit answers → score + feedback |
| GET | `/lessons/:id/quiz/attempts` | student | My attempt history for this quiz |
| GET | `/quiz-attempts/:id` | student | Full attempt detail with Cipher feedback |
| GET | `/instructor/lessons/:id/quiz` | instructor | Quiz with correct answers |
| POST | `/instructor/lessons/:id/quiz/questions` | instructor | Add question |
| PATCH | `/instructor/quiz-questions/:id` | instructor | Update question |
| DELETE | `/instructor/quiz-questions/:id` | instructor | Delete question |

### 3.9 Certificates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/certificates` | student | My certificates |
| GET | `/certificates/:id` | student | Certificate detail |
| GET | `/certificates/:id/download` | student | PDF download (signed S3 URL) |
| GET | `/certificates/verify/:code` | public | Verify certificate by code |

### 3.10 Subscriptions & Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/me` | student | My subscription status |
| POST | `/subscriptions` | student | Initiate subscription checkout |
| POST | `/subscriptions/me/cancel` | student | Cancel at period end |
| POST | `/subscriptions/me/pause` | student | Pause collection |
| POST | `/payments/checkout/course` | student | Initiate course purchase, returns payment URL |
| GET | `/payments/invoices` | student | My invoice history |
| POST | `/payments/webhook/paystack` | public | Paystack webhook (verified by signature) |
| POST | `/payments/webhook/stripe` | public | Stripe webhook (verified by signature) |
| POST | `/admin/promo-codes` | admin | Create promo code |
| GET | `/admin/promo-codes` | admin | List all promo codes |
| PATCH | `/admin/promo-codes/:id` | admin | Update / deactivate |
| DELETE | `/admin/promo-codes/:id` | admin | Delete |
| POST | `/payments/validate-promo` | student | Validate promo code before checkout |

### 3.11 Prompt Lab

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/prompt-lab/run` | student | Submit prompt → execute against model → get Cipher score |
| GET | `/prompt-lab/attempts/:lessonId` | student | My attempts for a specific lesson |
| GET | `/prompt-library` | student | My saved prompt library |
| POST | `/prompt-library` | student | Save custom prompt |
| POST | `/prompt-library/steal/:lessonPromptId` | student | Copy lesson prompt to my library |
| PATCH | `/prompt-library/:id` | student | Update prompt label or tag |
| DELETE | `/prompt-library/:id` | student | Delete from library |

### 3.12 Capstone (Ship It)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/capstone` | student | Submit capstone project |
| GET | `/capstone` | student | My submitted projects |
| GET | `/capstone/:id` | student | Project detail |
| PATCH | `/capstone/:id` | student | Update before instructor review |
| GET | `/instructor/capstone` | instructor | All submissions for my courses |
| PATCH | `/instructor/capstone/:id/review` | instructor | Score, approve/reject, flag for pipeline |

### 3.13 AI Tutor (Cipher — via Armory)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai-tutor/chat` | student | Send message, get response (routed to Cipher via Armory) |
| GET | `/ai-tutor/:lessonId/history` | student | Conversation history for this lesson |
| DELETE | `/ai-tutor/:lessonId/history` | student | Clear conversation |

Cipher receives context: `{lesson_title, lesson_type, lesson_content_summary, user_message, conversation_history}`

### 3.14 Gamification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/xp/me` | student | My XP, level, streak, recent events |
| GET | `/xp/leaderboard` | student | Global + per-course leaderboard |
| GET | `/badges` | public | All available badges |
| GET | `/badges/me` | student | My earned badges |

### 3.15 Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/analytics` | admin | Platform-wide stats (MRR, students, churn) |
| GET | `/admin/users` | admin | User list with filters |
| PATCH | `/admin/users/:id` | admin | Update role, suspend, manual enroll |
| GET | `/admin/talent-pipeline` | admin | Flagged graduates list |
| POST | `/admin/talent-pipeline/:id/refer` | admin | Fire Armory event to Orion for project matching |
| GET | `/instructor/analytics/:courseId` | instructor | Per-course analytics (drop-off, quiz scores, Cipher queries) |

### 3.16 Live Sessions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/live-sessions` | public | Upcoming sessions |
| GET | `/live-sessions/:id` | student | Session detail + recording if available |
| POST | `/instructor/live-sessions` | instructor | Schedule session |
| PATCH | `/instructor/live-sessions/:id` | instructor | Update / add recording |

### 3.17 Code Execution (Sandbox)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sandbox/run` | student | Execute code via Piston API (proxied, rate-limited) |

Rate limit: 30 executions per student per hour.

---

## 4. TypeScript Interfaces

```typescript
// ─── Core entities ───────────────────────────────────────────────

export interface User {
  id: string
  email: string
  fullName: string
  username: string
  avatarUrl: string | null
  role: 'student' | 'instructor' | 'admin'
  countryCode: string
  currency: 'NGN' | 'USD'
  languagePreference: 'en' | 'pcm'
  emailVerifiedAt: string | null
  xpTotal: number
  streakCurrent: number
  streakLastActivity: string | null
  createdAt: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  whatYouLearn: string[]
  thumbnailUrl: string
  trailerMuxId: string | null
  instructorId: string
  learningPathId: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  category: CourseCategory
  priceNgn: number
  priceUsd: number
  isPublished: boolean
  isFeatured: boolean
  hasAiVsManual: boolean
  hasPromptLab: boolean
  hasClientBrief: boolean
  hasCapstone: boolean
  whatsappGroupUrl: string | null
  totalLessons: number
  totalDurationSecs: number
  enrolmentCount: number
  ratingAverage: number
  ratingCount: number
  createdAt: string
}

export type CourseCategory =
  | 'ui_ux' | 'web_dev' | 'mobile' | 'ai_ml'
  | 'cloud_devops' | 'architecture' | 'startups'

export interface Section {
  id: string
  courseId: string
  title: string
  position: number
  isFreePreview: boolean
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  position: number
  type: LessonType
  durationSecs: number | null
  xpReward: number
  isFreePreview: boolean
}

export type LessonType =
  | 'video' | 'written' | 'code' | 'quiz'
  | 'prompt_lab' | 'ai_debug' | 'client_brief' | 'capstone'

// ─── Content types ────────────────────────────────────────────────

export interface VideoContent {
  lessonId: string
  muxAssetId: string
  muxPlaybackId: string
  muxToken: string               // signed, short-lived
  transcript: string | null
  chapters: VideoChapter[]
}

export interface VideoChapter {
  timeSecs: number
  title: string
}

export interface WrittenContent {
  lessonId: string
  contentMd: string              // served in user's language preference
  hasPidginVariant: boolean
}

export interface CodeContent {
  lessonId: string
  starterCode: string
  solutionCode: string           // only sent after lesson complete
  manualSolution: string | null  // for AI vs Manual split view
  language: CodeLanguage
  testCases: TestCase[]
}

export type CodeLanguage =
  | 'javascript' | 'typescript' | 'python'
  | 'dart' | 'bash' | 'go' | 'rust'

export interface TestCase {
  input: string
  expectedOutput: string
  label?: string
}

export interface LessonPrompt {
  id: string
  lessonId: string
  promptText: string
  modelUsed: AiModel
  contextNote: string | null
  tag: PromptTag
  position: number
}

export type AiModel = 'claude' | 'gpt4' | 'gemini' | 'copilot'
export type PromptTag =
  | 'architecture' | 'debugging' | 'refactor'
  | 'generation' | 'review' | 'explanation' | 'testing'

// ─── Progress & assessment ────────────────────────────────────────

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  completedAt: string | null
  progressPercent: number        // computed
  lastAccessedLessonId: string | null
}

export interface LessonProgress {
  userId: string
  lessonId: string
  completedAt: string | null
  notes: string | null
  lastPositionSecs: number
}

export interface QuizAttempt {
  id: string
  userId: string
  lessonId: string
  score: number
  maxScore: number
  passed: boolean
  answers: QuizAnswer[]
  aiFeedback: string | null
  startedAt: string
  completedAt: string | null
}

export interface QuizAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  pointsEarned: number
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issuedAt: string
  verificationCode: string
  pdfUrl: string | null
}

// ─── Payments ─────────────────────────────────────────────────────

export interface Subscription {
  id: string
  userId: string
  plan: 'monthly' | 'annual'
  currency: 'NGN' | 'USD'
  status: 'active' | 'cancelled' | 'past_due' | 'paused'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface Payment {
  id: string
  userId: string
  courseId: string | null
  subscriptionId: string | null
  amount: number
  currency: 'NGN' | 'USD'
  status: 'pending' | 'success' | 'failed' | 'refunded'
  provider: 'stripe' | 'paystack'
  providerReference: string
  invoiceUrl: string | null
  createdAt: string
}

export interface CheckoutResponse {
  paymentId: string
  paymentUrl: string             // redirect to Paystack/Stripe hosted page
  provider: 'stripe' | 'paystack'
}

// ─── Unique features ──────────────────────────────────────────────

export interface PromptLabAttempt {
  id: string
  userId: string
  lessonId: string
  promptText: string
  modelUsed: AiModel
  output: string
  precisionScore: number         // 0–100
  efficiencyScore: number        // 0–100
  completionScore: number        // 0–100
  totalScore: number             // weighted average
  scoringRationale: string | null
  createdAt: string
}

export interface UserPromptLibraryItem {
  id: string
  userId: string
  sourcePromptId: string | null
  promptText: string
  modelUsed: AiModel
  tag: string | null
  customLabel: string | null
  isCustom: boolean
  createdAt: string
}

export interface CapstoneProject {
  id: string
  userId: string
  courseId: string
  title: string
  description: string
  liveUrl: string
  githubUrl: string | null
  screenshotUrl: string | null
  techStack: string[]
  isPublic: boolean
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected'
  instructorScore: number | null
  instructorFeedback: string | null
  isTalentPipelineFlagged: boolean
  submittedAt: string
  reviewedAt: string | null
}

export interface TalentPipelineEntry {
  id: string
  userId: string
  capstoneProjectId: string
  skillTags: string[]
  status: 'flagged' | 'referred' | 'engaged' | 'hired'
  referredToOrionAt: string | null
  orionEventId: string | null
  notes: string | null
  createdAt: string
}

// ─── Gamification ─────────────────────────────────────────────────

export interface XpSummary {
  userId: string
  xpTotal: number
  level: number                  // computed: Math.floor(xpTotal / 500) + 1
  xpToNextLevel: number
  streakCurrent: number
  streakLastActivity: string | null
  recentEvents: XpEvent[]
}

export interface XpEvent {
  id: string
  eventType: XpEventType
  xpAmount: number
  referenceId: string | null
  createdAt: string
}

export type XpEventType =
  | 'lesson_complete' | 'quiz_pass' | 'capstone_approved'
  | 'streak_milestone' | 'prompt_lab_score'
  | 'debug_arena_win' | 'course_complete'

export interface Badge {
  id: string
  name: string
  description: string
  imageUrl: string
  conditionType: string
  conditionValue: number
  earnedAt?: string              // present when returned as user badge
}

// ─── AI Tutor ─────────────────────────────────────────────────────

export interface AiTutorMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AiTutorConversation {
  id: string
  userId: string
  lessonId: string
  messages: AiTutorMessage[]
  modelUsed: AiModel
  updatedAt: string
}

// ─── Armory event contracts ───────────────────────────────────────

// Fired when talent pipeline entry is referred to Orion
export interface TalentPipelineReferralEvent {
  eventType: 'academy.talent.referred'
  source: 'academy-api'
  payload: {
    userId: string
    userFullName: string
    userEmail: string
    capstoneProjectUrl: string
    capstoneTitle: string
    skillTags: string[]
    courseTitle: string
    instructorScore: number
    talentPipelineId: string
  }
}

// Fired when a new course is published (triggers Scroll + Ciro)
export interface CoursePublishedEvent {
  eventType: 'academy.course.published'
  source: 'academy-api'
  payload: {
    courseId: string
    courseTitle: string
    courseSlug: string
    category: CourseCategory
    level: string
    instructorName: string
    priceNgn: number
    priceUsd: number
    thumbnailUrl: string
  }
}

// Fired when a student completes a course (triggers certificate generation)
export interface CourseCompletedEvent {
  eventType: 'academy.course.completed'
  source: 'academy-api'
  payload: {
    userId: string
    userFullName: string
    courseId: string
    courseTitle: string
    enrollmentId: string
    completedAt: string
  }
}
```

---

## 5. Folder Structure (Axon implementation target)

```
academy-api/
├── src/
│   ├── index.ts                    # Bun entry point, Express app init
│   ├── config/
│   │   └── secrets.ts              # Broker fetcher — never .env direct
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema (mirrors SQL above)
│   │   ├── migrations/             # Drizzle migration files
│   │   └── index.ts                # DB connection
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verify, role guard factory
│   │   ├── rateLimit.ts            # per-route rate limits
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── courses/
│   │   ├── sections/
│   │   ├── lessons/
│   │   ├── content/                # video, written, code content handlers
│   │   ├── prompts/                # lesson prompts + user prompt library
│   │   ├── enrollments/
│   │   ├── progress/
│   │   ├── quizzes/
│   │   ├── certificates/
│   │   ├── subscriptions/
│   │   ├── payments/
│   │   │   ├── paystack.ts
│   │   │   ├── stripe.ts
│   │   │   └── webhooks.ts
│   │   ├── prompt-lab/
│   │   ├── sandbox/                # Piston API proxy
│   │   ├── capstone/
│   │   ├── talent-pipeline/
│   │   ├── ai-tutor/               # Armory → Cipher bridge
│   │   ├── gamification/           # XP, badges, streaks, leaderboard
│   │   ├── live-sessions/
│   │   └── admin/
│   ├── services/
│   │   ├── armory.ts               # Armory HTTP event emitter
│   │   ├── mux.ts                  # Video upload + playback token
│   │   ├── s3.ts                   # File upload (thumbnails, screenshots)
│   │   ├── email.ts                # Transactional email
│   │   └── certificate.ts          # PDF generation (puppeteer)
│   └── types/
│       └── index.ts                # All interfaces from §4 above
├── CLAUDE.md                       # Claude Code agent instructions
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 6. Secrets (Broker paths)

All fetched at runtime from `secret/cirostack/academy/`:

```
secret/cirostack/academy/postgres-url
secret/cirostack/academy/jwt-access-secret
secret/cirostack/academy/jwt-refresh-secret
secret/cirostack/academy/mux-token-id
secret/cirostack/academy/mux-token-secret
secret/cirostack/academy/paystack-secret-key
secret/cirostack/academy/paystack-webhook-secret
secret/cirostack/academy/stripe-secret-key
secret/cirostack/academy/stripe-webhook-secret
secret/cirostack/academy/aws-access-key
secret/cirostack/academy/aws-secret-key
secret/cirostack/academy/aws-s3-bucket
secret/cirostack/academy/piston-api-url
secret/cirostack/academy/armory-url
secret/cirostack/academy/armory-internal-key
```

---

## 7. Armory Integration Notes

- Academy API emits events TO Armory (never receives inbound from Armory)
- All Armory calls use `POST /events` with `X-Internal-Key` header (fetched from Broker)
- Cipher responses for AI tutor: Armory returns streaming SSE — Academy API proxies stream to client
- Talent pipeline referral fires `academy.talent.referred` → Orion reads and creates a Jira story
- Course publish fires `academy.course.published` → Scroll creates blog post, Ciro creates social content

---

*End of Ferro Spec — hand to Axon for implementation*
