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

**Commit:** (this log entry, staged with the code)

**Status:** DONE, ready for build.