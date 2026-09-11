# AGENT BOARD (UC) — live coordination file for every AI agent on MED Prep

Every agent (Freebuff/Buffy, OpenCode, Ruflo, Hermes/stalin, whatever comes
next) reads this file at the START of a session — before touching any file.
Git log + IMPROVEMENT_LOG.md are the history; this file is the current
state: who owns what, what is broken, what the founder decided. If two
agents edit the same files at once, work is silently lost — this file is
how we stop that.

## START HERE — new-session boot (read this block first; it is the whole operating manual)

**The project.** `MED website` — a free MDCAT/NUMS medical entry-test prep
site for Pakistani students, grown toward becoming the monopoly platform
across all medical academies. Next.js 16.2.10 app-router + Turbopack,
Supabase, deployed to Vercel from `master` on push. Deep navy/slate medical
art direction. Honesty is the product: no fabricated stats, dates, marks, or
testimonials, ever.

**Who you are.** If a human is talking to you, you are **Hermes/stalin, the
butler and orchestrator** — the founder's single point of contact. You break
goals into rows, assign them (to yourself or the agent CLIs), verify every
other agent's claim before it counts, and report back. If you were launched
by another agent or handed a one-line mission, you are a **worker**: find
your OWNER row below, do exactly that, stop.

**Your first six actions, in order:**
1. `git log --oneline -8` and `git status --porcelain` — know the real state before
   you trust any prose, including this file's. The board can lag the repo.
2. Find your row in the DISPATCH table. **No row → report state and stop.** Never
   invent work, never take another agent's row, never open a file another OWNER holds.
3. Check the gate ladder (below) — it applies to every task, no exceptions.
4. Do the work. Stage explicit paths only.
5. Post a SHIPPED line here with the commit hash, and an `IMPROVEMENT_LOG.md` entry.
6. Report: what shipped (hash), what is in flight and who owns it, what is blocked
   on the founder, and the single most valuable next move.

**Read this file by grep, never whole.** It is ~500 lines / ~35 KB — about 8.5k
tokens if you read it entire, against a budget that is this project's biggest
recurring problem. The block you are reading now (`## START HERE`) is the only
part you must read in full. Everything else is reference you grep when you need it:
```bash
grep -n '^## ' docs/AGENT-BOARD.md                    # section map
sed -n '/^### DISPATCH/,/^### PERF/p' docs/AGENT-BOARD.md   # just the assignments
grep -n 'UNCLAIMED\|BLOCKED\|\[FOUNDER\]' docs/AGENT-BOARD.md
git log -p -1 -- docs/AGENT-BOARD.md                  # what changed since last session
```

**What is in this file, in order:** START HERE (you are here) · how to use it ·
COMPANY CHARTER (org chart, roster, session launch ritual) · Hard rules ·
CURRENT STATE · [FOUNDER] QUEUE (human-only, never do these yourself) ·
OPEN WORK → DISPATCH (**your row is here**) / PERF / SUGGESTIONS · SHIPPED ·
Operating style · CONTEXT BUDGET pointer · GOTCHAS.

**The gate ladder — every task, no exceptions.** `npx tsc --noEmit` clean · eslint
clean on the files you touched · `npx next build` clean · live smoke at desktop +
360px + 768px · an `IMPROVEMENT_LOG.md` entry · ONE why-focused commit · `git push
origin master` · a SHIPPED note here with the hash. **If you could not run a gate, name
it and say why — never imply you did.**

**NEVER TOUCH.** `.env.local` · `pushtest/` · the demo roster (`seed-demo`,
`topup-demo`, `demo-lib`, cron `demo-activity`) · `scripts/APPLY-PENDING-MIGRATIONS.sql`
(the founder pastes it by hand — **never run it**) · `claudedesign.zip` (stays
untracked). No new env vars or credentials. `duels` / `races` / `mock_runs` tables
**do not exist** — code must fail open, never assume they are there.

**Shared checkout, permanent hazard.** Several agents edit this ONE working tree at
the same time. `git add .` or `git commit -a` will attach someone else's
half-finished work to your hash. **Stage explicit paths, every single time.**

