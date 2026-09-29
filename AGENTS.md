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

- **Stack:** Next.js 16.2.10 (Turbopack) + React 19 + Supabase (remote) + Tailwind 4.
- **No local database needed.** The app talks to a remote Supabase project.
  `lib/env.ts` has **built-in fallback publishable keys** for the Supabase URL
  and anon key, so the app boots and renders public pages with zero env vars.
- **Optional credentials** (all degrade gracefully when missing):
  `SUPABASE_SERVICE_ROLE_KEY` (admin/server operations — throws when missing,
  caught at call sites), `EMAILJS_*`, `RESEND_API_KEY`, `VAPID_*`,
  `WHATSAPP_*`, `GOOGLE_*`, `TYPESAFE_API_KEY`.
- **Health:** `GET /api/health` — cheap liveness, no DB dependency.
- **Compose:** `docker compose -f docker-compose.base44.yml up -d` (node:22-slim,
  bind-mounted source, `npm ci` then `next dev -H 0.0.0.0 -p 3000`).
- **Preview origin:** `allowedDevOrigins` in `next.config.mjs` uses
  `BASE44_PUBLIC_HOST_SUFFIX` so Next accepts the preview origin's dev assets.
