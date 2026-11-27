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
