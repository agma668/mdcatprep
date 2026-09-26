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
- Branch master. Local HEAD and origin/master match after every ship — **but a push is NOT reaching the live site** (see PRODUCTION IS FROZEN below). Never claim a change is live on the strength of a push.

### ⚠ PRODUCTION FROZEN — RESOLVED 2026-09-22 (was frozen since 2026-09-12; root cause + fix below/see CLAIMS)
`https://mdcatprep-eight.vercel.app` is serving **`ba9636c`** (2026-09-12 01:38) — **23 commits behind `master`**. Everything since is on GitHub and **not** on the live site: the 4-palette theme engine (`1c8f3d0`), the bookmark/mistakes-drill/past-papers/honest-stats ship (`e0ae7a5`), the merit estimator (`87fb4a5`), trap reasons (`1f8c1fd`), the mobile pass (`870baf1`, `deb32ca`) and 11 question-bank growth commits.

Evidence (all re-runnable, no account needed):
- live `/api/health` returns `"service":"cadet-college-prep"`; that string was renamed to `"med-prep"` **in `e0ae7a5`** → live predates it.
- live `/past-papers` → 404 (`e0ae7a5` added it) · live `/merit` → 404 (`87fb4a5`).
- live `/flashcards` → 200 (added in `b84814d`, the commit *just before* `e0ae7a5`) → brackets the deployed build to ≈ `b84814d`.
- live landing hero still prints **543** (the pre-stats hardcoded figure), not the bank-derived count.
- live `/login` returned byte-identical HTML (23,658 B, 0 `<form>`, 0 password input) on three checks 45 s apart → a frozen deployment, not a rebuild in flight.

Control that proves the pipeline works elsewhere: the **cadet** site (`elite-cadet-prep.vercel.app`, deployed from `main`) *is* current — its `/login` serves my `type="password"` fix in raw HTML. So this is MED-project-specific, not a global Vercel outage.

- live `/login` byte-identical across a 24-minute poll window → a frozen deployment, not a rebuild in flight.
- live landing contains **0** `data-theme` matches → predates the theme engine `1c8f3d0` (2026-09-12 07:09), which is *not* in `main`.

**Root cause (proven 2026-09-17): the repo has TWO branches and production follows the abandoned one.** `origin/HEAD -> origin/main`, and `main` sat at `ba9636c` while every commit since went to `master` — and Vercel deploys the production branch, `main`, which took no push in five days. The freeze timestamp equals `main`'s tip exactly.

**Fixed / not fixed.** `git push origin master:main` fast-forwarded `main` `ba9636c..170b1b9` (a true ancestor — no force, no divergence; both branches now identical), which removed the mismatch. **It was not sufficient:** `/api/health` was polled every 45 s for ~24 min after that push and still reports `"cadet-college-prep"`, `/past-papers` still 404, login HTML still byte-identical. So the Git→Vercel delivery itself is dead — webhook disconnected/paused, an Ignored Build Step skipping everything, or the project failing every build. The last push to `main` before today was literally `b69d6b0 chore: re-trigger Vercel deploy for theme wheel` (2026-09-12): an earlier agent hit this same wall and lost.

**Next step needs the founder's Vercel account** (no CLI session exists here and both repos are private, so no deployment is readable from this machine): Vercel → project → Deployments (is there any entry after Sept 12, and in what state?), then Settings → Git. A path that bypasses Git entirely: `npx vercel --prod` with a token from vercel.com/account/tokens. Once deploys work again, set the Production Branch to `master` (or make `master` the GitHub default) so the two branches can never freeze the site this way again.

**Standing rule:** never conclude a push shipped from branch names or `origin/HEAD` — verify a live marker (the checks in this note).
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

### CLAIMS — 2026-09-17 (Freebuff/Codebuff thread): PORT cadet's landing UI/UX
**FOUNDER DIRECTION, stated in chat 2026-09-17:** the cadet site is "top notch" — **do not touch it** — and MED is to be brought up to it **in design/UI-UX features only, NOT question-bank or notes content**. Nothing here is committed or pushed (founder pushes by manual command).

