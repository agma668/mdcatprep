# Improvement Log — MED Prep

Standing mission: grow MED Prep into the monopoly medical entry-test prep platform in
Pakistan. This log captures what is built and deployed, what is blocked and why, and
what to do next.

## What's built and deployed

| Commit | What it contains |
|--------|------------------|
| `(this commit)` | **Agent board + operating manual** — created `docs/AGENT-BOARD.md` (port of the elite-cadet-prep UC board, tuned for MED): DISPATCH table, gate ladder, roster (stalin/OpenCode/ruflo/freebuff), [FOUNDER] queue, GOTCHAS incl. the verified OpenCode free-model invocation. Foundation for coordinated multi-agent work on this repo. |

Deployed on `origin/master` (github.com/miankhail/mdcatprep). `npm run build` passes clean.

---

## 2026-09-10 — Chapter-wise drill UI (OpenCode CLI, free model)

**What:** Built `lib/mdcat-topics.ts` (full PMDC MDCAT topic taxonomy, 4 subjects × chapters × subtopics mapped to the real `topic` values in the bank files), modified `app/dashboard/practice/page.tsx` (server-side topic grouping, passes `bankTopicsBySubject` + `bankCountsBySubject` to PracticeClient), created `app/dashboard/practice/TopicDrill.tsx` (accordion drill-down: Subject → Chapter → Topic with honest question counts, links to `/dashboard/practice/quiz?subject=X&topic=Y`).

**Gate results:**
- `npx tsc --noEmit` → exit 0
- `npx next build` → exit 0, all routes intact

**Commit:** `f3e61cc` (feat: chapter-wise topic drill navigator)

**Status:** DONE, pushed.

---

## 2026-09-11 — Question bank growth (parallel: subagent + OpenCode CLI)

**What:** Grew the bundled MDCAT question bank from 175 → 271 questions in one parallel sweep.
- **Biology** 50 → 100 (`lib/biology-questions.ts`) — subagent (my own leaf), +50 Qs across Cell Structure, Biological Molecules, Bioenergetics, Coordination & Control, Homeostasis, Genetics, Reproduction, Ecology.
- **Chemistry** 34 → 80 (`lib/chemistry-questions.ts`) — OpenCode CLI free model, +46 Qs across Atomic Structure, Chemical Bonding, Chemical Energetics, Chemical Equilibrium, Acids/Bases/Salts, s & p block, Organic Chem, Electrochemistry.

Both used the exact `ResourceQuestion` schema (`key`/`question_text`/`option_a..d`/`correct_answer`/`difficulty` lowercase/`source`). No existing questions modified.

**Gate results:** `npx tsc --noEmit` → exit 0 (clean).

**Commit:** (this entry, staged with the banks)

**Status:** DONE, ready.