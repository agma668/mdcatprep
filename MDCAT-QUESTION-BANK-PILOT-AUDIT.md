# MDCAT Question Bank — First-Pass Source Inspection

**Date:** 2026-11-28  
**Source inspected:** `knowledge-base/questions/MDCAT_Practice_Questions.md`  
**Method:** Read-only parsing of Markdown question markers, chapter headings and bold A–D option labels. No source files or runtime banks were modified.

## 1. Source-level inventory

The file declares 3,594 questions with the following subject counts. The parsed question markers reconcile exactly to these section totals.

| Subject | Source count | Parsed question markers |
|---|---:|---:|
| Biology | 1,439 | 1,439 |
| Chemistry | 939 | 939 |
| Physics | 1,216 | 1,216 |
| **Total** | **3,594** | **3,594** |

The source contains 50 chapter headings: 17 Biology, 20 Chemistry and 13 Physics. This confirms the source is already chapter-organized to a meaningful extent. It does **not** prove those chapter names align one-to-one with the current official PM&DC syllabus taxonomy.

## 2. First-pass structural results

The parser counted the number of distinct bold-labelled A/B/C/D options inside each question block:

| Distinct labelled options detected | Records |
|---:|---:|
| 0 | 1,980 |
| 1 | 16 |
| 2 | 10 |
| 3 | 15 |
| 4 | 1,573 |
| **Total** | **3,594** |

**Interpretation:** 1,573 records have four labelled options in the current Markdown format. The other 2,021 are flagged for inspection. This does not mean all 2,021 are unusable: some may be short-answer/explanation-style entries or use a different format. They must not be deleted automatically.

A question marker and an `Answer:` line do not necessarily make a valid MCQ. Several inspected entries contain free-response text, explanations, website navigation or incomplete option sets.

## 3. Duplicate candidate inspection

A conservative first pass compared normalized stems and the complete set of detected option texts, ignoring option order. It surfaced five candidate clusters, but not all are duplicate MCQs:

- One 17-occurrence cluster is repeated website navigation text, not a question.
- Two entries share the generic stem “For the reaction:” but contain different reactions/answers; they are not duplicates.
- One half-life calculation stem appears twice without labelled options; retain for structural review and compare full source context.
- One Physics four-option inductor question appears twice with the same stem/options/key; this is a strong exact-duplicate candidate for the curated topical practice pool.
- A vector-quantity stem appears twice without labelled options and has conflicting answer text; flag as an answer/content conflict, not a safe duplicate merge.

These findings demonstrate why deduplication must compare full content and preserve provenance. Do not use the candidate-cluster count as a confirmed deletion count.

## 4. Chapter organisation observed

The existing source has 50 chapter buckets. Examples include:

- Biology: Acellular Life, Bioenergetics, Biological Molecules, Biotechnology, Body Fluids and Circulation, Cell Structure and Function, Coordination and Control, Digestion, Enzymes, Evolution, Hemostasis, Immunity, Inheritance, Plants, Reproduction, Respiration, Support and Movement.
- Chemistry: Alcohols and Phenols, Aldehydes and Ketones, Alkyl Halides, Atomic Structure, Basic Concept, Carboxylic Acid, Chemical Bonding, Chemical Equilibrium, Electrochemistry, Fundamental Principles of Organic Chemistry, Gases, Hydrocarbons, Industrial Chemistry, Liquids, Macromolecules, Reaction Kinetics, s and p Block Elements, Solids, Thermochemistry, Transition Elements.
- Physics: Atomic Spectra, Current Electricity, Dawn of Modern Physics, Electromagnetic Induction, Electromagnetism, Electronics, Electrostatics, Force and Motion, Nuclear Physics, Rotational and Circular Motion, Thermodynamics, Waves, Work and Energy.

The parsed source contains 17 Biology + 20 Chemistry + 13 Physics chapter headings. Chapter names still need canonical aliases against the approved syllabus; do not mass-rename them.

## 5. Recommended next step

Use this file as the initial baseline, then parse the separate chapter-wise source files and compare them with the combined collection. The next report should identify:

1. which records already have correct subject/chapter labels;
2. which chapter names need a canonical alias only;
3. which questions are absent from the combined file but present in chapter-wise sources;
4. which are duplicated across files;
5. which have conflicting answer keys or missing options;
6. which paper occurrences must remain separately archived.

## 6. Change log

- No questions deleted.
- No question stems or options rewritten.
- No answer keys changed or inferred.
- No AI-generated questions added.
- No production database changes or bank ingestion performed.


## 7. Biology source-file reconciliation pilot

Two better-structured Biology files were separately parsed:

- `knowledge-base/questions/Biology/biology_mcquniverse.md`: 1,383 question records across 16 chapter headings.
- `knowledge-base/questions/Biology/biology_mcquniverse_acellular_life_58.md`: 58 question records under Acellular Life.

Across these two files: **1,441 records**, all 1,441 parsed with four labelled options, a valid A–D answer letter pointing to an existing option, and a non-empty explanation in the source format. A conservative exact comparison of normalized stem + order-independent full option set + correct-answer option text found **zero exact duplicate clusters within these two files**.

This is a much cleaner structured Biology source candidate than the combined 3,594-marker file's first-pass parse. However, it is not automatically the final published bank: academic answer accuracy, syllabus alignment, source rights/permission and cross-file duplicates against the PYQ collections remain to be reviewed.

### Comparison with combined Biology section

- Combined file: 1,439 Biology question markers and 1,423 unique normalized stems.
- Structured chapter files: 1,441 question records and 1,441 unique normalized stems.
- Stem-only comparison found 52 combined-file records with no same normalized stem in the two structured files, and 54 structured-file records with no same normalized stem in the combined file.

The two sources are therefore **not identical copies**. Do not replace one with the other or simply choose the larger count. Reconcile records individually, preserve source references, and inspect differences. Similar chapter headings also have naming/count differences (for example, “Plant Functions” vs “Plants”; “Coordination & Control” vs “Coordination And Control”). Use aliases for taxonomy rather than rewriting source headings.

### Rights/provenance gate

The structured files identify MCQUniverse as their source. Public availability or founder extraction does not by itself establish permission to republish. Preserve the files for audit, but verify ownership/licence/permission before moving those records into a public or commercial curated bank. Do not hide or rewrite the source label to imply original Apex-authored content.

### Next Biology actions

1. Compare all 1,441 structured records against the official PM&DC Biology syllabus and mark primary chapter/topic + confidence.
2. Reconcile the 52/54 stem differences with source context and option/key comparison.
3. Compare against Biology PYQ source files and paper archives; preserve each real paper occurrence and source key.
4. Review rights and answer-key accuracy before any public publication or ingestion.
5. Use the same parser/report method for Chemistry and Physics after the Biology taxonomy is approved.
