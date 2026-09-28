# MED Prep — agent entry point

Shared rules for all three projects in `C:\Users\admin\Downloads\projects\`
live one level up. Read `../AGENTS.md` first: honesty is the product (no
fabricated stats, dates, marks, seats or testimonials), the gate ladder
(`tsc` · eslint on touched files · `next build` · live smoke at desktop +
360/390px + 768px · a log entry · ONE why-focused commit), stage explicit
paths, one agent per tree.

Skills are shared — the canonical copy is `../skills/`, not a copy in here.
Cross-project router: `../BOARD.md`.

Two things specific to this repo:

- **The default branch is `master`**, unlike the other two projects (`main`).
- **It has no board of its own yet.** MED Prep is Cadet Prep's sibling and was
  brought up to Cadet's UI/UX deliberately (see the `OUTPUT → sibling MED Prep
  site` row on the Cadet Prep board); it inherits the shared rules and nothing
  project-specific. Add a board here when it earns one.

## Base44 dev environment

- **Run with:** `docker compose -f docker-compose.base44.yml up -d` — a single
  `node:22-slim` service bind-mounting the source, installing deps into a named
  volume, and running `next dev` (Turbopack) on port 3000. No local database:
  the app talks to a **remote Supabase project**.
- **Boots without credentials.** `lib/env.ts` embeds a built-in publishable
  Supabase URL + anon key as a fallback, so the public landing page renders
  even with zero env vars. Server-side DB calls (`createServiceClient` in
  `lib/supabase/service.ts`) throw when `SUPABASE_SERVICE_ROLE_KEY` is absent,
  but every public-facing caller catches that and fails open (hides the
  section instead of crashing).
- **To enable auth / admin / DB features**, set `SUPABASE_SERVICE_ROLE_KEY`
  (and optionally `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  to override the built-in pair) via the Base44 secrets dashboard.
- **Health check:** `GET /api/health` returns 200 with no DB dependency.
- **Dev-origin allowlist:** `next.config.mjs` reads `BASE44_PUBLIC_HOST_SUFFIX`
  to populate `allowedDevOrigins` — needed so the preview proxy can fetch dev
  assets/HMR.
