# Medical Corpus Audit — 2026-11-23

**Repository:** `agma668/mdcatprep`  
**Inspected branch:** `main`  
**Baseline commit:** `45ed1579a9acc57656bf69d5062a4f984b50eba8`  
**Purpose:** establish a reproducible baseline before expanding the medical question bank. This is a source/log reconciliation, not a semantic academic review.

## 1. Current served bank

The latest committed improvement log (2026-11-22) records:

| Component | Rows |
|---|---:|
| Curated topical bank | 3,721 |
| Founder bank | 1,941 |
| Pipeline bank | 10,894 |
| **Served topical total** | **16,556** |

The source code seam is `lib/topicals.ts`, which combines `TOPICALS_BANK`, `FOUNDER_BANK` and `PIPELINE_BANK`. The latest log records 48 chapter entries, 19 whole-paper/set entries, six navigation categories and zero hub/page count mismatches.

The six navigation categories are Biology, Chemistry, Physics, English, Mathematics and Reasoning. They must not be described as the five official PM&DC paper sections: Mathematics is an additional practice category, not a separate PM&DC MDCAT section.

## 2. Answer and explanation limitations

- Pipeline bank: 10,894 served rows, 2,126 with printed keys; remaining pipeline rows are intentionally practice-only.
- The improvement log records only 46 source-written explanations attached across the complete 16,556-row served bank.
- The log therefore records 16,510 rows with no source-written explanation.
- No answer key may be inferred from option position, a duplicate guess, or a model re-solving the question.
- Structural validity and the presence of a printed key do not establish academic correctness.

## 3. OCR and source-ingestion status

The 2026-11-22 log records that Poppler and Tesseract were restored locally and 304 pages across 14 documents were OCRed at 300 dpi. The run covered HEC and other source material; five documents (about 139 pages) were left for a later resumable pass, including a partial NUMS-2026 scan.

The OCR key-table extraction recovered zero new answer keys. A rebuild temporarily produced 10,864 pipeline rows rather than 10,894 and was reverted. The committed pipeline bank remains at 10,894 rows.

Important reproducibility limitation: the local `data/MCQS` OCR/source outputs are not present in the Git tree at this baseline. The committed source bank can be audited from GitHub, but the full local extraction run cannot yet be independently reproduced from the repository alone.

## 4. Previously measured excluded/rejected material

The 2026-11-22 improvement log records:
- 5,671 rows with a genuinely missing option.
- 15 figure-dependent rows whose visual is not served.
- 188 brand-bearing rows.
- 66 rows containing scan furniture.
- 1,927 duplicates.
- 4,118 rows rejected by the quality gate.

These are logged pipeline measurements and may overlap; do not sum them as mutually exclusive categories.

## 5. Official exam distinction

### PM&DC MDCAT-2026 baseline

PM&DC's checked 2026 notice applies the 2025 Uniform Curriculum and specifies 180 MCQs in 180 minutes, no negative marking:

- Biology 81
- Chemistry 45
- Physics 36
- English 9
- Logical Reasoning 9

Difficulty distribution: 15% easy, 70% moderate, 15% difficult. This is a verified 2026 baseline, not a promise about the 2027 cycle.

### NUMS MDCAT-2026 baseline

NUMS has its own syllabus and structure: Paper-I 150 MCQs (Biology 55, Chemistry 40, Physics 40, English 15) and Paper-II 50 psychological-test MCQs. Difficulty is 20/60/20. The current source bank contains only three NUMS psychological scenario records according to the prior source scan; NUMS is not ready.

## 6. Critical limitations and unresolved questions

1. No current independent audit has mapped all 16,556 served rows to PM&DC learning outcomes.
2. No current independent audit has classified every row by PM&DC vs NUMS vs other exam vs unknown source.
3. Near-duplicate coverage across every committed bank, flashcard and raw corpus is not yet proven complete.
4. The 46 source-written explanations are not a substitute for subject review.
5. The homepage's "25 Past papers" wording needs reconciliation with the 19 topical whole-paper/set entries and the separate past-paper registry. A set title/year is not proof of an official sitting.
6. De-branding source content does not establish copyright permission. Third-party commercial or academy material must remain unpublished unless rights are documented.
7. The last live Supabase empty-question-table observation is historical. Recheck with read-only queries before relying on it; do not seed production.

## 7. Next reproducible audit deliverables

- [ ] Runtime count by subject, chapter/set and source component.
- [ ] Keyed vs practice-only counts by source and subject.
- [ ] Structural issue report: missing keys, invalid keys, duplicate keys, duplicate stems/options, missing options, figure requirements and malformed text.
- [ ] Exam-classification manifest for each row.
- [ ] PM&DC learning-outcome coverage map and zero/thin/adequate heatmap.
- [ ] Separate NUMS outcome coverage map.
- [ ] Exact and near-duplicate report across served banks, flashcards and committed source files.
- [ ] Provenance and rights-clearance manifest.
- [ ] Human academic-review batches with answer evidence and review state.

No content was imported, published, re-keyed or academically approved as part of this audit.
