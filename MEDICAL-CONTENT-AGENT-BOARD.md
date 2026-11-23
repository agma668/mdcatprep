# Medical Content & Prep Experience Agent Board — Apex Pakistan

> **Current source of truth (updated 2026-11-23).** Repository: `agma668/mdcatprep`, baseline `main` at `e3b4d63065c69a60fb816939f4bbbd0ee2f1eb9f`. Scope is PM&DC MDCAT first, NUMS second. Engineering, Defence and general HEC expansion are parked; preserve existing work and routes without expanding those tracks.

## Mission and release standard

Build a trustworthy medical entrance-preparation experience with accurate, syllabus-mapped questions, clear explanations, useful practice modes, timed assessments and durable goal-specific progress. Quality and verified coverage matter more than raw count.

A question is not approved merely because it parses, has four options, has an answer letter, appears in a source file, or is served by the website. No AI/OCR-generated or unreviewed item may move directly to published status.

## Verified repository baseline — 2026-11-23

The latest committed improvement log (2026-11-23) records:

- **16,547 source rows before the quality guard** across six navigation categories; the new guard in this branch leaves **16,294 served rows** and quarantines 253 malformed rows. Categories: Biology, Chemistry, Physics, English, Mathematics and Reasoning.
- Source components before quarantine: 3,721 curated topical rows + 1,941 founder-bank rows + 10,885 pipeline-bank rows. After the guard: 3,714 curated + 1,695 founder + 10,885 pipeline = 16,294 served rows.
- After quarantine, 6,712 rows have a printed answer key and 9,582 are practice-only: curated 3,714 keyed; founder 872 keyed + 823 practice-only; pipeline 2,126 keyed + 8,759 practice-only.
- Only **46 of the 16,294** served rows currently have a source-written explanation attached. Do not promise explanations for every question.
- The hub has 48 chapter entries and 19 whole-paper/set entries (67 hub entries), with a recorded hub/page mismatch check of zero.
- A prior source sweep recorded 1,927 duplicates, 5,671 rows with a genuinely missing option, 15 figure-dependent rows not rendered, 188 brand-bearing rows and 66 scan-furniture rows among excluded/rejected material. Treat these as the logged pipeline measurements, not necessarily mutually exclusive categories.
- The latest OCR pass restored Poppler + Tesseract locally and completed all 451 pages across 19 documents at 300 dpi, with zero failed and zero thin pages. It recovered **zero new answer keys**. The pipeline bank was rebuilt from 10,894 to 10,885 rows: 2,126 keyed and 8,759 practice-only, with 46 source explanations. OCR outputs and source PDFs are not all tracked in Git, so the extraction is not fully reproducible from the repository alone.
- The audit found 246 founder rows with one or more blank options (54 keyed, 192 practice-only) and seven curated rows with repeated options. The guard quarantines all 253; source files remain intact for correction.
- A further 272 stems match a broad option-label-like pattern; this includes false positives such as “A. C. generator”, so it is a review candidate set, not 272 confirmed corrupt questions.
- The current website's six topical categories are **not** the five official PM&DC paper sections. Mathematics is an extra practice category, not an official PM&DC MDCAT section. Do not label all six as official MDCAT sections.

These are source/log counts, not an independent academic-quality audit and not a claim that all 16,547 source rows belong to PM&DC MDCAT.

## Official blueprint baseline

### PM&DC MDCAT

The latest verified cycle in the checked official material is MDCAT-2026, for which PM&DC applied the 2025 Uniform Curriculum. The 2026 pattern is 180 MCQs in 180 minutes, no negative marking:

| Official section | Questions | Weight |
|---|---:|---:|
| Biology | 81 | 45% |
| Chemistry | 45 | 25% |
| Physics | 36 | 20% |
| English | 9 | 5% |
| Logical Reasoning | 9 | 5% |
| **Total** | **180** | **100%** |

Official aggregate difficulty: 15% easy, 70% moderate, 15% difficult. This is a 2026 verified baseline only. Re-check the official PM&DC publication page before creating a 2027 profile; do not assume the next cycle is unchanged.

