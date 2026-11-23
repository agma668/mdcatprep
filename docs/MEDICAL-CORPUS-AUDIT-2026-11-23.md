# Medical Corpus Audit — 2026-11-23

**Repository:** `agma668/mdcatprep`  
**Inspected source baseline:** `main` at `45ed1579a9acc57656bf69d5062a4f984b50eba8`  
**Audit branch:** `docs/medical-first-reconciliation-2026-11-23`  
**Scope:** committed runtime topical bank, structural integrity and current medical-prep readiness. This is not a semantic academic review.

## 1. Source inventory and reconciled counts

The committed runtime seam in `lib/topicals.ts` combines three arrays:

| Source component | Source rows | After quality guard | Keyed after guard | Practice-only after guard |
|---|---:|---:|---:|---:|
| Curated topical bank | 3,721 | 3,714 | 3,714 | 0 |
| Founder bank | 1,941 | 1,695 | 872 | 823 |
| Pipeline bank | 10,894 | 10,894 | 2,126 | 8,768 |
| **Total** | **16,556** | **16,303** | **6,712** | **9,591** |

The previous committed main log reported 16,556 rows served. A source-level parse of the three committed arrays found 253 rows that should not be student-visible: 246 have at least one blank option, and seven have duplicated options. This branch adds a runtime guard to quarantine them without deleting or rewriting their source records.

The guard uses whitespace normalization while preserving case, because case is meaningful in options such as genetic notation (`TT`, `Tt`, `tt`).

## 2. Subject counts after quarantine

| Navigation category | Served rows |
|---|---:|
| Biology | 8,509 |
| Chemistry | 4,568 |
| Physics | 2,815 |
| English | 270 |
| Mathematics | 84 |
| Reasoning | 57 |
| **Total** | **16,303** |

These are topical navigation categories, not a claim that all rows belong to one exam. PM&DC MDCAT-2026 has five official sections: Biology, Chemistry, Physics, English and Logical Reasoning. Mathematics is additional practice, not a separate PM&DC section.

## 3. Quarantine findings

### 246 rows with missing options

All 246 occur in the founder bank:
- Biology: 76
- Chemistry: 9
- Physics: 161

Of these, 54 carried an answer key and 192 were already practice-only. Even a printed key is not enough to serve a question with missing answer choices. These rows are excluded from the student-facing bank until the source extraction is repaired.

### Seven rows with duplicated options

All seven occur in the curated bank:
- Biology: 3
- Chemistry: 4

They contain four non-empty options but at least one exact repeated option after whitespace normalization. They are excluded pending source correction.

### Other structural observations

Across the complete 16,556 source rows, the source parser found:
- 0 duplicate keys.
- 0 exact duplicate signatures when comparing the stem plus ordered options.
- 0 empty question stems.
- 0 missing source labels.
- 0 invalid answer states outside A–D or null.
- 46 source-written explanations.

A broad option-label-like stem heuristic flagged 272 candidates (77 founder rows and 195 pipeline rows). It also catches legitimate text such as “A. C. generator”, so this is a manual-review candidate set, not 272 confirmed corrupt questions. Do not automatically discard these solely from that broad pattern.

The 46 source-written explanations are not a substitute for academic review. The 9,591 no-key questions remain unscored practice-only.

## 4. Reproducible guard and audit added in this branch

- `lib/topicals.ts` now filters out any row with a blank option or an exact repeated option (case-sensitive after whitespace normalization).
- `TOPICALS_QUARANTINE_SUMMARY` exposes the source, served and quarantined counts.
- `lib/topicals-bank-quality.test.ts` asserts that every served row has a stable unique key, non-empty stem/source, four distinct options and a valid answer state; it also pins the current quarantine counts.
- `scripts/audit-medical-topicals.mjs` produces a JSON report of the served bank, subject/source counts, keyed vs practice-only counts, explanation coverage, structural issues and exact duplicate signatures.
- `npm run audit:medical-topicals` runs the report.
- The quality test is added to `npm test`.

The runtime homepage and topical counts derive from `TOPICALS_TOTAL`, so they should recalculate to 16,303 when this branch is integrated. No count was hardcoded into the UI.

## 5. Official exam distinction

### PM&DC MDCAT-2026 baseline

The checked PM&DC notice applies the 2025 Uniform Curriculum to MDCAT-2026: 180 MCQs in 180 minutes, no negative marking:
- Biology 81
- Chemistry 45
- Physics 36
- English 9
- Logical Reasoning 9

Difficulty distribution: 15% easy, 70% moderate, 15% difficult. This is a verified 2026 baseline, not a promise about the 2027 cycle.

### NUMS MDCAT-2026 baseline

NUMS has a separate 2026 profile: Paper-I 150 MCQs (Biology 55, Chemistry 40, Physics 40, English 15) and Paper-II 50 psychological-test MCQs. Difficulty is 20/60/20. An earlier source scan found only three NUMS psychological scenario items; a recent local OCR run included only a partial NUMS-2026 scan. NUMS is not ready.

## 6. OCR, provenance and rights

The 2026-11-22 improvement log records restoration of Poppler/Tesseract and OCR of 304 pages across 14 documents at 300 dpi. Zero new answer keys were recovered. A 30-row pipeline shrink was reverted; the committed pipeline bank remains 10,894 rows. Five documents (~139 pages), including a partial NUMS scan, were left for a later resumable pass.

The OCR outputs and source PDFs are not all tracked in Git, so the full extraction cannot yet be reproduced from the repository alone. OCR output is raw source material, not approved content.

Removing academy names is not copyright clearance. Third-party academy/commercial question material must not be publicly republished unless reuse permission or a licence is documented. Keep unclear-rights material out of publication.

## 7. Remaining work — academic and exam mapping

- [ ] Classify every row as PM&DC, NUMS, another exam, mixed/unknown or out-of-scope.
- [ ] Map PM&DC-eligible rows to exact PM&DC learning-outcome IDs.
- [ ] Map NUMS independently to its official syllabus outcomes.
- [ ] Review the 272 option-label-like stem candidates with a stricter, manually checked rule.
- [ ] Run near-duplicate detection across the served banks, flashcards and committed source corpus.
- [ ] Verify answer correctness and explanations in small subject-reviewed batches.
- [ ] Record source provenance and reuse permission for each approved batch.
- [ ] Reconcile the homepage “25 Past papers” tile with the 19 topical whole-paper/set entries and the separate past-paper registry.
- [ ] Build zero/thin/adequate coverage heatmaps before writing more questions.

## 8. Limitations and release status

This audit proves structural facts about the committed arrays. It does **not** prove academic correctness, official exam membership, syllabus coverage, copyright permission, student progress persistence or readiness for a full official mock.

The quarantine guard, public-copy corrections and tests are proposed on this branch and are not yet merged into `main`. PR #26 is a draft. No production database write, content import, migration, Auth change, deployment promotion or merge was performed.
