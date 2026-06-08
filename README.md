# Tribes — World Cup 2026 Prediction League

Predict every World Cup 2026 match, earn points for accuracy, and climb private
league leaderboards with your friends.

Built with **Next.js (App Router, TS)**, **Prisma + PostgreSQL**, **Tailwind v4**,
**Auth.js (Google)**, and **Framer Motion**.

## Features

- Google sign-in (plus an env-gated dev login for local development)
- Create / join / leave private leagues via 6-character invite codes
- Score predictions with a hard 5-minute pre-kickoff lock
- Idempotent scoring engine
  - Exact score: 10 · Goal difference: 6 · Outcome: 4 · Wrong: 0
  - Knockout matches ×1.5
  - Knockout split rule: the outcome tier counts **penalty-shootout winners**,
    while exact/goal-difference tiers use the regulation+ET scoreline
- Per-league leaderboards with tie-breaks (exact hits, then earliest picks)
- Match data from [football-data.org](https://www.football-data.org) with an
  automatic bundled-JSON fallback when no API token is set

## Quick start (local)

Requirements: Node 20+, Docker.

```bash
# 1. Start Postgres (mapped to host port 5433 to avoid clashing with a native PG)
docker compose up -d

# 2. Install deps
npm install

# 3. Apply the schema and seed demo data
npm run db:migrate
npm run db:seed

# 4. Run it
npm run dev
```

Open http://localhost:3000 and sign in with the **dev login** (any email, e.g.
`dev@tribes.local`). The seed grants `dev@tribes.local` superadmin (`/admin`).

> Note: Prisma's engine cache is written under `~/.cache`. In restricted
> sandboxes run Prisma CLI commands with `HOME="$PWD/.prisma-home"` prefixed.

## Environment

See [.env.example](.env.example). Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials |
| `ENABLE_DEV_LOGIN` | `true` enables the local credentials login (never in prod) |
| `ADMIN_EMAILS` | Comma-separated superadmin allowlist |
| `FOOTBALL_DATA_API_TOKEN` | Optional; omit to use bundled JSON fixtures |
| `CRON_SECRET` | Bearer secret required by `/api/cron/sync` |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run verify` | typecheck + lint + unit/component tests + build + E2E |
| `npm run test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright E2E (auto-starts the dev server) |
| `npm run db:migrate` / `db:seed` / `db:reset` | Prisma DB workflows |

## Scoring sync

A protected endpoint runs the sync + scoring job:

```bash
curl -X POST "$APP_URL/api/cron/sync" -H "Authorization: Bearer $CRON_SECRET"
```

Two free ways to schedule it:

- **Vercel Cron** — configured in [vercel.json](vercel.json). On the Hobby plan
  this only fires once per day; Vercel auto-sends `Authorization: Bearer $CRON_SECRET`.
- **GitHub Actions** (recommended for frequent updates) — add a scheduled
  workflow that runs the curl above every ~10 minutes using repo secrets
  `APP_URL` and `CRON_SECRET`. Example schedule: `*/10 * * * *`, plus
  `workflow_dispatch` for manual runs.

## Going live (one-time, requires your accounts)

1. Provision Postgres (Neon/Supabase free tier) → set `DATABASE_URL`,
   run `npm run db:deploy`.
2. Create a Google OAuth app → set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`,
   add `https://<domain>/api/auth/callback/google` as a redirect URI.
3. (Optional) Get a football-data.org token → set `FOOTBALL_DATA_API_TOKEN`.
4. Deploy to Vercel, set all env vars (`ENABLE_DEV_LOGIN=false`), and add the
   scheduler.

## Architecture

```
app/                  Routes, server actions, API endpoints
  actions/            Server actions (leagues, predictions, admin, auth)
  api/auth/           Auth.js handler
  api/cron/sync/      Protected sync + scoring endpoint
components/           UI primitives + feature components
lib/
  scoring.ts          Pure scoring logic (unit-tested)
  scoring-service.ts  Idempotent DB scoring
  locking.ts          5-minute lock + predictability (unit-tested)
  matches/            Provider adapter (football-data + JSON) + sync
  leaderboard.ts      Standings with tie-breaks
prisma/               Schema, migrations, seed, JSON fixtures
e2e/                  Playwright tests + global DB seed
```