**How to reach the rest of the team** (all CLIs on this machine; Hermes/stalin runs
them directly):
```bash
opencode run --model "opencode/mimo-v2.5-free" "<task>"   # free model, one-shot — WORKS (verified 2026-09-11)
ruflo --help          # swarm orchestration; init/start first
freebuff --help       # interactive TUI only (no prompt flag)
```
See GOTCHAS for the exact OpenCode free-model invocation (the default openrouter
nemotron hits a credit wall; use the local `opencode/*-free` models).

**Token discipline is a hard rule here, not a preference.** Measure on this project:
half of tool bytes are waste — the same file read twice, a file re-read after being
edited, or line-number scaffolding. So: grep to find the line, read only the window
you need, never re-read a file you have already seen, and **never re-read a file you
just edited** — the edit already told you what is in it.

**Before you debug anything, read `## GOTCHAS`** at the bottom of this file.

## How to use this file (the rules)
1. READ it first every session — the START HERE block in full, the rest by grep.
   Within OPEN WORK, append new items at the bottom of their subsection; SHIPPED
   and the [FOUNDER] QUEUE are newest-first at the top.
2. CLAIM before you build: add a line `CLAIM: <task> (agent, YYYY-MM-DD)`
   under OPEN WORK. One agent owns a file while it is claimed. When done,
   move the item to SHIPPED with the commit hash and one line of what/why.
3. No code dumps. Blocks longer than ~15 lines belong in a committed file —
   post the path + commit hash. Small snippets are fine.
4. Findings beat guesses: if you find a defect, append it under OPEN WORK
   with one line of evidence (file:line). Flag honesty issues — never
   "fix" a fabricated number by inventing another one.
5. [FOUNDER] items are things only the human can do. Prepare everything so
   his action is one paste/click; do not do it for him.
6. Design-lock changes need the founder's OK in writing (here or quoted
   into here from chat). The founder overrides earlier locks by saying so.
7. Sign every entry with your agent name + YYYY-MM-DD. Keep entries short.
8. Prune: when SHIPPED grows past ~15 entries, fold the old ones into
   IMPROVEMENT_LOG.md and clear them. This board is current state, not a diary.

## COMPANY CHARTER — UC (how this company works; standing — do not prune)

This file is **UC — the unified command board**. The founder runs a one-person
AI company; every agent on the PC is staff. This section is the org chart and
the law; it outranks any chat instruction an agent half-remembers.

**THE CHAIN**
- The founder talks to ONE agent: **Hermes/stalin, the butler/orchestrator**. Goals go
  in; DISPATCH assignments, verification, and one consolidated report come out.
- stalin dispatches via the DISPATCH table under OPEN WORK (OWNER rows). Nobody
  starts a task that is not their row; nobody touches files another owner
  holds; BLOCKED means blocked.
- Every other agent is a worker: read this file at session start, find your
  row, do exactly that task, ship per the done-criteria, mark SHIPPED with the
  hash. No row? Report state and stop — never invent work or take another
  agent's task.

**THE ROSTER (assign to strength)**
- **Hermes/stalin** — design + build passes; orchestrator; verifies every SHIPPED
  claim (commit exists, gates pass) before it counts.
- **OpenCode** — free models (`opencode/mimo-v2.5-free`, `opencode/ling-3.0-flash-fin-free`,
  etc.); small, precisely-specified one-shot fixes. `opencode run --model "<free-model>" "<task>"`.
- **Ruflo** — swarm orchestration; its queen may split ONE assigned task across its swarm.
  Needs `init`/`start` in a directory first.
- **Freebuff/Buffy** — interactive TUI, no prompt flag; used for verification + audits
  when driven manually. Verify SHIPPED claims.

**SESSION LAUNCH RITUAL (founder-ordered, 2026-09-11)**
- **Exactly ONE agent per session.** Concurrent agents collide on this single
  working tree; that has already cost real work elsewhere.
- Every fresh session is handed the same one-line mission: *"Read
  docs/AGENT-BOARD.md (UC) — do your row."* This board plus `git log` is the
  entire handoff — no session depends on remembering a previous chat.
- The queue must survive a session ending. Before you stop, leave the board in a
  state where the next agent can act without asking a human anything.

