# Apex Pakistan — agent entry point

This repository is the Apex Pakistan application (`agma668/mdcatprep`). Treat it as a standalone product and work only in this repository and its connected infrastructure. Do not follow sibling-project paths, reuse another website's database, or import unrelated handoff code/content. The active backend is the founder-confirmed Supabase project `edweb`; the connected Vercel application is also `edweb`.

Honesty is the product (no fabricated stats, dates, marks, seats or testimonials). Before changing code, read `TODO.md`, the roadmap board, and the relevant specialist board. The gate ladder is `tsc` · eslint on touched files · `next build` · live smoke at desktop + 360/390px + 768px · an improvement-log entry · one why-focused commit. Stage explicit paths only.

## Project-specific guidance

- The active working branch is `main`; verify the current branch head and Vercel production source before deployment work.
- Read `ROADMAP-AGENT-BOARD.md` first, then the relevant specialist board: `DESIGN-AGENT-BOARD.md` or `SEO-AGENT-BOARD.md`.
- Read `PRODUCT-ARCHITECTURE-DECISION.md`, `EXAM-READINESS-AUDIT.md`, `EXAM-REGISTRY-PROPOSAL.md` and `EXAM-DATA-BOUNDARY-DESIGN.md` before changing exam routing, question ownership, progress or access.
- Do not modify production database schema/data, production secrets, deployment protection, custom domains or billing without task-specific approval. Preserve the existing Apex `edweb` project; do not create, reset or switch to another Supabase project as part of routine work.
