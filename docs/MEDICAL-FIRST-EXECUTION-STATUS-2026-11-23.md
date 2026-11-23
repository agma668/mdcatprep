# Medical-first execution status — 2026-11-23

> Coordination addendum for the Apex Pakistan repository. This document supersedes stale queue dates and old status snapshots; it does not erase historical logs. Repository: `agma668/mdcatprep`. Active branch: `main`. Work branch for this documentation reconciliation: `docs/medical-first-board-reconciliation-2026-11-23`.

## Product direction

The active development priority is **medical preparation only**: PMDC MDCAT first, then NUMS as a separately configured exam. Engineering, Defence and other pathways are preserved but are not the current feature-development priority. Keep one academy/account/application with exam-specific Prep Spaces; do not blend exam content, assessment rules or progress.

## Evidence and freshness

- Latest repository activity visible during this reconciliation includes commits dated through **2026-11-23**; the previous board baselines of 2026-11-08 and the queue prepared 2026-11-09 are historical, not current status.
- The current master roadmap records the route inventory work dated 2026-11-22: 94 sitemap URLs and 13 private routes, with zero reported audit problems. A separate later improvement-log entry reports 96 URLs. **Reconcile this 94-versus-96 discrepancy from a fresh generated inventory before publishing a definitive count.**
- The earlier supplied content audit reported 16,556 served topical questions (3,721 curated, 1,941 founder-source and 10,894 pipeline records). **A newer 2026-11-23 `IMPROVEMENT_LOG.md` entry supersedes the pipeline component:** `lib/pipeline-bank.ts` was rebuilt to 10,885 rows, then 100 newly extracted official HEC/USAT-keyed rows were added, for **10,985 pipeline rows: 2,229 keyed and 8,756 practice-only**. The generated `lib/founder-bank.ts` was independently counted at 1,941 rows. The large `lib/topicals-bank.ts` could not be returned by the GitHub file connector, so do not publish a new grand total until that base bank is counted and the three-way total is recomputed. The pipeline report records 46 source explanations; the pipeline script attaches only explanations present in source. Do not describe the entire bank as academically verified or fully explained.
- The supplied audit reports PM&DC 2026's structure as 180 questions: Biology 81, Chemistry 45, Physics 36, English 9 and Logical Reasoning 9; 3 hours; no negative marking. Mathematics is not a separate PM&DC section. Keep Mathematics content clearly labelled as supplementary or mapped elsewhere, never as a sixth official MDCAT subject.
- The last documented live Supabase inspection is dated 2026-11-20 and reported zero canonical questions, goals, attempts and flashcard reviews. This is **not a fresh live query**. Do not infer current production row counts from it.
- The supplied audit reports ten open draft PRs and identifies #22–25 and #12–17 as important outstanding work. PR bodies and workflow statuses must be rechecked against GitHub before any status is marked current. No merge or production change is authorized by this board update.


## Fresh corpus/OCR evidence discovered on 2026-11-23

The latest `IMPROVEMENT_LOG.md` is more current than the older OCR notes in `docs/AGENT-BOARD.md`:

- OCR toolchain restoration was completed; the earlier D14 claim that Poppler/Tesseract were missing is stale.
- The 19 image-only documents / 451 pages are now reported complete, with 0 failed pages and 0 thin pages. A separate 304-page pass covered 14 documents before the remaining scans were finished.
- Rebuilding after OCR cleanup changed the pipeline bank from 10,894 to 10,885. The 9-row reduction was retained because the changed rows were cleaner OCR renderings and 8 removed practice-only stems were debris; keyed count stayed 2,126.
- The official HEC/USAT extraction then added 100 servable rows / 103 keyed rows, bringing the pipeline bank to 10,985 total, 2,229 keyed and 8,756 practice-only. The 36 rows with unsupported subject headings were held back.
- The latest text-layer audit covered 62 PDFs (16 duplicate copies, 46 distinct parsed), found 3,094 questions, matched 2,019 to the bank and left 1,075 unmatched. Of those, 572 were classified by the audit as likely real question stems (question mark, blank or colon). The five official USAT samples now have zero missing questions.
- A parser fix for `(a)` and `(a).` option markers recovered 185 Balochistan MDCAT 2022 questions. Twenty text-layer files still parse zero; several substantive files remain unmeasured by this parser.
- These are repository-log measurements, not a new local execution in this session. Reproduce them before treating them as final.

