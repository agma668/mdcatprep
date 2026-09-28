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

- **Run:** `docker compose -f docker-compose.base44.yml up -d` — Node 22 +
  `next dev` (Turbopack) on port 3000, source bind-mounted so edits hot-reload.
- **No local DB.** Supabase is a remote project; the publishable URL/anon key
  are built into `lib/env.ts` as fallbacks, so public pages render without any
  env vars. `SUPABASE_SERVICE_ROLE_KEY` is only needed for server-side/admin
  queries — `getPublicStats()` and the middleware catch its absence and fail
  open (hero stats from static floors, board/analytics hidden).
- **No secrets required to boot.** All boot-critical config has built-in
  fallbacks. Optional integrations (Resend, WhatsApp, VAPID, EmailJS, Google
  Drive, TYPESAFE_API_KEY, CRON_SECRET) can be added via the secrets dashboard
  but are not needed for the landing page or auth.
- **Preview origin:** `allowedDevOrigins` in `next.config.mjs` reads
  `BASE44_PUBLIC_HOST_SUFFIX` so the preview proxy origin is accepted.
- **Verify:** `curl localhost:3000/api/health` → `{"status":"ok",...}`.
