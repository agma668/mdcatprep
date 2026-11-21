# Medical Content & Prep Experience Agent Board — Apex Pakistan

> Owner: medical product/content orchestration. Created 2026-11-21. This board is the source of truth for question-bank expansion, syllabus coverage, academic QA and the medical Prep Space. Work in this board is planning and source-code scope only unless a task explicitly authorizes a safe implementation.

## Mission

Build the most useful, trustworthy medical entrance preparation experience we can: comprehensive syllabus coverage, a large original question bank, explanations that teach, chapter-wise practice, flashcards, past-paper learning, timed assessments, mistake review and honest progress.

**Quality beats raw volume.** Never inflate counts with duplicates, copied commercial material, unsupported answer keys or questions that do not map to a verified syllabus outcome.

## Scope for this product wave

### In scope, in order

1. **PM&DC MDCAT** — primary medical Prep Space. Provincial conducting bodies/regions are metadata and discovery context when the national blueprint is the same; do not create duplicate question pools just because the city/province differs.
2. **NUMS MDCAT** — second medical Prep Space, with its own syllabus, paper structure, difficulty mix, content mapping and progress. Reuse a question only when its learning outcome genuinely matches both blueprints and both mappings are explicitly reviewed.
3. **Medical-admissions support tools** — only where they serve MDCAT/NUMS preparation and have a verified formula/source (e.g. merit calculators and admission explainers). These are supporting tools, not separate exam banks.

### Parked for this wave

- Engineering, NUST, GIKI, LUMS, PMA/ISSB and general HEC USAT expansion.
- HEC Balochistan/Ex-FATA scholarship pre-medical test remains a separate assessment, not silently merged into MDCAT or standard USAT-M; include it only after a separate explicit scope decision.
- MBBS clinical learning/notes is post-admission education and remains separate from entrance-test preparation.
- Do not delete existing work or break existing routes merely because these tracks are paused.

## Official blueprint baseline — checked 2026-11-21

### PM&DC MDCAT

- PM&DC's official syllabus listing currently exposes the **Uniform Curriculum MDCAT-2025**. PM&DC's 19 May 2026 notice explicitly applied the 2025 syllabus to MDCAT-2026. The 2027 syllabus/pattern is not verified in the official listing at this check; do not market 2025/2026 rules as confirmed 2027 rules.
- The official 2026 notice specifies 180 paper-based MCQs in 3 hours, no negative marking: Biology 81, Chemistry 45, Physics 36, English 9, Logical Reasoning 9.
- Official difficulty distribution: 15% easy, 70% moderate, 15% difficult.
- Use the published syllabus learning outcomes as the canonical content map. Do not invent official per-chapter question weightings; allocate practice volume internally and label it as an Apex study recommendation.

Official sources:
- PM&DC syllabus listing: https://www.pmdc.pk/Publication/Syllabus
- Uniform Curriculum MDCAT-2025 PDF: https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20%2826-05-2025%29.pdf
- PM&DC MDCAT-2026 notice/pattern: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20Opening%20of%20Online%20Registration%20Portal%20for%20MDCAT-2026.pdf
- PM&DC notice applying 2025 syllabus to 2026: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20MDCAT-2026%20Date%20Announcement.pdf

### NUMS MDCAT

- The official NUMS MDCAT-2026 syllabus is separate from the PM&DC syllabus.
- Paper-I: 150 MCQs, 2 hours 45 minutes. Biology 55, Chemistry 40, Physics 40, English 15.
- Paper-II: 50 psychological-test MCQs, 15 minutes. Total: 200 MCQs.
- Official difficulty mix: 20% easy, 60% moderate, 20% hard. Biology/Chemistry/Physics are described as 70% recall and 30% application.
- The syllabus contents include NUMS-specific science coverage and a psychological test. It also labels Logical Reasoning as for National MDCAT only; do not automatically add PM&DC's LR section to NUMS.
- The 2026 profile is a verified historical/current-cycle baseline, not a promise that the 2027 NUMS pattern will be unchanged. Re-check the next official NUMS syllabus before activating a new-year profile.

Official source:
- NUMS MDCAT-2026 syllabus PDF: https://numspak.edu.pk/upload/media/2026-NUMS-Updated-MDCAT-TOS-2026_1779075557.pdf
- NUMS 2026 admissions page: https://numspak.edu.pk/news-detail/nums-mdcat-2026-for-admissions-in-mbbs-bds-session-2026-27