**Important rights/provenance gate:** the ingestion script describes de-branding and a private-use ruling for some academy-derived content. Removing names does not itself establish permission to republish a source's questions. Before extracting or publishing any of the 572 unmatched items, record ownership/licence or obtain permission; otherwise keep them out of the public bank. The next task is therefore a rights-aware parser-gap triage, not a blind bulk import.

## Current priority queue

### P0 — Reconcile delivery foundation safely
1. Recheck the current default-branch SHA, all open PR heads/bases, branch divergence, reviews and latest workflow runs.
2. Review PR #22's student-goal ownership migration and CI workflow as a proposed code change only. Keep it draft until independently reviewed; do not merge without founder approval.
3. Recheck PR #23's goal-scoped public sample delivery. It is explicitly not yet wired into the legacy practice flow and does not record attempts/offline replay.
4. Recheck PR #24's referral-trigger hardening and its latest full CI. Migration remains unapplied to production; leaked-password protection is a separate Auth setting and must not be changed without approval.
5. Do not revive stale PR #25 by merging it. Rebase/rebuild its medical content work against current main only after auditing its question assumptions against the expanded bank.

### P0 — Medical content truth and quality
1. Inventory all currently served medical questions from the actual source files and identify exact exam/source ownership.
2. Separate PMDC, NUMS, other medical admissions tests and general/supplementary material. Never infer PMDC authenticity from a generic label.
3. Preserve provenance: source document, page/year/board where known, permission/reuse status, extraction method and stable source ID.
4. Run structural checks for missing/invalid options, key shape, duplicate IDs and exact/near-duplicate wording. Automated checks flag candidates; they do not academically approve answers.
5. Map each eligible item to the correct official syllabus learning outcome and version. Leave unmapped items explicitly unmapped.
6. Independently review answer keys and explanations. Track statuses such as `draft`, `needs_review`, `approved`, `rejected`, and `practice_only`. Do not publish AI-generated or unverified answers as authoritative.
7. Produce a per-exam, per-subject, per-learning-outcome coverage report. Counts must distinguish total, structurally valid, mapped, key-reviewed, explained and approved.

### P0 — Durable student progress
1. Trace the real student journey from selected Prep Space/goal through question delivery, answer submission, persistence, refresh, analytics and offline replay.
2. Establish canonical question identity and exact exam/variant mapping before import.
3. Design a safe, idempotent importer and dry-run report. No bulk production import or migration without a separate explicit approval and a non-production validation path.
4. Verify RLS, goal ownership, server-side answer validation, retry/idempotency and cross-exam isolation.
5. Do not claim progress is saved until a real persisted attempt can be read back and attributed to the correct goal.

### P1 — Medical product completion
- PMDC first: official blueprint, topical practice, defensible answer review, explanations, mistakes/bookmarks, flashcards, diagnostics, a real 180-question mock and saved progress.
- NUMS second: its own current official syllabus, separate Paper-I/Paper-II rules and content, psychological-test material, mock configuration and progress.
- Keep current public readiness labels honest. The supplied audit snapshot describes PMDC as beta and NUMS as content in progress; verify before changing those labels.

### P1 — Website, design and SEO accuracy
- Correct public copy that calls Mathematics an official PMDC subject or promises universal instant explanations.
- Ensure mock labels match actual paper length and rules; a 100-question custom mock is not the PMDC 180-question official-pattern paper.
- Keep source/year labels honest and do not imply unofficial practice sets are official past papers.
- Maintain mobile, keyboard, contrast, light/dark and performance QA; record observed results rather than checking boxes from code presence.
- Reconcile sitemap counts (94 vs 96) from generated artifacts.

## Execution and safety rules

- This addendum is a coordination document, not authorization to merge PRs, alter production Supabase, change Auth settings, change Vercel protection/domains/billing, deploy/promote, or publish unreviewed content.
- Work on a dedicated branch and keep PRs draft until required gates pass.
- Before code/content changes, read `AGENTS.md`, `TODO.md`, this master board and the relevant specialist board.
- For each code task: tests, lint, TypeScript, production build, relevant desktop/mobile smoke, improvement log and a focused commit. Do not claim a check passed unless observed.
- One owner per code tree at a time; stage explicit paths only.
- Update this file with evidence and date whenever priorities or verified status change.

## Next concrete task

**Create a rights-aware parser-gap triage for the 572 likely-real unmatched text-layer questions.** First classify each source PDF by owner/licence/permission, then run the existing parser audit by source and record the exact parsing failure patterns. Do not import or publish any source without documented reuse rights. Keep the existing bank unchanged; do not seed production.