Sources:
- PM&DC syllabus listing: https://pmdc.pk/Publication/Syllabus
- Uniform Curriculum MDCAT-2025: https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20%2826-05-2025%29.pdf
- PM&DC MDCAT-2026 notice applying the 2025 syllabus: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20MDCAT-2026%20Date%20Announcement.pdf

### NUMS MDCAT

The verified NUMS-2026 syllabus is separate:
- Paper-I: 150 MCQs, 2 hours 45 minutes; Biology 55, Chemistry 40, Physics 40, English 15.
- Paper-II: 50 psychological-test MCQs, 15 minutes.
- Total: 200 questions.
- Difficulty: 20% easy, 60% moderate, 20% hard.
- Biology/Chemistry/Physics: 70% recall and 30% application.
- Do not add PM&DC Logical Reasoning to NUMS by assumption.

The current source scan reports only three NUMS psychological scenario items. The recent local OCR run included a partial NUMS-2026 scan among documents not completed. NUMS is therefore not ready.

Source: https://numspak.edu.pk/upload/media/2026-NUMS-Updated-MDCAT-TOS-2026_1779075557.pdf

## Content-state contract

Use this state sequence and retain evidence at each transition:

`raw_source → extracted → normalized → deduplicated → exam_classified → syllabus_mapped → answer_verified → academically_reviewed → rights_cleared → approved → published`

Required fields for every approved item:
- Immutable stable key.
- Exam ID and variant ID; never infer exam membership from a shared subject.
- Blueprint version and exact learning-outcome ID.
- Subject, chapter/topic and optional subtopic.
- Stem and four distinct, plausible options (or a separately approved figure-based type).
- Correct answer with evidence/source reference.
- Worked explanation where required for the intended product tier; source-written explanations must be distinguished from newly authored/reviewed explanations.
- Difficulty and cognitive type.
- Accurate provenance: original Apex-authored, official public-paper reference, or licensed/permission-cleared source.
- Academic reviewer, review date and review state.

**Rights guardrail:** removing academy names or other branding is not copyright clearance. Do not publicly republish third-party academy/commercial question collections unless reuse permission or a valid licence is documented. Keep unclear-rights material quarantined from publication.

## Current task board

### M1 — Corpus truth, classification and coverage (ACTIVE)

- [x] Reconcile the currently served topical count and source components against the 2026-11-23 improvement log.
- [x] Record the six navigation categories versus the five official PM&DC sections; Mathematics must not be represented as an official MDCAT section.
- [x] Record explanation coverage honestly: 46 source-written explanations attached; 16,248 of the 16,294 served rows have no source-written explanation.
- [x] Record the 304-page OCR rerun and its zero-new-key result; do not count OCR volume as approved content.
- [x] Parse all three committed source arrays and reconcile their exact source counts, keyed/practice-only states, missing options, duplicate options, keys and explanation coverage.
- [x] Add a runtime guard that quarantines the 246 missing-option and seven duplicate-option rows without deleting source records.
- [x] Add a regression test and `npm run audit:medical-topicals` report script.
- [x] Execute the new report and test in CI. GitHub Actions run #45204606893 passed unit tests (including the audit report), ESLint and TypeScript on `ee7686d7e1692a00f2805500404ecfd15bf90513`.
- [ ] Classify every served row as PM&DC, NUMS, another exam, mixed/unknown or out-of-scope; exclude unknown and other-exam items from PM&DC coverage claims.
- [ ] Map every PM&DC-eligible row to the exact official 2025 curriculum learning outcome; report unmapped rows and per-outcome counts.
- [ ] Audit NUMS rows separately against the official 2026 blueprint; no implicit PM&DC-to-NUMS mapping.
- [ ] Run exact and near-duplicate detection across the three served banks, past-paper sets, flashcards and committed source corpora.
- [ ] Review source provenance and rights. De-branding alone is not a publication licence.
- [ ] Verify answer keys and explanations in small review batches with independent subject review; do not infer keys from option patterns or model re-solving.
- [ ] Reconcile the homepage's "25 Past papers" claim with the 19 topical whole-paper sets and the distinct past-paper registry; publish only a count with a clear definition.
- [ ] Review the 272 option-label-like stem candidates using a stricter, manually checked heuristic; do not auto-discard broad-regex matches.
- [ ] Produce a per-outcome coverage heatmap: zero, thin, adequate, overrepresented and pending review.