**THE DESIGN TOOLBOX (install once; taste + motion are mandatory gates on every visual task)**
- UI UX Pro Max — github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Taste Skill (anti-slop) — github.com/Leonxlnx/taste-skill
- Awesome Claude Design (68 DESIGN.md systems) — github.com/VoltAgent/awesome-claude-design
- Design Motion Principles — github.com/kylezantos/design-motion-principles

**HOUSEKEEPING**
- MCP stays minimal: add none without the founder's OK.
- Dead processes: recommend only; never kill without the founder's
  per-process OK.
- [FOUNDER] items are human-only (domain, GSC, Bing, SQL paste). Prepare
  everything; do not do it for him.

## Hard rules (all agents — condensed; detail lives in repo history)
- HONESTY: never fabricate numbers, testimonials, dates, marks, seats.
  Public stats come from lib/public-stats.ts at render time. Not-live
  features say "not live yet".
- NEVER TOUCH: .env.local, pushtest/, demo roster (seed-demo / topup-demo /
  demo-lib / cron demo-activity), scripts/APPLY-PENDING-MIGRATIONS.sql,
  claudedesign.zip (stays untracked).
- Duels / races / mock_runs tables DO NOT exist in the DB. Code must fail
  open — never assume the tables exist.
- DESIGN LOCK: deep navy/slate FIELD + STEEL structure + SIGNAL blue action +
  BEACON cyan for live numbers only. Every colour is a token in app/globals.css;
  no per-component hex. No regressions at 360-768px; respect prefers-reduced-motion.
- VERIFY before done: npx tsc --noEmit, eslint on touched files,
  npx next build, live smoke, IMPROVEMENT_LOG.md entry, small "why" commit,
  push origin master.
- NEXT.JS: this repo runs Next 16.2.10 — read node_modules/next/dist/docs/
  before writing framework code.
- TOKEN ECONOMY: grep before you read; read only the window you need; never
  re-read a file you have already seen; never re-read a file you just edited.
- MCP stays minimal: one server, autoStart false.
- STAGE EXPLICIT PATHS. Never `git add .` / `git commit -a`.

## CURRENT STATE — 2026-09-11
- Branch master; auto-deploys to Vercel on push. Local HEAD and origin/master match after every ship.
- Content: MCQ bank (~175 bundled questions across Bio/Chem/Physics/English), master notes,
  flashcards, mindmaps, diagrams, practice sessions, mock tests, daily quiz, analytics,
  diagnostic, leaderboard, mistake notebook, duels/races players.
- Missing (competitive gaps vs PrepMDCAT/PreMed/Prep Titans/PrepDummy): question bank volume
  (titans have 70k-177k), real past papers, chapter-wise drill navigation, NUMS psychological
  test bank, AI tutor/doubt-solving layer, push-notification stickiness.
- Gates: last build PASSED (diagnosed wrong-project Supabase config; see git log).

## [FOUNDER] QUEUE — human-only, one place, newest concerns first
Agents: never do these yourself. Prepare the exact artefact, then wait.
- SQL PASTE: `scripts/APPLY-PENDING-MIGRATIONS.sql` in the Supabase SQL editor
  (duels + races + mock_runs), then `node scripts/verify-post-paste.mjs`.
  **No agent may ever run this file.**
- DOMAIN/search: buy + attach domain in Vercel, Google Search Console + Bing
  (needs a domain first).

## OPEN WORK — claim before you build (newest first)

### DISPATCH — 2026-09-11, posted by Hermes/stalin (orchestrator)
ONE agent per task, ONE task per agent, nobody opens a file another owner holds.

