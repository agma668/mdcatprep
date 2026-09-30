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

- **Stack:** Next.js 16 (Turbopack) + React 19 + Supabase + Tailwind v4.
- **Run:** `docker compose -f docker-compose.base44.yml up -d` — uses
  `node:22-slim`, bind-mounts the repo, runs `npm ci` then `next dev -H 0.0.0.0`.
- **Port:** 3000 (mapped in compose). Healthcheck probes `/api/health`.
- **Supabase keys:** The publishable URL + anon key have built-in fallbacks in
  `lib/env.ts`, so the app boots and renders without any env vars. The
  service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is optional — admin/server
  features throw a descriptive error without it but the site renders fine.
- **Other integrations** (EmailJS, Google Drive, VAPID, WhatsApp, CRON_SECRET)
  are all optional and degrade gracefully.
- **`allowedDevOrigins`** in `next.config.mjs` uses `BASE44_PUBLIC_HOST_SUFFIX`
  so the preview origin can access dev assets/HMR. Do not remove.
- **Verify:** `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/`
  → 200; `docker compose -f docker-compose.base44.yml ps` → healthy.