## Existing repository content baseline — static inspection, not a public claim

Repository: `agma668/mdcatprep`, `main` at `1f54c344418e5fd6e45c1d4ca8c2102772c9eaba`.

- Core source files contain approximately **889 literal keyed MCQ records** by a static source scan: Biology 163, Chemistry 179, Physics 305, English 172, and `PAST_PAPER_BANK` 70. Reconcile these against the runtime `MDCAT_QUESTIONS.length` and the shared bank auditor before publishing any number.
- `lib/past-paper-bank.ts` has a stale header comment saying 40 questions while a literal scan found 70 keyed records. Resolve the discrepancy and review whether every item is original exam-style content or a genuinely sourced past-paper item.
- `lib/mdcat.ts` aggregates the four subject banks plus `PAST_PAPER_BANK`; its subject list includes Logical Reasoning, but the subject banks and taxonomy need a measured coverage audit.
- `lib/mdcat-topics.ts` supplies chapter/topic navigation. Its comments describe approximate subtopics; verify that actual bank topic strings map to exact syllabus learning outcomes rather than relying on topic-name similarity.
- `lib/flashcards/flashcards-data.ts` contains 356 literal card IDs in the static source scan. Verify runtime deck totals, duplicate cards, syllabus alignment and answer accuracy.
- Additional source material exists in `knowledge-base/questions/`, `knowledge-base/reference/`, `data/raw/mdcat/`, `lib/topicals-bank.ts` (about 1.5 MB), and related markdown/CSV/JSON files. Large blobs were not fully inspected in this pass; treat them as unreviewed source corpus, not approved questions.
- The `NUMS_PSYCH_BANK` currently contains only three scenario items in the source scan. They are not evidence of a complete 50-question Paper-II bank and need a dedicated suitability/blueprint review before use.
- The last recorded live Supabase inspection (2026-11-08) found `public.questions` empty. Re-check with read-only queries before relying on that old observation. Never run the legacy `scripts/seed-mdcat-questions.mjs` against production.

## Question content standard

Every student-facing MCQ must have:

1. Stable immutable key/ID.
2. Exact exam and variant mapping (PM&DC MDCAT, NUMS, or explicitly approved shared mapping).
3. Official syllabus version and learning-outcome identifier.
4. Subject, chapter, topic and optional subtopic.
5. One defensible correct answer and four plausible, non-overlapping options (unless a separately approved item type is used).
6. A worked explanation that teaches the underlying concept, not just repeats the answer.
7. A short explanation of why the tempting distractors are wrong for calculation/concept-trap items.
8. Difficulty (easy/moderate/hard) and cognitive type (recall, understanding, application, analysis).
9. Provenance: original Apex question, official public-paper reference, or reviewed source reference. Never invent a past-paper year or label original questions as PYQs.
10. Review state and reviewer evidence. AI-generated or OCR-extracted material starts as draft and cannot auto-publish.

### Quality states

`raw_source → extracted → normalized → deduplicated → syllabus_mapped → answer_verified → academically_reviewed → approved → published`

No state may be skipped. A question can be structurally valid and still be academically wrong; automated checks do not replace subject review.

### Difficulty and paper balance

- PM&DC full mocks must match the official subject counts and the aggregate 15/70/15 difficulty mix for the selected verified blueprint.
- NUMS mocks must use the separate 150 + 50 structure and 20/60/20 difficulty mix for the verified 2026 profile, unless a newer official profile supersedes it.
- Chapter drills may use adaptive mixes, but must not imply official per-chapter weightings where none are published.
- Mix recall, conceptual understanding, application, numerical reasoning, data/diagram interpretation and multi-step reasoning where the syllabus supports them.

## Content expansion strategy

- First build a complete machine-readable syllabus/learning-outcome map for PM&DC MDCAT, then NUMS.
- Ensure every official learning outcome has a starter set of distinct, well-reviewed questions before marking it covered. Expand high-value outcomes with multiple forms and difficulty levels based on syllabus importance, student error data and content gaps.
- Use the paper's subject weighting to guide the overall bank investment: Biology 45%, Chemistry 25%, Physics 20%, English 5%, Logical Reasoning 5% for the PM&DC 2026 profile. This is a planning allocation, not an official per-topic prediction.
- For Biology, Chemistry and Physics, author conceptual and application variants rather than cloning the same fact into many stems. For Physics and Physical Chemistry, include fully worked calculations with units and sign conventions. For English and Logical Reasoning, build skill families and explain the reasoning path.
- Add diagram/table-based questions only when the visual is legible, accessible and has an answer key that has been independently checked.
- Build question batches small enough for reliable review (suggested 25–50 items per batch); each batch has a coverage manifest and a review report.
- Use official public papers for pattern analysis and provenance. Do not reproduce commercial academy books, paid question banks, or restricted scans. Respect the repository's strict no-AKU rule.

