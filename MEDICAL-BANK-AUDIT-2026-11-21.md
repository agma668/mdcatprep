# Medical Bank Structural Audit — 2026-11-21

**Repository:** `agma668/mdcatprep`  
**Audited ref:** `main` at `1f54c344418e5fd6e45c1d4ca8c2102772c9eaba`  
**Scope:** the five current MCQ source arrays only; this is a static source audit, not academic approval or a production-data audit.

## 1. Parsed bank size

| Source array | Records |
|---|---:|
| Biology | 163 |
| Chemistry | 179 |
| Physics | 305 |
| English | 172 |
| `PAST_PAPER_BANK` | 70 |
| **Total** | **889** |

The aggregate subject distribution after parsing each question's own `subject` field is:

| Subject | Questions | Share of bank | PM&DC 2026 paper share |
|---|---:|---:|---:|
| Biology | 171 | 19.2% | 45% |
| Chemistry | 187 | 21.0% | 25% |
| Physics | 313 | 35.2% | 20% |
| English | 180 | 20.2% | 5% |
| Logical Reasoning | 38 | 4.3% | 5% |

The current pool is heavily skewed toward Physics and English relative to the official paper weighting, while Biology is underrepresented. The official paper weighting is a useful planning signal for the bank's next expansion; it is **not** an official per-chapter question quota. Do not delete existing material simply to force a ratio. Expand Biology first, then address Chemistry and Logical Reasoning gaps after the syllabus map is complete. Pause bulk English/Physics additions until coverage review shows a real need.

## 2. Difficulty and answer-position balance

| Difficulty | Questions | Share | PM&DC 2026 paper profile |
|---|---:|---:|---:|
| Easy | 362 | 40.7% | 15% |
| Moderate | 411 | 46.2% | 70% |
| Hard | 116 | 13.1% | 15% |

The pool is much easier and less moderate than the official aggregate profile. Rebalance new batches toward moderate and difficult reasoning after verifying the existing labels; do not relabel questions without review.

| Correct option | Questions | Share |
|---|---:|---:|
| A | 168 | 18.9% |
| B | 403 | 45.3% |
| C | 219 | 24.6% |
| D | 99 | 11.1% |

Option B is overrepresented and D is underrepresented. This can train test-takers to notice a position bias. After answer keys are academically verified, rebalance option positions with a tested shuffle that moves the correct answer and all option text together. Never change a key by changing only the answer letter.

## 3. Structural integrity and duplicate scan

- Parsed 889 question objects across the five arrays.
- No missing key, subject, topic, stem, option, valid A/B/C/D answer label or explanation was found by this static scan.
- No duplicate stable keys were found.
- No exact duplicate full question signatures (stem plus all four options) were found.
- Six repeated stem groups were found. Four are concept-level repeats requiring review: fertilisation site (2), isotope/neutron definition (2, across Biology/Chemistry), transformer principle (2), and SI unit of magnetic flux (2). The remaining two are reusable spelling-question templates (5 and 18 instances) with different option sets; review their answer sets and learning value rather than deleting automatically.
- These checks do not prove academic correctness, uniqueness of the underlying concept, syllabus alignment, or quality of distractors.

## 4. Topic coverage and taxonomy drift

Current parsed topic counts by subject:
- Biology: 9 distinct topic labels.
- Chemistry: 10.
- Physics: 14.
- English: 5.
- Logical Reasoning: 10.

The current `lib/mdcat-topics.ts` contains 50 distinct literal `name` labels when chapter and topic names are combined. Eight labels do not appear as exact bank topic strings: `Cell Biology`, `Basic Concepts`, `Acids, Bases and Salts`, `Measurements`, `Sentence Skills`, `Reading Comprehension`, `Verbal Reasoning`, and `Non-Verbal Reasoning`. Six bank topic strings are not exact labels in the taxonomy: `Solid State`, `Electromagnetic Waves`, `Simple Harmonic Motion`, `Spelling`, `Word Pattern`, and `Clock and Calendar`.

Some of these are legitimate chapter-vs-topic naming differences, so exact string comparison is only a warning signal. The next step is a canonical PM&DC learning-outcome map with explicit IDs and aliases, not blind renaming. The current bank's topic taxonomy is not evidence that every official syllabus unit/outcome is covered.

## 5. Provenance finding

- The 70 records in `PAST_PAPER_BANK` use the shared source label `PMDC/NUMS Exam Style`; none of the 889 parsed records has a `pastPaper` metadata object.
- The file header itself says these are original exam-style questions, not transcribed past-paper questions, but its comment says 40 items while the parser found 70. Fix the comment and keep the questions labelled as original exam-style material.
- Actual released-paper entries are maintained separately in `lib/past-papers.ts` / `lib/past-paper-bank.ts` metadata should not be inferred from the filename. Confirm the true paper registry and provenance before calling anything a PYQ.
- Large source files in `knowledge-base/questions/`, `knowledge-base/reference/`, `data/raw/mdcat/` and `lib/topicals-bank.ts` were identified but not fully parsed in this pass. They are an unreviewed corpus, not additional approved question counts.

## 6. What this audit does not prove

This was a static parser over source files. It did not:
- independently solve or verify the 889 answer keys;
- verify explanation correctness or source permissions;
- complete a semantic near-duplicate review;
- map every question to an official PM&DC/NUMS learning outcome;
- inspect every large raw corpus file;
- run repository tests/build or query the live Supabase database.

The previous recorded live question-table check was 2026-11-08 and found zero rows. Re-check read-only before planning ingestion. Never run the legacy production seed script.

## 7. Next actions

1. Extract the full PM&DC 2025 syllabus into stable learning-outcome IDs and build a chapter/topic alias map.
2. Map all 889 existing records to one or more reviewed PM&DC outcomes; leave ambiguous questions unmapped.
3. Review the four concept-level repeated stems and all answer-position bias.
4. Review Biology coverage first; identify uncovered outcomes and build original batches only for those gaps.
5. Independently verify answer keys, explanations, distractors and provenance in 25–50-question review batches.
6. Audit NUMS against its separate official 2026 syllabus after the PM&DC map is established.
7. Build a safe, dry-run-first importer and goal-aware server delivery path before any production import.

## Official references used

- PM&DC syllabus listing: https://www.pmdc.pk/Publication/Syllabus
- PM&DC Uniform Curriculum MDCAT-2025: https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20%2826-05-2025%29.pdf
- PM&DC MDCAT-2026 pattern notice: https://pmdc.pk/Documents/Others/Public%20Notice%20Regarding%20Opening%20of%20Online%20Registration%20Portal%20for%20MDCAT-2026.pdf
- NUMS MDCAT-2026 syllabus: https://numspak.edu.pk/upload/media/2026-NUMS-Updated-MDCAT-TOS-2026_1779075557.pdf