- CLAIM → **DONE-LOCAL**: ported the two cadet landing surfaces MED lacked that need **no missing DB table and carry no content**. Files: `components/landing/SocialProofBar.tsx` (new), `components/landing/CommunityStreakWall.tsx` (new), `lib/public-stats.ts` (the data they need), `app/page.tsx` (wiring, in cadet's positions: proof bar under the hero, before `TrustStrip`; wall after `analytics-preview`).
  - **`SocialProofBar`** — 4-up live counters under the hero. MED delta vs cadet's original: the degraded fallback reads **`BANK_TOTAL` from `lib/stats.ts`** (the one owner of that figure) instead of a hardcoded literal, and the grid's column count follows the stat count, because the 2-stat fallback in a fixed 4-column grid rendered two bare separator-coloured cells as a **grey slab** on desktop (visible in this pass's first desktop render; cadet's original still does this).
  - **`CommunityStreakWall`** — the GitHub-style year grid, scrollable, with tooltips, a Less→More legend and an honest quiet grid at zero activity. MED delta: the ramp is built on **`--signal-*`** (this site's palette engine drives it, so the wall follows all four themes) because MED has **no `--hue-emerald` token**; everything else is identical.
  - **`lib/public-stats.ts`** additions: `activeStudentsThisWeek` on the analytics seam, plus `CommunityActivityCalendar`/`CommunityActivityDay` and the 53-week aggregation (paged row-cursor walk — a bare `.limit()` caps at PostgREST's ~1,000 rows — demo-excluded, built only from real attempts, gaps filled with 0). The calendar gets **its own 3 s budget** so a slow read costs the wall and nothing else; every early return carries `activityCalendar: null`, so the wall hides rather than drawing a fabricated pattern.
- **VERIFIED through a real render** (production build, `scripts/_mobile-shot.mjs`, phone 390×844 coarse pointer + desktop 1440×900 fine pointer): the proof bar renders **in place on the real landing page at both viewports** in its honest fallback state (`875 Questions in the bank` — `BANK_TOTAL`, not a literal — plus `100% Free for every student`), no horizontal overflow, no new console errors, hero/TrustStrip/college strip all unregressed. The wall renders correctly (activity grid, quiet grid, legend, arrows, tooltips, correct theme accent) at both viewports.
- **NOT verified, stated plainly: the wall is not mounted by the landing page locally.** `SUPABASE_SERVICE_ROLE_KEY` is commented out at line 4 of `.env.local` (a file this board forbids touching, and no new credentials are allowed), so `createServiceClient()` throws, `getPublicStats()` returns its hero-only fallback and **`stats.analytics` and `stats.activityCalendar` are both null** — which is also why the pre-existing `analytics-preview` and `leaderboard-preview` sections do not render locally. The wall was therefore proven as a component through a temporary scratch route (since deleted) with representative data, not through the landing page's wired path. Production reports `serviceKey: true` (the frozen live build's own `/api/health`), so the guard should pass there — that is an **inference, not a measurement**.
- **DELIBERATELY NOT PORTED** (each for a named reason): `DuelArena` + `LeaderboardHub` — they read `duels`/`races`, and this board's hard rule says those tables **do not exist** here and code must fail open; porting an arena with no data would be a dishonest empty shell. `ParentTransparencyTile` + dashboard `ParentLinkCard` — need `parent_links`. `RankCard` + `app/dashboard/certificate` + `app/verify/certificate` — auth-gated dashboard surfaces, unverifiable without a session in this pass (a strong next row). `MasterNotesGate` and `app/dashboard/notes/**` — notes content, excluded by the founder's direction. `WhyACMA`/`MilitaryColleges` — MED already has `WhyMED`/`CollegeCarousel`, so porting these would duplicate, not add. `components/ui/**` needed nothing: the primitive set is already at full parity (zero file diff vs cadet).
- **Gate state:** `npx tsc --noEmit` clean · `eslint` clean on all four touched files · `npx next build` clean (31/31 pages). Not committed, not pushed.
- **For the next session on this row:** the same port list, minus these two, is a standing queue — the certificate/rank pair is the highest-value next surface, but it needs an authenticated session to prove, so start by saying out loud whether you have one.

### CLAIMS — 2026-09-21 (Freebuff/Codebuff thread): PUBLISH the notes publicly
- CLAIM → **DONE-LOCAL**: publish ALL the notes onto the public website in a proper structure (founder ask in chat: "publish all the notes on the website in a proper files way"). The Master Concept Notes (light, 4 subjects) + the exam-depth corpus notes (bio 16 / chem 20 / phys 16 units, 2,573 fact lines) lived ONLY behind `/dashboard/notes/mdcat-master-notes` (login wall). Files: **new** `lib/public-notes.ts` (single seam over the existing note data — zero content duplicated), **new** `app/notes/page.tsx` (hub) + `app/notes/[subject]/page.tsx` (4 static pages via generateStaticParams, TOC + per-unit sections, `NotepadMarkdown`-free plain JSX so no new deps), **edit** `app/resources/page.tsx` (points at the real public URLs instead of PDF-only), **edit** `components/landing/Footer.tsx` (+"MDCAT Notes (public)"), **edit** `app/sitemap.ts` (+5 crawlable URLs). Dashboard page untouched — it gains no regressions and keeps its practice CTA. Content is ours (PMDC-syllabus-derived, written for this site), so no copyright exposure; no years claimed (honesty rule). Gates: `tsc --noEmit` 0 · eslint 0 on touched files · `next build` clean · live smoke via dev server. Not committed, not pushed (founder holds pushes).

- CLAIM → **KNOWLEDGE-BASE consolidation** (Freebuff/Codebuff thread, 2026-09-21; founder ask: "get every study file/notes/flashcards on this laptop into the project as one knowledge base, no academy names, no AKU anywhere incl. note contents, no 6 copies of 1 note, delete the useless folders"). **DONE-LOCAL** (same day): every study file on the PC swept into one deduplicated KB - knowledge-base/ in-repo (189 text files: notes/questions/flashcards/mock-exams/reference, 11 MB, git-tracked, INDEX.md regenerable via scripts/build-kb-index.mjs) + Studies/07-Consolidated/ (80 binaries: PDFs/Anki decks/mock papers + preserved personal admission photos). AKU/Aga Khan + all academy names (KIPS/PT/MedExel/MedQuack/Anees Hussain/MedAngle/MDCATPrep/STEPS/Dogar/taleem360/CATPrep/MENTR) scrubbed from filenames AND contents - boundary-aware scan = 0 hits; website code swept too (merit.ts Aga Khan-tier line removed, internal AKUMA alias renamed FOUNDER). Hash-dedupe: 45 byte-identical dupes + 2 format twins deleted, 305 Studies renames, 54 files + 9 folders removed from Downloads (Antigravity/TODO/AR AKU/AKU/AKU pics/2024+2025 KIPS/cat website/_Duplicates) - inventories: Studies/_REMOVALS-2026-09-21.csv + _RENAMES-2026-09-21.csv. Commercial KIPS/PT/MedExel PDFs remain excluded (copyright). Script: scripts/consolidate-knowledge-base.mjs (dry-run default). Gates: tsc 0, eslint 0 errors, next build clean. FOLLOW-UP (founder-ordered push+deploy, 2026-09-22 ~00:30): topicals bank regenerated 1,542->3,721 questions (scripts/ingest-topicals-v2.mjs: JSON bank + KB chapter collections + KEYED past-paper PYQ dumps only, honest per-source labels); master reader now lists knowledge-base/notes (lib/kb-notes.ts, force-dynamic, per-request read, library grid + /[doc] pages, same watermark/shield). Committed 19d0087. PUSHED to origin master AND origin master:main (fast-forward 1535442..19d0087). DEPLOY MYSTERY SOLVED + LIVE (same night): the pipeline was never dead - Vercel BUILDS WERE FAILING since Sept 12. Founder opened the dashboard: latest master deployment = Build Failed, "npm run build exited with 1" (the Sept-12 commits shipped only the importing halves: notes pages imported @/lib/public-notes which was never committed; CommunityStreakWall imported CommunityActivityDay from an uncommitted lib/public-stats.ts; PracticeSession imported pastPaperTag from an uncommitted lib/questions.ts - local builds passed because the working tree masked the holes). Fixed by committing the missing halves: 85a8b4f (lib/public-notes.ts + scripts/verify-committed-imports.mjs, a committed-tree import checker) then 1202f98 (public-stats/questions/subjects/cron/app-page/SocialProofBar/tsconfig). PROOF BEFORE PUSH: isolated git worktree at the exact commit + junctioned node_modules - next build --webpack green. Pushed both branches; production deploy VERIFIED LIVE ~02:18 (topicals 3,721 past-papers 200). Full live matrix green: / 200, /topicals 200, PYQ chapters 200 with real keyed questions rendering, all 8 board pages 200, /notes 200, reader 307-gated.
- CLAIM → **DONE-LOCAL**: TODO-folder ingest — topicals bank + past-paper board pages + protected master-notes reader (Freebuff/Codebuff thread, 2026-09-21; founder ask: "add all the notes, qs, past papers — sections for each board, topicals, notes sections — and no one able to steal the notes"). **1,542 clean 4-option MCQs** ingested (Bio 641 / Chem 357 / Phys 544, 22 chapters; 1,980 short-answer + 68 malformed + 4 dupes skipped with printed counts) → `/topicals` hub + 22 SSG chapter drills (guest player, device-local, honest MCQ-Universe source note). `/past-papers/[board]` SSG pages (UHS/BUMHS/KMU/SZABMU/DUHS/ETEA/SIBA/NUMS, year-grouped, kind/key labels). `/dashboard/notes/master-reader` — white-paper reader, auth-gated (307 verified), per-user watermark, blur-on-blur, print disabled via CSS. **PDF download hole CLOSED**: `public/notes/*.pdf` deleted (were downloadable logged-out); /notes + /resources rewired. KIPS/Prep Titans/MedExel NOT ingested (copyright rule). Gates: tsc 0 · eslint 0 (1 pre-existing warning) · build 69/69 · live smoke clean. New: `scripts/ingest-topicals.mjs` → `lib/topicals-bank.ts` (chapter-wise MCQs from the founder's own extracted bank; 2/3-option and short-answer rows skipped as unrenderable; KIPS / Prep Titans PDFs NOT ingested — copyright rule), `lib/topicals.ts`, `app/topicals/**` (hub + subject + chapter drills, untracked local practice), `app/past-papers/[board]` (board → year → paper registry from `papersByExam()`), `app/dashboard/notes/master-reader` (white-paper reader: per-user watermark, blur-on-blur, print/copy deterrence, auth-gated), `public/notes/*.pdf` DELETED from the public tree (the actual download hole). Edits: `/notes` hub + `[subject]` (public pages become concept-only; the exam-depth corpus moves behind the reader), `/resources`, `sitemap.ts`, `globals.css` (paper tokens + print block), footer. No overlap: `lib/*-questions.ts` untouched, `app/dashboard/practice/**` untouched.

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
- `(uncommitted, local)` JEV FEEDBACK TRIAGE — **rebuilt in THIS checkout; the parallel thread's copy never reached these files** (Freebuff/Codebuff thread, 2026-09-22). Founder reported the other thread had installed `@typesafe-ai/sdk` and wired triage into feedback with a 401-stuck key. Verified on disk here: no lib/jev.ts, no dependency, no TYPESAFE_API_KEY, no code — the work existed only in that thread's workspace. Rebuilt from its spec in this repo: `lib/jev.ts` (server-only, lazy client, 5s timeout, retries 0, fail-open → null on ANY failure), triage wired into `submitFeedback` with the `[jev m=… sev=… q=… c=…]` prefix appended ONLY on a genuine result (a fake label on a failed call would violate the honesty rule — this deliberate divergence from the other thread's approach is recorded), `lib/jev.test.ts` proving fail-open via a test-only `server-only` stub hook (`scripts/_jev-serveronly-*.mjs`; `npm test` now runs both suites, 9/9). **BLOCKED ON FOUNDER (account-side):** founder pasted a key in-chat; stored byte-perfect; STILL 401 `authentication_error` from TypeSafe on both `POST /v1/systemone` and a plain authenticated `GET /v1/models` (raw probe, SDK bypassed) — the credential is format-valid but dead console-side. The other thread's transcript shows the SAME key (…mIKO9) was pasted there, so two byte-perfect workspaces prove the same rejection. Founder: regenerate in the TypeSafe console (or support). The moment a valid key lands in `.env.local`, triage turns on with zero code change; fail-open serves until then. Also this session: the Step-5 SEO/AEO stack (see IMPROVEMENT_LOG). Gates: tsc 0 · eslint 0 · next build 77/77 · tests 9/9. Held local per the founder's push hold.
- `(uncommitted, local)` MOBILE PASS #2 — **the auth pages served no form at all; they do now** (Freebuff/Codebuff thread, 2026-09-14). Every route in the public journey was rendered at a real **390×844 DPR 3 touch viewport** against rebuilt + restarted production servers, and the screenshots were read *before* anything was changed.
  - **THE NAMED DEFECT, CONFIRMED AND FIXED.** `/login` and `/signup` served HTML containing **zero `<form>` and zero `<input>`** — `useSearchParams()` in the client form opts a statically-prerendered route out of SSR, so the whole form rendered behind a `<Suspense fallback>`. On a throttled phone profile (1.6 Mbps / 150 ms RTT / 4× CPU, **cold cache** — an earlier run of this probe was measured warm and flattered the build by ~2 s) the password field did not exist until a median **~3.2 s** and was not painted until **~3.7 s**: a student stared at a heading and an empty space where the fields belong. The query flags are now read on the **server** — `app/login/page.tsx` and `app/signup/page.tsx` await `searchParams` and pass props; `LoginForm`/`SignupForm` lost the hook and the Suspense wrapper. Both routes moved `○` static → `ƒ` dynamic, which is the honest classification: their content depends on the query string. Served HTML now **1 `<form>` + 1 password input**; post-fix median time-to-field **~1.9 s**; the probe confirms the field exists at `readyState === "interactive"` (6/6 runs across both sites) — i.e. from the HTML, not from JS. **Stated honestly: the per-run distributions still overlap** (post-fix runs ranged 1.3–2.8 s, because throttled localhost delivery is noisy), so the **binary fact is the load-bearing evidence, not the milliseconds**.
  - **HYDRATION MISMATCH ON EVERY PHONE** — found by giving the audit console eyes. `components/landing/HeroParticleField.tsx` returned `null` at **render** time when `(pointer: coarse)` matched. The server cannot know the pointer type, so it rendered the `<canvas>`; the client's first render disagreed and threw **React error #418** on the landing page of every phone, forcing React to discard the tree and re-render client-side. Fixed the same way as its sibling `InteractiveParticles` last pass: the canvas stays in the DOM (on a coarse pointer it never reaches `getContext`, so no backing store, no loop, no paint) and the pointer check lives only in the effect. `/` now reports **zero** console errors. `scripts/_mobile-shot.mjs` gained error capture because of this: the audit was blind to the console, and an error boundary had shipped unnoticed — it was found only by reading a screenshot.
  - **`&apos;` rendered as literal text** on `/offline-practice` ("you&apos;re online"). JSX decodes entities in text and in attribute values but NOT inside a `{...}` JS string expression. Only one genuine instance repo-wide; fixed and verified on a live phone render.
  - **TAP TARGETS — the real offender was the FOOTER, not the landing page.** Its three link columns are `text-sm` in `inline` anchors: **~19 px tall, on every page of the site**, 11 per page. A phone-only `@media (max-width: 767px)` block (`.footer-links { gap: 0 }`, `.footer-link` = 44px flex row) makes them real targets. The invisible-`::after` `.tap-44` trick used elsewhere is **not** usable at an 8 px gap — a 44px area centred on a 19px link overlaps its neighbour and steals taps. The flashcards filter chips and Study buttons (28–30px) got `.touch-chip`. Before any of that, the audit's **own** tap-target measure was corrected: it counted the element box and ignored `.tap-44`, inflating the failure count (the mobile nav toggle was reported as a 40px failure while already having a 44px hit area). **Desktop is provably untouched:** the built CSS on this site shows every one of these rules inside `@media (max-width:767px)`.
  - **DELIBERATELY LEFT ALONE, measured not guessed.** `/diagnostic`'s error boundary and the `/api/telemetry` **503 on every route** are **environment-only**: `SUPABASE_SERVICE_ROLE_KEY` is commented out in `.env.local` (`# SUPABASE_SERVICE_ROLE_KEY=`), so `createServiceClient()` throws by design and the boundary renders correctly. Not code defects, and not reproducible on the deployed site. Still small and untouched: the footer brand links (36px), the `a.mt-6`/`a.mt-7` standalone CTAs (20/40px), inline links in body copy (~19px, WCAG-exempt), and `/daily-quiz`'s "No questions available yet" empty state (content, not layout).
  - **No horizontal overflow anywhere** — 0 on all 15 routes checked, both sites.
  - Gates: `tsc --noEmit` 0 · `eslint` 0 on every touched file · `next build` exit 0 · every number and screenshot re-taken against a rebuilt and restarted server. Pre-existing, NOT from this pass: 4 eslint errors in `ThemeSwitcher`, `ThemeWheel`, `WhatsAppSharePopup`, `essays`. Held local per the founder's push hold.
- `(uncommitted, local)` MOBILE PASS — **the custom cursor was showing on phones; the cursor is now desktop-only, and three mobile defects are fixed** (Freebuff/Codebuff thread, 2026-09-14, founder-directed: "the website looks great on my laptop web but it isn't good on my mobile app for both the websites and there is a cursor in the mobile app as well"). Verified by rendering the site at a real **390×844 DPR 3 phone viewport** with coarse-pointer/touch emulation — new scratch tool `scripts/_mobile-shot.mjs` screenshots every scroll step so the result can be LOOKED at, and reports horizontal overflow, sub-44px tap targets and sub-12px text. Nothing below was concluded from reading CSS.
  - **CURSOR — the founder's reported bug, reproduced and fixed.** The old gate trusted `(pointer: coarse)` alone, so it only worked on devices that report a coarse pointer: an Android WebView, a tablet with a trackpad and "request desktop site" all report a **FINE** pointer at phone width, fell through into the ported touch mode (arrow centred on screen, follows finger drags) and drew a cursor on a phone. `components/landing/FluidCursor.tsx` now requires `(hover: hover) and (pointer: fine)` **AND `min-width: 769px`**, both conditions mirrored in the `globals.css` gate, and **the touch mode is deleted outright** — it is unreachable once the gate is right, and its removal is the fix. Phone: `data-custom-cursor` absent, `.fluid-cursor` computed `display: none`. Desktop regression: `cursor: none` + `display: block` + arrow live, unchanged. The dead `data-cursor-input` attribute (written by the component, read by nothing) went with it.
  - **HERO SPHERE — phones paid for a full canvas loop; they now get one still frame.** `components/landing/InteractiveParticles.tsx` runs a pointer-impelled rAF canvas loop, and a phone has no pointer to impel it with, so the loop burned a frame per 60th of a second to redraw a sphere nobody could nudge. It now draws **one** frame on a coarse pointer and stops (attached no pointer listeners, and redraws on resize so rotating the phone cannot leave it blank). Proven with `scripts/_probe-sphere.mjs`, which counts `arc()` calls per 1.8 s window and counts lit pixels: **phone 0 draw calls, 3,852 lit pixels (sphere present, loop gone); desktop 1,408 draw calls (still animating), 5,790 lit pixels.**
  - **MOBILE DESIGN.** The floating Feedback button collapses to a 44px circle below `sm` — as a full pill it sat on top of the hero headline on every phone screen (also the minimum comfortable tap target). `globals.css` gained a **phone type floor**: `text-[9px]` and `text-[10px]` are raised to 11px under 768px, outside Tailwind's `utilities` layer so it outranks the utility it corrects, leaving the desktop design untouched. A live phone render counted **22 sub-12px nodes** on the landing page alone; those now measure 11px.
  - Gates: `tsc` 0, `eslint` 0 on every touched file, `next build` exit 0, and the fix was re-probed against a **rebuilt and restarted** production server (the stale-chunk trap — the first measurement pass in this thread was taken against a build 6 hours older than the source). Pre-existing, NOT from this pass: 4 eslint errors in `components/ThemeSwitcher.tsx`, `components/ThemeWheel.tsx`, `components/dashboard/WhatsAppSharePopup.tsx`, `app/dashboard/essays/page.tsx`. Held local per the founder's push hold. **The same pass was applied to `elite-cadet-prep`** (cursor gate + touch-mode removal, feedback button, type floor, and the blank-sphere fix there — cadet was returning `null` on coarse pointers, so its hero card was an empty 210px box on every phone).
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