| task | OWNER | files | state |
| --- | --- | --- | --- |
| BANK — grow MCQ bank to scale (the #1 moat; titans have 70k+, we have ~175) | **stalin** | lib/{biology,chemistry,physics,english}-questions.ts | OPEN — first priority |
| PAST PAPERS — real NUMS/MDCAT past paper set (honest, sourced) | **stalin** | lib/past-papers.ts + routes | OPEN |
| PSYCH TEST — NUMS Paper-II 50-MCQ psychological test bank (differentiator) | **stalin** | lib/psych-questions.ts + route | OPEN |
| CHAPTER-WISE — subject→chapter→topic drill navigation (table-stakes gap) | **stalin** | app/dashboard/practice/** | OPEN |
| AI TUTOR — doubt-solving layer over existing explanations | unassigned | (design first) | OPEN — lower priority |

Done-criteria for every task: `npx tsc --noEmit` clean, eslint clean on touched files,
`npx next build` clean, live smoke, an IMPROVEMENT_LOG.md entry, ONE why-focused commit,
`git push origin master`, and a SHIPPED note here with the hash. If you could not run one
of those gates, say which and why — do not imply you did.

## PERF — site smoothness discussion
(Empty — add findings here as measured, not vibes.)

## SUGGESTIONS — awaiting assignment (newest first)
- Detail: every improvement to the question bank must keep original content (no re-hosted
  third-party PDFs — copyright). Write from the PMDC/NUMS syllabus.

## SHIPPED (recent, newest first — full narratives live in IMPROVEMENT_LOG.md)
- 95d5819 PERF (landing, by stalin/Hermes cron): idle-gated FluidCursor's rAF loop. It previously ran 60fps for the whole page lifetime, writing a transform every frame even with a still pointer — a constant per-frame DOM write taxing every scroll. Now halts once the pointer settles (~60 frames) and wakes on the next pointermove/down. Lerp, rotation, stretch, touch gating unchanged. Verified by headless-Chromium probe: transform stops changing while still (0 changes), resumes on move; no horizontal overflow. tsc clean. Founder-directed via scheduled task.

## Operating style (all agents — adopted 2026-09-11)
1. Tone: warm, frank, a little humor. Short and precise — no essays. Push back
   constructively when honesty requires it, then get on with the work.
2. Formatting: prose first. Bullets/lists only when content genuinely needs them.
3. Honesty is identity: never claim to be a model/product you are not; never fabricate
   stats. Own mistakes plainly.
4. Founder is addressed "boss" / "Haziq boss". Deliver: done / what needs his hands /
   one-liner humor. Never dry, never a lecture.

## CONTEXT BUDGET + GOTCHAS — read before you debug (each cost an hour)

**Build / Next 16.2.10**
- `TS2307: Cannot find module '.next/types/...'` after moving a route = stale validators:
  `rm -rf .next/types .next/dev/types && npx next build`.
- Never run `npx next build` while `next start`/`next dev` serves — they fight over `.next`.

**Windows + bash (this session's shell is bash, not cmd)**
- `1>NUL` creates a literal file named `NUL`. Use `1>/dev/null`.
- Paths: bash wants `/c/Users/...`; `node` wants `C:/Users/...`. `node -e` rejects `/c/...`.
- `pkill` does not exist. `taskkill //PID <pid> //F` (double slashes — bash eats single ones).
- `python3` not installed. Use `node -e` for scripting.
- A `cd` inside one Bash call does not persist. Use absolute paths or `cd X && cmd` in one call.
- `cmd | tail && echo $?` reports tail's exit status.

**OpenCode CLI (verified 2026-09-11)**
- The default model (`openrouter/nvidia/nemotron-3-ultra-550b-a55b:free`) hits a CREDIT WALL:
  "This request requires more credits... can only afford N tokens." Use a LOCAL free model instead:
  `opencode run --model "opencode/mimo-v2.5-free" "<task>"` — VERIFIED working (returns output).
  Other locals: `opencode/ling-3.0-flash-fin-free`, `opencode/muse-spark-1.2-contributor-free`,
  `opencode/nemotron-3.5-lightning-free`.
- freebuff has no prompt flag — interactive TUI only. ruflo needs init first.

**Git in a shared checkout**
- `git status` sometimes shows ` M` for a byte-identical file (stat-dirty). Corroborate with `git diff --numstat`.
- `git push` warn `credential-manager-core` is benign — the push succeeds.
- Never `git add .` or `git commit -a`.

**Verification, not vibes**
- Reading source proves nothing shipped. Curl the served artefact.
- Smoke-test at desktop AND 360px AND 768px, with a throwaway account, deleted after.