## Source-ingestion pipeline

1. Inventory each source file, image/PDF set, year, exam, board, source owner and reuse permission.
2. Preserve raw originals unchanged; generate OCR/extraction outputs into a separate review directory.
3. Normalize text, formulas, units, option labels and answer-key references into a consistent JSON/JSONL schema.
4. Run structural validation, exact duplicate detection, near-duplicate candidate detection and answer-key consistency checks.
5. Map each candidate to the exact official learning outcome and exam variant.
6. Independently verify the answer and explanation against reliable educational references and/or official answer keys.
7. Review copyright/provenance; exclude commercial/pirated content and any source whose reuse permission is unclear.
8. Have a human academic reviewer approve the batch; keep rejected/uncertain items out of student delivery.
9. Import through a dry-run-first, idempotent, exam-aware pipeline into a non-production test environment.
10. Verify server-side goal/variant authorization, question delivery, attempt persistence, refresh, offline retry and analytics before release.

## Ordered execution queue

### Wave M1 — Content truth and coverage audit (start here)

- [ ] Run the structural auditor on the complete MDCAT aggregate and every raw medical corpus; produce exact counts by subject/topic and issue lists.
- [ ] Resolve the `PAST_PAPER_BANK` header/count mismatch (40 stated vs 70 literal keyed records).
- [ ] Build a canonical PM&DC 2025 learning-outcome map from the official PDF; attach every existing question to one outcome or mark it unmapped.
- [ ] Identify exact/near duplicates across subject banks, topicals, past-paper bank, flashcards and source corpora.
- [ ] Verify answer keys and explanations in review batches; prioritize questions with ambiguous calculations, outdated facts or unsupported source claims.
- [ ] Separate original exam-style questions from genuine public-paper questions with truthful provenance.
- [ ] Produce a coverage heatmap: learning outcomes with zero, low, adequate and overrepresented coverage.

### Wave M2 — PM&DC MDCAT bank expansion

- [ ] Expand only after M1 reveals real gaps. Start with uncovered/undercovered learning outcomes, not arbitrary subject quotas.
- [ ] Prioritize Biology (45%), Chemistry (25%) and Physics (20%) while preserving English and Logical Reasoning coverage (5% each).
- [ ] Add varied question forms and difficulty while avoiding paraphrase clones.
- [ ] Ensure explanations, answer positions and difficulty mix are balanced and checked.
- [ ] Re-run structural, exact/near-duplicate and syllabus-coverage audits after every batch.

### Wave M3 — Practice and assessment engines

- [ ] Reconcile topic navigation with the official learning-outcome map.
- [ ] Build reliable chapter/topic drills, saved attempts, bookmarks and mistake review.
- [ ] Repair canonical question identity and server-controlled delivery; do not ship full protected banks in public client bundles.
- [ ] Validate exam-goal-scoped progress and offline retry/idempotency.
- [ ] Build a true PM&DC 180-MCQ / 180-minute mock from the exact verified blueprint and an adequate reviewed question pool; retain scaled mocks only with honest labels.
- [ ] Add mock analytics and per-subject/topic review without fabricating mastery or performance claims.

### Wave M4 — NUMS Prep Space

- [ ] Build a separate NUMS 2026 blueprint with Paper-I/Paper-II, timing, weights, difficulty and source references.
- [ ] Compare PM&DC and NUMS learning outcomes; share questions only through explicit reviewed mappings.
- [ ] Audit and expand the NUMS Paper-II bank only against a verified NUMS psychological-test blueprint. Do not invent scoring/diagnosis or treat three scenarios as a 50-item bank.
- [ ] Build NUMS-specific practice and mock assembly; keep national MDCAT Logical Reasoning out unless NUMS officially includes it in a later profile.
- [ ] Verify NUMS-specific progress and analytics isolation.

### Wave M5 — Medical study toolkit and UX

