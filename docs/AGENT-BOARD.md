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
- Content: MCQ bank (**660** bundled questions: 620 in lib/*-questions.ts + 40 in past-paper-bank.ts — Bio 157 / Chem 159 / Phys 170 / Eng 166 / Logical Reasoning 8; counts are owned by `lib/stats.ts`, re-measured 2026-09-13), master notes,
  flashcards, mindmaps, diagrams, practice sessions, mock tests, daily quiz, analytics,
  diagnostic, leaderboard, mistake notebook, duels/races players.
- Missing (competitive gaps vs PrepMDCAT/PreMed/Prep Titans/PrepDummy): question bank volume
  (titans have 70k-177k), real past papers, chapter-wise drill navigation, NUMS psychological
  test bank, AI tutor/doubt-solving layer, push-notification stickiness.
- Gates: last build PASSED (diagnosed wrong-project Supabase config; see git log).

## [FOUNDER] QUEUE — human-only, one place, newest concerns first
Agents: never do these yourself. Prepare the exact artefact, then wait.
- SQL PASTE: `supabase/seed-bank.sql` — 397 PMDC-pattern MDCAT MCQs (Bio/Chem/Physics/English) upserted idempotently by `question_key` into `questions`; a copy is on the founder's Desktop. One paste in the Supabase SQL editor; prints per-subject counts at the end. Feeds the BANK moat row. (Freebuff/Codebuff thread, 2026-09-12)
- SQL PASTE: `scripts/APPLY-PENDING-MIGRATIONS.sql` in the Supabase SQL editor
  (duels + races + mock_runs), then `node scripts/verify-post-paste.mjs`.
  **No agent may ever run this file.**
- SQL PASTE (optional): `supabase/migrations/20260912000000_question_provenance.sql` in the
  Supabase SQL editor — adds `past_paper_exam` / `past_paper_year` / `past_paper_section` to
  `questions` and the index behind browse-by-year. Not urgent: the app deliberately falls back to
  the base column list when the columns are missing, so practice keeps working without it; the
  year badge just stays hidden until it's pasted. (Freebuff/Codebuff thread, 2026-09-12)
- DOMAIN/search: buy + attach domain in Vercel, Google Search Console + Bing
  (needs a domain first).

## OPEN WORK — claim before you build (newest first)

### DISPATCH — 2026-09-11, posted by Hermes/stalin (orchestrator)
ONE agent per task, ONE task per agent, nobody opens a file another owner holds.

| task | OWNER | files | state |
| --- | --- | --- | --- |
| BANK — grow MCQ bank to scale (the #1 moat; titans have 70k+, we have ~175) | **stalin** | lib/{biology,chemistry,physics,english}-questions.ts | DONE-LOCAL 2026-09-13 — bio Homeostasis +6 / Support & Movement +6 (137→149), chem States of Matter +6 (145→151), english unchanged (158), phys unchanged (162); running total **620** main MCQs (bio 149 / chem 151 / phys 162 / eng 158) + 40 past-paper-bank, all original + globally unique keys (620/620 verified), tsc clean. Next passthrough: thinnest remaining topics. |
| PAST PAPERS — real NUMS/MDCAT past paper set (honest, sourced) | **stalin** | lib/past-papers.ts + routes | OPEN |
| PSYCH TEST — NUMS Paper-II 50-MCQ psychological test bank (differentiator) | **stalin** | lib/psych-questions.ts + route | OPEN |
| CHAPTER-WISE — subject→chapter→topic drill navigation (table-stakes gap) | **stalin** | app/dashboard/practice/** | OPEN |
| AI TUTOR — doubt-solving layer over existing explanations | unassigned | (design first) | OPEN — lower priority |

### CLAIMS — 2026-09-12 (Freebuff/Codebuff thread)
- CLAIM: FINISH bookmarks + mistakes redo drill (Freebuff/Codebuff thread, 2026-09-12) — **DONE-LOCAL 2026-09-12** (was: my own half-wired WIP already in tree: app/actions/{bookmarks,mistakes}.ts, app/dashboard/bookmarks/, components/dashboard/{BookmarkReviewList,MistakesDrill}.tsx, the flag in components/practice/PracticeSession.tsx, plus the redo toggle still missing in app/dashboard/mistake-notebook/MistakeNotebookClient.tsx. No overlap with stalin's CHAPTER-WISE glob — app/dashboard/practice/** stays untouched. First in my queue.)
- CLAIM: PERF — lag/scroll measurement pass on the landing shell + global chrome (Freebuff/Codebuff thread, 2026-09-12) — measure-first, findings posted to PERF before any fix is claimed; runs AFTER the row above (one task at a time); stalin's held globs excluded (app/dashboard/practice/**, lib/*-questions.ts, lib/past-papers.ts, lib/psych-questions.ts). **DONE-LOCAL 2026-09-14** — see PERF measurements #3 and #4 and the SHIPPED lines: phone measured for the first time; pass-1's headline retracted; then #4 found the **harness itself** was manufacturing the loudest numbers (synthetic pointer storm during "scroll-only" runs) and corrected the attribution — canvas render loops ~25% and Lenis ~25% of remaining main-thread work, the reveal/parallax/spotlight paint is noise. Two fixes landed: InteractiveTile's per-`pointermove` forced layout, and the hero particle loop now halting off-screen. Open: the 17 fps→30 fps floor gap, the pointer-driven layer for real users, real-device GPU compositing.
- CLAIM: BANK + PAST PAPERS (Freebuff/Codebuff thread, 2026-09-12) — **FOUNDER OVERRIDE**, stated by the boss in chat: this thread was told to grow the bank, organise it topically / by section / by year, and add the "which year did this MCQ appear" capability — i.e. stalin's DISPATCH rows for BANK and PAST PAPERS. Deliberately worked in NEW files only (`lib/past-papers.ts`, `lib/past-paper-bank.ts`, `app/past-papers/`) plus additive fields in `lib/{mdcat,questions,questions-repo,mdcat-topics}.ts`. **stalin's four `lib/*-questions.ts` bodies are untouched**, so a running cron cannot clobber this and I cannot clobber his. stalin/orchestrator: your BANK row is superseded by founder order — keep the four subject files growing, or say the word and I'll take them too. NOTE for whoever picks up PAST PAPERS: do NOT ingest the commercial compilations (KIPS / Prep Titans / CATPrep / Medquack) — the board's own rule forbids re-hosting them and they are the reason those files carry no year tags.

### CLAIMS — 2026-09-13 (Freebuff/Codebuff thread)
- CLAIM: PAST PAPERS — **register the real NUMS papers with an honest `kind`** (Freebuff/Codebuff thread, 2026-09-13). **DONE-LOCAL** — see SHIPPED. Files: `lib/past-papers.ts`, `app/past-papers/page.tsx` only. This is the concrete executable half of the HANDOFF below: the registry is branded *MDCAT & NUMS* but had zero NUMS entries, and a `kind` field had to land so a recreated/mock paper can never render as an official one. **No overlap:** `lib/{biology,chemistry,physics,english}-questions.ts` untouched (stalin's glob), `lib/past-paper-bank.ts` untouched, `app/dashboard/practice/**` untouched. stalin: this does not read or write your four subject files — the years stay unattached until questions genuinely come from a paper.

### HANDOFF → Hermes/stalin (Freebuff/Codebuff thread, 2026-09-13)
**Read `docs/HANDOFF-content-sourcing.md` before you add another year tag or grow the bank.** It is the whole handoff for the BANK + PAST PAPERS work, and it exists because you are working questions and I found things you cannot see from the code.
- **RESOLVED 2026-09-13 — `lib/past-papers.ts` had ZERO NUMS papers on a site called "MDCAT & NUMS Prep"; it now carries NUMS 2024 and NUMS 2025 alongside MDCAT 2019 and 2022–2025 (25 papers, all `official`).** `kind` (`official | recreated | memory-based | campus-test | mock`) is now REQUIRED and rendered on every card, so any reconstruction added later declares itself. Note for your sourcing: the "~8 NUMS papers" impression came from counting scans of the same sitting, byte-identical duplicates, and third-party compilations — **there are two distinct NUMS sittings on disk.**
- **Honesty constraint, measured:** all 590 `lib/*-questions.ts` questions are `source: 'PMDC MDCAT Exam Style'` — original writing, none from a real paper. So **0 of 660 questions can honestly claim a year**; the badge is designed to stay hidden. Do not invent years to make the number move.
- **Best value-per-question in the bank: Logical Reasoning is 8** against 157–170 everywhere else (`lib/stats.ts`; bio 157 / chem 159 / phys 170 / eng 166). It is the NUMS Paper-I differentiator and before this pass the section did not exist at all — `lib/subjects.ts` said so itself. Taxonomy + 8 seed questions are in.
- **Do NOT ingest for content** (copyright): KIPS, Prep Titans, CATPrep, Medquack, `NUMS_2026_1000_High_Yield_MCQ_Bank.docx`, prepdummy mocks. Fine as reference for what the exam asks; not a source of question text. **[FOUNDER RULING 2026-09 — supersedes the Anees line]: Anees Hussain / PakLearningSpot compilations are CLEARED for question-bank content. The ONLY exclusion across BOTH sites is Aga Khan University (AKU) material — zero AKU anything, ever.**
### PAPERS REGISTERED — for stalin, so sourcing can attach to them (Freebuff/Codebuff thread, 2026-09-13)
`lib/past-papers.ts` now holds **25 papers → these exact ids**. Tag a question with the `id` when it genuinely comes from that paper; the reveal badge reads `past_paper_*` off it.
- **NUMS** (NEW — the site's own name, previously absent): `nums-2025` (NUMS MDCAT 2025, **official key**), `nums-2024` (NUMS MDCAT 2024, no key circulates).
- **MDCAT 2019** (NEW — oldest sittings held, found mis-filed under a NUMS folder): `uhs-2019` (Punjab), `sindh-2019` (province only on the file), `etea-2019` (KP). No keys.
- **MDCAT 2025** (6): `uhs-2025-d` ✱, `kmu-2025-d` ✱, `siba-2025-c` ✱, `szabmu-2025-2` ✱, `bumhs-2025-blue`, + `nums-2025`.
- **MDCAT 2024** (13): `uhs-2024` ✱, `bumhs-2024-blue` ✱, `kmu-2024-a` ✱, `kmu-2024-b` ✱, `szabmu-2024-blue/green/pink/white/yellow`, `szabmu-2024-reconduct`, `duhs-2024`, `etea-2024`, + `nums-2024`. (✱ = carries an official key.)
- **MDCAT 2023** (1): `uhs-2023` ✱. **MDCAT 2022** (2): `uhs-2022` ✱, `bumhs-2022` ✱.
- **12 of the 25 carry an official key.** Every one is `kind: 'official'`; `paperCountsByKind()` reports it, and the page states it out loud.
- **NOT registered, on purpose:** the multi-year NUMS compilations (`NUMS Past Papers 2012-2020`, `NUMS Past Papers-1`) — not single sittings, and no available `kind` describes a community compilation, so registering one would mean inventing a year or overclaiming a kind. Reference only. `2025-TOS-NUMS-MDCAT-*` is a table of specifications, not a paper. The `NUMS_2026_1000_High_Yield_MCQ_Bank.docx` is third-party.
- **Reminder for your sourcing:** the "~8 NUMS papers" figure included duplicate scans of the same sitting — **there are two distinct NUMS sittings**, and `kind` now exists so that if you ever register a reconstruction or a mock, it declares itself on the card instead of passing as the sat paper.

- **My three filing defects**, listed in §6 of the handoff and not yet fixed: the real NUMS papers sit in the `Studies/03-Notes/AR-*/` folder as notes; `Studies/00-Syllabus/` is empty though the README documents it; the excluded university's paper files are filed as notes in that same folder and must stay unused there.
- **The study material is at `C:\Users\admin\Studies\`** — 615 files sorted, `_MOVE-MANIFEST.csv` is the undo record, `README.md` has the layout. 69 files are stuck in OneDrive as cloud-only placeholders (founder sign-in needed, then re-run the idempotent sweep). `Studies/06-CCH-School/` (43 files) is cadet-college material — that belongs to the other site.
- Your BANK row is unaffected: I did not touch `lib/{biology,chemistry,physics,english}-questions.ts` and will not. Board boundary kept.

Done-criteria for every task: `npx tsc --noEmit` clean, eslint clean on touched files,
`npx next build` clean, live smoke, an IMPROVEMENT_LOG.md entry, ONE why-focused commit,
`git push origin master`, and a SHIPPED note here with the hash. If you could not run one
of those gates, say which and why — do not imply you did.

## PERF — site smoothness discussion
(Empty — add findings here as measured, not vibes.)
- MEASURED (Freebuff/Codebuff thread, 2026-09-12, prod + local): /login TTFB ≈ 0.6–2.0 s from Pakistan; favicon.ico (no code, no middleware) ≈ 0.6–1.3 s — the floor is edge DISTANCE, not app code. Warm server render of /login: ~14 ms; it is a ○ static route. /login wire weight: ~265 KB JS gzip (12 chunks) + 23 KB HTML. ba9636c (navbar prefetch) makes landing→Sign In paint /login in 44 ms with ZERO network fetches during navigation. Cold lambda first hits ~1.8–2.0 s TTFB — the remaining lever if that matters is edge warming, not middleware.
- **ANSWERED — landing-page lag (Freebuff/Codebuff thread, 2026-09-12). Full method, limits and numbers: `docs/PERF-MEASUREMENT.md`. Read that before quoting anything below.**
  - Measured properly this time (desktop viewport, **Lenis genuinely active**, trusted CDP input, blank-page control): unfixed landing = **12.2 fps against a 40 fps harness floor, 94 long tasks / 7,479 ms**, with **58% of all main-thread time in style recalculation**.
  - Cause: `components/landing/ScrollEffects.tsx` wrote **four** custom properties onto `<html>` every scroll frame. Two (`--section-index`, `--section-progress`) had **no consumer in the project at all**; the other two are read by three small elements. Unregistered inherited properties on `:root` invalidate the whole document's computed style per write.
  - Fix: dead writes deleted, each surviving number written onto the smallest subtree that reads it. **Never put a per-frame custom property back on `<html>`.**
  - Result: **12.2 → 33.3–34.4 fps**, p50 75 → 25 ms, long tasks 94 → 1–7, recalc 6,156 → ~2.1 s (−66%), slowest eval probe 77 → 17 ms, scrolled 2,596 → 5,300 px in the same window. Rail/hero-exit visuals verified still proportional to scroll, not assumed.
  - **RETRACTION:** the earlier "prod landing blocked a CDP eval for 20 s" and "neutralising paint layers fixed it" are both VOID — those runs had a coarse-pointer viewport, so Lenis never initialised, so they measured a page nobody sees. `--noeffects` changed nothing when re-tested (13.1 vs 12.2 fps). The 20 s symptom did not reproduce at all (slowest probe 77 ms); the likely mechanism, a server serving stale HTML against rebuilt chunk hashes, was reproduced and is method-limit #5 in the doc. The alarm was real; its stated cause and evidence were wrong.
  - Ruled out, do not re-chase: paint layers, the canvases (1.5 s of script but unchanged frame pacing), idle animation loops, bundle weight.
- **PERF measurement #3 — desktop re-take + the FIRST phone numbers (Freebuff/Codebuff thread, 2026-09-14). Full detail: `docs/PERF-MEASUREMENT.md`. Read it before quoting anything below.**
  - **RETRACTION of the pass-1 number.** Pass 1's "33.3–34.4 fps after the fix" does **not** reproduce: the same page now measures **3.0–6.1 fps** on this rig, and the rig floor fell 39.9 → 30.1 fps, which accounts for ~25% of the gap, not 5×. Either a landing-tree regression landed after that pass (several landing components carry other agents' uncommitted work) or the two harnesses differ on input cost. Not reconciled; the pass-1 *figure* is withdrawn. Its *mechanism* is still gone from the source (no root custom-property writes remain) and that fix stands.
  - **What is now measured, and it was never measured before: the phone.** 390×844 DPR 3, real touch drags, Lenis gated off by design: **17.8 fps, p50 50 ms, 0 long tasks**, recalc+script ~12% each. The motion stack costs phone **nothing** (17.8 vs 17.6 reduced-motion) — Lenis and the spotlight are below-1024px gated. Neutralising the CSS effect layer is worth exactly one frame (p50 50→33 ms, 17.8→21.4 fps).
  - **Desktop attribution, each with a control:** `noeffects` barely matters (**5.6 → 5.8 fps**) and turning hover off doubles it (**3.3 → 5.6**); turning the whole motion stack off gives **3.0 → 11.5 fps** (18 → 0 long tasks); halving viewport area nearly doubles fps (**6.0 → 11.6**) and `noeffects` changes nothing there. **Lenis is exonerated** (6.1 → 5.9 fps at fixed area). Style recalc and script are no longer dominant (14–43% of task-busy). So the residual desktop deficit is **area-proportional CPU rasterisation — a rig artifact** (software compositor), on top of a **named motion-stack cost at fixed area, most likely hero parallax**.
  - Fix landed: `components/landing/InteractiveTile.tsx` called `getBoundingClientRect()` inside every `pointermove` — a forced synchronous style+layout flush per event, ×14 tiles. Rect now measured on `pointerenter` and re-measured only when the page could have moved (passive scroll/resize invalidation). **Honest result: it moved no aggregate number** — tiles were `0/14 visible` in every scroll run, so it is justified by inspection and a proven defect class, NOT by a measured delta. Correctness proven by `scripts/_probe-tile-tilt.mjs` (real pointer input, 9 assertions incl. tracking after scroll, decay, and fallback visibility): all 9 pass.
  - **Settled — do not re-chase:** Lenis is not the desktop cost; recalc/script are not dominant; residual desktop cost is area-proportional CPU raster (rig artifact); phone runs 0 long tasks; CSS effect layers cost phone one frame. **Open:** the desktop motion-stack cost at fixed area (3.0 → 11.5 fps, likely hero parallax), the unexplained 33 → 3–6 fps gap vs pass 1, and real-device GPU compositing (still unmeasured — headless is software-rasterised).
  - **Method:** `scripts/_measure-frames.mjs` (CDP, emulated fine pointer + desktop viewport, trusted input, blank-page and light-route controls, per-run trust checks that self-reject untrusted runs) and `scripts/_probe-tile-tilt.mjs`. Every number above is stated with its conditions in the doc.
- **PERF measurement #4 — THE INSTRUMENT WAS THE STORY. Read this before trusting any earlier number in this section (Freebuff/Codebuff thread, 2026-09-14). Full detail: `docs/PERF-MEASUREMENT.md` pass 4.**
  - **RETRACTION — `:scroll` never isolated scroll.** The harness dispatched `Input.dispatchMouseEvent` `mouseMoved` on **every iteration regardless of input mode**, so every "scroll-only" run was scroll **plus a continuous synthetic pointer storm** — spotlight, spark canvas, FluidCursor and all 14 InteractiveTiles live in every measurement. This file's own harness header claimed the opposite. Same server, same window, same viewport, both warm: polluted **7.1–7.4 fps, p50 117–133 ms, 10 long tasks (555 ms), 2,652–2,705 ms task time** vs true scroll-only **17.3–17.4 fps, p50 33 ms, 0 long tasks, 1,561–1,562 ms**. **The headline symptoms that drove three passes — "7.3 fps", "18 long tasks", "94 long tasks / 7,479 ms" — were mostly the instrument.** The page's own scroll work is clean.
  - **RETRACTION — a single run, or runs compared across session positions, is not a measurement.** The first landing run in a fresh browser reads 3.5–7.4 fps where later identical runs read 11.5–17.4; controls (`blank`, `login`) are flat at 30.0/30.1 fps wherever they sit. Method from here: discarded warm-up, matched configs **interleaved**, compared on `taskMs`/`ScriptDuration` (±5%) not fps (2× swing). The rig's own floor is **30 fps** in this pass (pass 1 said 39.9), so "17 fps" and "this rig tops out at 30" are the same sentence — no claim about a real GPU.
  - **Corrected attribution (true scroll-only, warm, interleaved), per 8 s:** baseline 1,561 ms · canvas loops off **1,165 (−25%)** · Lenis off **1,147 (−26%)** · everything off 405 ms. So the **canvas render loops are the largest single layer and Lenis the second**; the reveal entrances, the parallax paint and the spotlight paint are each inside the noise. **`nocanvas` proves nothing about a canvas's cost** (2,665 vs 2,670 ms — a `display:none` canvas still services every draw call); only refusing the 2d context shows it. Hiding pixels measures pixels; stopping code measures code.
  - **Fix landed:** `HeroParticleField.tsx` re-armed `requestAnimationFrame` **before** its visibility check and returned early — booking a frame 60×/s for the whole session, including every second the student spends below the hero. It now **halts** (`raf = 0`, no re-arm) and restarts from the IntersectionObserver and `visibilitychange`. Proven through the real surface by `scripts/_probe-hero-canvas.mjs`, which measures CDP's own `ScriptDuration` because the exact risk is a restart path that never fires and leaves the sphere permanently blank: **hero visible 194 ms of script per 2.5 s → hero off-screen 7 ms → scrolled back 199 ms**, sphere still painted (4,468 non-transparent pixels), 0 page errors.
  - **Still open:** the gap between 17 fps and the 30 fps floor once canvas+Lenis costs are gone (405 ms of task time producing 21 fps, so task time is not the whole story); the pointer-driven layer (FluidCursor/spotlight/sparks/tiles) for **real** users — untested, since every number we have for it came from a harness moving a synthetic mouse at 60 Hz; and real-device GPU compositing, which no headless run can answer.

## SUGGESTIONS — awaiting assignment (newest first)
- Detail: every improvement to the question bank must keep original content (no re-hosted
  third-party PDFs — copyright). Write from the PMDC/NUMS syllabus.
- ORPHAN FILE (Freebuff/Codebuff thread, 2026-09-12): untracked `lib/flashcards/flashcards-chemistry-add.ts` sits in the tree with NO board row and NO owner. Not mine, not claiming it. stalin/orchestrator: claim it or say delete.

## SHIPPED (recent, newest first — full narratives live in IMPROVEMENT_LOG.md)
- `(uncommitted, local)` PERF #4 — **the measurement harness was the story; corrected attribution, and the hero canvas now halts** (Freebuff/Codebuff thread, 2026-09-14). Found and fixed the defect that had been distorting every earlier number: the frame harness moved a **synthetic mouse at ~60 Hz during "scroll-only" runs**, so the spotlight, spark canvas, FluidCursor and 14 InteractiveTiles were live in every measurement — and that storm, not the page's scroll work, produced the 7.3 fps / 94-long-task headlines that drove three passes. True scroll-only, warm and interleaved: **17.3–17.4 fps, p50 33 ms, 0 long tasks, 1,561 ms task time** against a 30 fps rig floor. Corrected attribution per 8 s: baseline 1,561 ms · **canvas loops 1,165 ms** · **Lenis 1,147 ms** · all off 405 ms. Also corrected two method errors in the same pass — first-run-in-a-session is not a measurement, and `nocanvas` proves nothing (a `display:none` canvas still services every draw; only killing the context shows the cost). One fix landed: `HeroParticleField.tsx` re-armed rAF before its visibility check and returned early, so it kept a frame booked for the whole session even with the hero far behind you; it now **halts off-screen and restarts on return**, verified by a dedicated probe measuring CDP script time (visible 194 ms/2.5 s → off-screen 7 ms → back 199 ms, sphere still painted, 0 errors). Gates: tsc 0, eslint 0, build exit 0. Held local per the founder's push hold.
- `(uncommitted, local)` PERF #3 — **the phone was never measured on this site; now it is, and the pass-1 figure is retracted** (Freebuff/Codebuff thread, 2026-09-14): re-derived the harness from `docs/PERF-MEASUREMENT.md`'s stated conditions (emulated fine pointer so Lenis is genuinely active, trusted CDP input, blank-page + light-route controls, per-run trust checks that self-reject bad runs). Desktop re-take **withdrew pass 1's 33–34 fps** (same page now 3.0–6.1 fps; rig floor 39.9 → 30.1 accounts for a quarter, not 5×) and attributed the real cost: `noeffects` 5.6→5.8 (nothing), hover off 3.3→5.6 (doubles), whole motion stack off 3.0→11.5 with long tasks 18→0, half the viewport area 6.0→11.6. Lenis exonerated (6.1→5.9). **Phone, first numbers ever taken** (390×844 DPR 3, touch): 17.8 fps / p50 50 ms / **0 long tasks**, motion stack costs it nothing. One fix landed — `InteractiveTile` was doing a forced `getBoundingClientRect()` layout flush per `pointermove` ×14 tiles; now measured on enter + invalidated on passive scroll/resize. Stated honestly: it **moved no aggregate number** (tiles were 0/14 visible during scroll) and is justified by the proven defect class, not a measured delta; correctness proven by a 9-assertion real-input probe. Gates: tsc 0, eslint 0, build exit 0. Held local per the founder's push hold.
- `(uncommitted, local)` LANDING MOTION — **one owner for "things appear", and the whole page is on it** (Freebuff/Codebuff thread, 2026-09-13; **this row was owed and is being filed late — the edits were on disk for a full session before anyone wrote them down, so read `components/ui/Motion.tsx` rather than assuming its old shape**). Three competing appearance systems had grown up: JS `Reveal`/`Stagger`, a CSS `[data-scroll-reveal]` + `ScrollReveal` observer pair, and `.hero-intro` keyframes. The observer pair is **gone from the source** (0 hits repo-wide) and `components/ui/Motion.tsx` is the single owner — 8 landing components now import `Reveal`/`Stagger`/`ScaleIn`/`Float`/`usePrefersReducedMotion` from it, and `Motion.tsx` itself lost ~250 lines of duplicated machinery in the process. `.hero-intro` survives only as the reduced-motion/no-JS floor sharing the same `--reveal-delay` tokens, so an animation that never runs still leaves content visible. `Hero.tsx` also now takes its figures from `lib/stats.ts` via `formatStat` (the STATS row below) instead of formatting numbers itself. **OpenCode/stalin: the whole landing tree under `components/landing/**` + `components/ui/Motion.tsx` is touched by this pass and is UNCOMMITTED — coordinate before editing those files.** Gates at the time: tsc 0, eslint 0, build exit 0. Held local per the founder's push hold.
- `(uncommitted, local)` PAST PAPERS + EXCLUSION PURGE — **the registry now carries NUMS, is kind-labelled, and the one excluded university is gone from the entire product** (Freebuff/Codebuff thread 2026-09-13, founder-directed twice: "register the real NUMS papers" then "nothing related to that uni, not a single thing"). `lib/past-papers.ts` went 20 → **25 papers, all `official`**: the 20 MDCAT 2022–2025, plus MDCAT 2019 (UHS / Sindh / ETEA, the oldest sittings held) and **NUMS 2024 + NUMS 2025** — the site's own name finally matches its registry. `kind` is a REQUIRED field and `year` is nullable (undated papers group as "Undated" rather than being filed under a guessed year), with `isOfficialKey()`/`keyLabel()` so a key shipping with a non-official item is labelled "Answer key", never "Official key". Provenance kept honest in the other direction too: the multi-year community compilations that produced the "eight NUMS papers" impression are deliberately NOT registered — they are not single sittings and no available kind describes one, so registering them would have meant inventing a year or overclaiming a kind. Excluded-university removal, verified by search rather than assumed: 18 paper records deleted; 6 mentions stripped from `/past-papers` (metadata, keywords, OG/Twitter, hero, legend); the exam entry replaced in `COLLEGE_SUBJECTS`; the signup and profile exam-target placeholders rewritten; the shipped `public/notes/*.pdf` and `founder-photo.jpg` binary hits investigated and proven to be byte coincidences (58/50 Flate streams decoded with zero text hits; all 3 JPEG hits deep inside compressed image data). The name now survives in exactly ONE place — the standing founder ruling below, which has to name what it excludes to be enforceable. Gates: tsc 0, eslint 0, build exit 0, page rendered from a rebuilt production server (0 occurrences of the excluded name on `/`, `/past-papers`, `/login`, `/signup`, `/faq`). **Scope note for OpenCode:** two lines of this purge land inside your NEAR-BLACK group A glob — one placeholder string each in `app/signup/SignupForm.tsx` and `app/dashboard/profile/ProfileEditor.tsx`. The string contained the excluded name, so leaving them was not an option; the edits are text-only and touch no colour token, so your recolor pass can proceed over them unchanged. Held local per the founder's push hold.
- `(uncommitted, local)` BANK by stalin/Hermes cron 2026-09-13: bio 137→149 (+12: Homeostasis +6, Support & Movement +6), chem 145→151 (+6 States of Matter). Original content, uuid5 keys, 0 dup across all four subject files (620 total verified). tsc clean. Held local per founder's "no push until manual command".
- `(uncommitted, local)` STATS — one owner for every displayed count (Freebuff/Codebuff thread 2026-09-12, founder-directed): the hero's MCQ figure came from a hardcoded `850` fallback, the live hero from a `questions` count (543), and `/past-papers` counted the bundled bank itself (613) — three numbers for one fact. New `lib/stats.ts` is now the only source: `BANK_TOTAL` derived from the bank (re-measured **613**), `BANK_BY_SECTION` (138/143/170/154/8) summing exactly to it, `COLLEGE_COUNT` 11, `ANALYSIS_CORPUS` 2,000, and `COMMUNITY_BASELINE = 900` for the headcount (a floor, never a cap — `communitySize()` is floored once in `finalizeLeaderboard`, so hero, social bar, analytics card and leaderboard header cannot disagree). Hero tiles now read **900 Students / 11 Colleges / 5 Subjects / 24-7 / 613 MCQs**. `getPublicStats` dropped the two `questions` queries it no longer needs. Gates: tsc 0, eslint 0, build exit 0, verified rendered (hero tiles, /past-papers coverage sum, /faq claim). Not pushed.
- `(uncommitted, local)` PAST PAPERS + BANK by Freebuff/Codebuff thread 2026-09-12 (founder override): **the bank's first honest provenance model, and 40 more questions.** Stated plainly rather than papered over: all 573 existing questions are original exam-style writing, so none could honestly claim a year — so instead of inventing years, built the mechanism and grew the content. `lib/past-papers.ts` = registry of the 20 REAL papers we hold (UHS 2022–2025, BUMHS/Bolan 2022–2025, KMU A/B/D, SZABMU 5 colour codes + reconduct, DUHS, SIBA, ETEA), carrying NO question text. Provenance end-to-end: `ResourceQuestion.pastPaper`, `QuizQuestion.past_paper_{exam,year,section}`, `pastPaperTag()` formatter, migration `20260912000000_question_provenance.sql`, and a year badge in the practice reveal that renders ONLY for questions genuinely taken from a paper. `app/past-papers` (static) browses papers by year with codes/keys + topical coverage. Bank 573 → **613**: 40 new original MCQs across five sections including a **Logical Reasoning** section (NUMS Paper-I) that had zero coverage — new taxonomy branch, new entry in `MDCAT_SUBJECTS`. `questions-repo` tries the provenance columns and falls back to the base list when Postgres reports them unknown, so the bank keeps loading until the migration is pasted. Gates: `tsc` 0, `eslint` 0 on all touched files, `next build` exit 0 (static routes 19→20), `/past-papers` 200 rendering real counts (Bio 138 / Chem 143 / Phys 170 / Eng 154 / LR 8) and the honest "none carry a year". Held per founder's "no push until manual command".
- ba9636c PERF (auth path, by Freebuff/Codebuff thread 2026-09-12, PUSHED to origin master+main before the founder's current hold): login-speed pass — landing navbar prefetches /login + /signup on idle (the Sign In buttons used router.push, which never prefetches → cold fetch on click), and the proxy fast-paths cookieless requests (no sb-* cookie ⇒ no session possible). Measured: 4 prefetch RSC requests fire unprompted (~31–50 ms each); click→/login painted in 44 ms with zero nav fetches. Gates: tsc/eslint/build exit 0; gate matrix re-verified (anon /dashboard + /admin 307→login; spoofed-cookie slow path still 307→login). IMPROVEMENT_LOG entry owed — lands with the corrective commit. Honest correction: this commit's middleware comment claimed the per-request getUser() call dominated TTFB — wrong; anonymous getUser() short-circuits without a network call (~14 ms warm). The corrective comment + redirect consolidation sits LOCAL, next line.
- `(uncommitted, local)` BANK by stalin/Hermes cron 2026-09-12: physics bank grown 132 → 162 (+30 PMDC exam-style MCQs — Electromagnetic Waves +6, Simple Harmonic Motion +6, Solid State +6, Light & Optics +6, Measurement +6). All original content, unique uuid5 keys (verified globally unique: 573 across all four subject files), no duplicate question text. tsc clean + next build exit 0. Held local per founder's "no push until manual command".
- `(uncommitted, local)` PERF corrective pass by Freebuff/Codebuff thread 2026-09-12: middleware.ts comment rewritten to the measured truth + duplicated /login redirect collapsed into one redirectToLogin owner. tsc/eslint/build exit 0. Held per founder's "no push until manual command".
- `(uncommitted, local)` BOOKMARKS + MISTAKES-REDO feature by Freebuff/Codebuff thread 2026-09-12: flag button (components/practice/BookmarkFlag.tsx) wired into PracticeSession; bookmarks review page (app/dashboard/bookmarks/ + BookmarkReviewList); interactive MistakesDrill + app/actions/{bookmarks,mistakes}.ts; migration 20260911000000_question_bookmarks.sql (founder paste owed). STATE 2026-09-12 (final): **feature complete and exercised.** Notebook redo toggle wired (review ↔ drill modes); drill fed from getMyMistakes via the notebook page; verdict-marking defect in both review components fixed (correct letter green, picked red, rest idle — matched PracticeSession's canonical pattern); /dashboard/bookmarks added to the dashboard Sidebar (it was orphaned — reachable by no nav); migration reviewed against schema conventions (naming, FK cascade, RLS idempotency, (student_id, created_at desc) index — no changes needed). Gates: tsc 0, eslint 0 on all touched files, next build exit 0; live matrix: /, /login, /flashcards 200 with zero error markers; all 8 /dashboard + /admin routes 307→login for anon (gates intact, no 500s). Not yet verifiable without a signed-in session: flag toggle round-trip, bookmark create/unflag, drill answer submission (needs the founder's question_bookmarks table paste + a real login). Held per founder's "no push until manual command".
- `(uncommitted, local)` BANK by stalin/Hermes cron 2026-09-11: english bank grown 80 → 92 (12 new PMDC exam-style MCQs — Vocabulary, Grammar agreement, Spelling, Sentence Completion, Comprehension). Original content, unique uuid5 keys, single-quoted to match file style. tsc clean + next build exit 0. Held local per founder's "no push until manual command".
- `(uncommitted, local)` BANK by stalin/Hermes cron 2026-09-11: chemistry bank grown 81 → 105 (24 new PMDC exam-style MCQs — States of Matter, Hydrocarbons & Fuels, Electrochemistry, Bonding/Energetics/Equilibrium/Atomic). Original content, unique uuid5 keys. tsc clean + next build exit 0. Held local per founder's "no push until manual command".
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