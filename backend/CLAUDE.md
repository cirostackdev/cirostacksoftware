# CLAUDE.md — Academy API (Axon)

> Agent instructions for working on the CiroStack Academy backend.

## What this is

Express + Drizzle + Postgres API for the CiroStack Academy learning platform.
Runs on port 4000. Fronted by Volt (Next.js at `academy.cirostack.com`).

## Location

```
C:\Users\USER\Desktop\cirostackacademy\academy-api\
```

Run all commands from inside `academy-api/`.

## Commands

```bash
bun install          # install deps
bun run dev          # dev server on :4000 (watch mode)
bun run start        # production start
bun run db:generate  # generate drizzle migrations
bun run db:migrate   # run pending migrations
bun run db:seed      # seed demo data
bun run db:studio    # drizzle studio UI
```

## Tech stack

| Concern | Choice |
|---|---|
| Runtime | Bun |
| Framework | Express 4 |
| ORM | Drizzle ORM |
| Database | Postgres |
| Auth | JWT (access 15min, refresh 30d) httpOnly cookie |
| Validation | Zod |
| Video | Mux |
| Payments | Paystack (NGN) + Stripe (USD) |
| File storage | AWS S3 |
| Code sandbox | Piston API (self-hosted) |
| AI | Cipher via Armory event bus |
| Secrets | Broker at `secret/cirostack/academy/*` |

## Conventions

- TypeScript strict mode — no `any`
- Module pattern: each domain in `src/modules/{name}/` with `{name}.router.ts` + `{name}.service.ts`
- Services handle business logic; routers handle HTTP I/O and call services
- All responses: `{ data: T }` for success, `{ error: string, details?: unknown }` for errors
- Error handler in `src/middleware/errorHandler.ts` handles all unhandled errors
- Use Zod schemas for all request body/query validation
- Secrets ONLY from Broker — never from `.env` directly in production

## Project structure

```
src/
├── index.ts              # Express app bootstrap
├── config/secrets.ts     # Broker secret fetcher
├── db/
│   ├── schema.ts         # Drizzle schema (26 tables)
│   ├── migrations/       # Generated migration files
│   ├── index.ts          # DB singleton
│   └── seed.ts           # Demo data seeder
├── middleware/
│   ├── auth.ts           # JWT verify + role guard
│   ├── rateLimit.ts      # Rate limiters
│   └── errorHandler.ts   # Global error handler
├── modules/              # Feature modules
│   ├── auth/
│   ├── users/
│   ├── courses/
│   ├── sections/
│   ├── lessons/
│   ├── content/
│   ├── prompts/
│   ├── enrollments/
│   ├── progress/
│   ├── quizzes/
│   ├── certificates/
│   ├── payments/
│   ├── subscriptions/
│   ├── prompt-lab/
│   ├── sandbox/
│   ├── capstone/
│   ├── ai-tutor/
│   ├── gamification/
│   ├── live-sessions/
│   └── admin/
├── services/
│   ├── armory.ts
│   ├── mux.ts
│   ├── s3.ts
│   ├── email.ts
│   └── certificate.ts
└── types/index.ts
```