- [ ] Audit the medical flashcard deck and implement effective spaced repetition, due queues and chapter-linked revision.
- [ ] Audit master notes and topical practice against the same syllabus map.
- [ ] Improve the mistake notebook, bookmarks, study planner and diagnostic test using real attempt data.
- [ ] Build released past-paper library with year, authority, code, source and official/reconstructed/memory-based provenance.
- [ ] Provide low-bandwidth and accessible study workflows; test 360/390/768px and desktop.
- [ ] Add Urdu support only after translation review, with English terminology preserved where useful.

### Wave M6 — Medical release gate

- [ ] Every PM&DC/NUMS question delivered to students is reviewed, mapped and correctly keyed.
- [ ] Official mock rules match the currently verified blueprint; future-year uncertainty is explicit.
- [ ] Attempt save/reload, bookmarks, mistakes and analytics work and are goal-scoped.
- [ ] Public sample content is deliberately selected; full protected banks are server-delivered only after authorization.
- [ ] Counts reconcile across practice, portal, admin and SEO surfaces.
- [ ] Full test/build, browser, accessibility, responsive and low-bandwidth QA pass.
- [ ] Readiness matrix updated with evidence before either medical Prep Space is called Available.

## Operating rules

- Read `AGENTS.md`, `TODO.md`, `ROADMAP-AGENT-BOARD.md`, `EXAM-READINESS-AUDIT.md`, `EXAM-REGISTRY-PROPOSAL.md` and `EXAM-DATA-BOUNDARY-DESIGN.md` before code/data changes.
- Do not touch production Supabase schema/data, Auth settings, Vercel protection, billing, domains or deployments without task-specific approval.
- Never run the legacy MDCAT seed script against production.
- Keep all new content original unless an official public-paper source is explicitly recorded and permitted; no commercial academy scans, no AKU material.
- Keep counts derived from the actual approved question source; do not hand-type marketing numbers.
- Record every completed batch in `IMPROVEMENT_LOG.md` and this board, including source, count, coverage, QA results and remaining uncertainties.


## 2026-11-21 — Wave M1 static bank audit completed

See `MEDICAL-BANK-AUDIT-2026-11-21.md` for the full static-audit findings and limitations.

- [x] Parsed all five current MCQ source arrays: 889 records total (Biology 163, Chemistry 179, Physics 305, English 172, `PAST_PAPER_BANK` 70).
- [x] Structural scan: no missing key/subject/topic/stem/options/answer/explanation; no duplicate stable keys; no exact duplicate full items.
- [x] Found six repeated-stem groups: four concept-level repeats need review; two generic spelling templates have different options and require educational-value review, not automatic deletion.
- [x] Measured subject distribution: Biology 171 (19.2%), Chemistry 187 (21.0%), Physics 313 (35.2%), English 180 (20.2%), Logical Reasoning 38 (4.3%). Compared with PM&DC 2026 paper weights, the bank is over-weighted in Physics/English and under-weighted in Biology/Chemistry/LR. Biology is the first expansion priority.
- [x] Measured difficulty: Easy 362 (40.7%), Moderate 411 (46.2%), Hard 116 (13.1%); the aggregate bank does not reflect PM&DC's 15/70/15 profile. Review labels and expand moderate/application/difficult coverage.
- [x] Measured correct-option position: A 168, B 403, C 219, D 99. B is overrepresented and D underrepresented; rebalance only after answer verification, moving option text and answer key together.
- [x] Found topic/taxonomy drift: current bank has 9 Biology, 10 Chemistry, 14 Physics, 5 English and 10 Logical Reasoning topic labels; 8 taxonomy labels and 6 bank topic labels do not match exactly. A canonical outcome map and aliases are required.
- [x] Provenance check: none of the 889 records has a `pastPaper` metadata object; `PAST_PAPER_BANK` is original exam-style content despite its filename. Its header says 40 records while 70 were parsed. The actual released-paper registry is `lib/past-papers.ts`.
- [ ] Independently verify answer keys, explanations, distractors and permissions; structural validity is not academic correctness.
- [ ] Parse the large topicals/knowledge-base/OCR corpus and map all source items to outcomes before counting them.
- [ ] Extract the full PM&DC official syllabus into stable learning-outcome IDs; then map all existing questions and identify uncovered outcomes.

**Current next action:** build the canonical PM&DC syllabus outcome map and coverage report. Do not bulk-generate more Physics/English or publish an inflated question count while the map is missing.