### M2 — PM&DC question-bank expansion (BLOCKED ON M1)

- [ ] Expand only demonstrated syllabus gaps, not arbitrary count targets.
- [ ] Prioritize the official section weights 45/25/20/5/5 while preserving full syllabus breadth.
- [ ] Write original questions with plausible distractors, worked explanations and balanced difficulty/cognitive type.
- [ ] Target the 15/70/15 aggregate difficulty mix for full-paper assembly; do not force every chapter drill to that mix.
- [ ] Produce 25–50 item review batches with coverage manifests and answer-verification evidence.
- [ ] Do not label original exam-style questions as genuine past-paper questions.

### M3 — Safe canonical delivery and durable progress (P0 TECHNICAL GATE)

- [ ] Reconcile PRs #22, #23 and #24 with current main; they remain open drafts and their feature branches are stale/diverged.
- [ ] Complete the server-side goal-scoped question-delivery path; only approved mappings for the exact exam/variant may be returned.
- [ ] Keep answer keys out of initial protected question payloads; validate submissions server-side.
- [ ] Persist attempts with the authenticated student's verified goal ID; carry that identity through offline retry/idempotency.
- [ ] Build a dry-run-first, idempotent importer with explicit target allowlisting, provenance, mapping and review-state controls.
- [ ] Test importer, RLS, cross-student/variant isolation and the full answer→refresh→analytics loop in a disposable non-production environment.
- [ ] Recheck live Supabase state read-only before relying on the older empty-table audit. No production writes or migrations without explicit approval.

### M4 — PM&DC learning experience

- [ ] Complete chapter/topic navigation from the verified outcome map.
- [ ] Complete practice, reviewed explanations, bookmarks, mistake review and goal-scoped flashcards.
- [ ] Ensure diagnostic and study planner recommendations use verified syllabus coverage and real persisted activity.
- [ ] Build a true 180-question/180-minute PM&DC mock only after sufficient reviewed questions exist for the exact blueprint.
- [ ] Label short or scaled mocks as custom practice, never as official full mocks.

### M5 — NUMS Prep Space

- [ ] Rebuild the NUMS-2026 syllabus map independently.
- [ ] Complete Paper-I subject and outcome coverage.
- [ ] Review the Paper-II psychological section carefully against official instructions; do not invent personality scoring or imply clinical validity.
- [ ] Assemble the 150 + 50 structure only after content and assessment rules pass review.
- [ ] Re-verify the next official NUMS cycle before activating its new-year profile.

### M6 — Medical release gate

- [ ] Verify every public count, syllabus claim, answer key, explanation and past-paper label.
- [ ] Verify goal-specific persistence, offline retry, privacy and exam isolation.
- [ ] Run tests, lint, TypeScript, production build, route/link audits and authenticated mobile/desktop student journeys on the release candidate.
- [ ] Founder reviews the release candidate; no deployment promotion or production data/schema change without separate explicit approval.

## Parked scope

Engineering (NUST/GIKI/LUMS/ECAT), Defence (PMA/ISSB), general HEC USAT, scholarship-test expansion and MBBS clinical learning are parked. Do not delete their existing code, content or routes. Do not spend active implementation capacity expanding them until the founder changes the scope.

## Operating rules

- One active wave and one accountable owner at a time.
- Status moves Ready → In Progress → Review → Testing → Done only with evidence.
- A green CI run on a stale PR branch is not proof that current main is integrated.
- A static bank count is not proof of syllabus coverage or academic quality.
- OCR output is raw/extracted content, not an approved question.
- No merges, production Supabase writes/migrations, Auth changes, billing/domain changes or deployment promotion without task-specific founder approval.
