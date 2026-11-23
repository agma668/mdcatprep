# PM&DC Topical Chapter Inventory — 2026-11-23

**Source baseline:** `main` at `e3b4d63065c69a60fb816939f4bbbd0ee2f1eb9f`  
**Audit branch:** `docs/medical-first-reconciliation-2026-11-23`  
**Student-visible bank on this branch:** 16,294 rows after the 253-row structural quarantine.

This is a chapter-label inventory, not question-level outcome mapping. Counts below are the number of currently served rows under each displayed chapter or set after the option-quality guard and navigation aliases.

## 1. Navigation inventory

The corrected topical hub contains **45 chapter pages and 22 practice/paper sets** (67 entries total). Three source-named collections that were previously presented as chapters are now sets: `FINAL JETS MDCAT MOCK`, `Balochistan · MDCAT · 2022` and `500 MOST POWERFUL MCQS FOR MDCAT 2026 with key.p`. The `Genetics` / `Inheritance` and `Work And Energy` / `Work and Energy` aliases are grouped into one page each.

| Category | Chapter-labeled rows | Set-labeled rows | Total |
|---|---:|---:|---:|
| Biology | 3,452 | 5,051 | 8,503 |
| Chemistry | 2,008 | 2,557 | 4,565 |
| Physics | 1,690 | 1,125 | 2,815 |
| English | 0 | 270 | 270 |
| Mathematics | 0 | 84 | 84 |
| Reasoning | 0 | 57 | 57 |
| **Total** | **7,150** | **9,144** | **16,294** |

The 9,144 set-labeled rows include mixed banks, past-paper-labelled collections, worksheets and mocks. They are not all full official papers. A year in a set title is not proof of an official exam sitting.

## 2. Biology — chapter-labeled rows

| Displayed chapter | Rows | PM&DC 2025 unit relationship |
|---|---:|---|
| Acellular Life | 50 | Unit 1 |
| Bioenergetics | 217 | Unit 2 |
| Biological Molecules | 627 | Unit 3 |
| Cell Biology | 507 | Unit 4 |
| Coordination and Control | 381 | Unit 5 |
| Enzymes | 70 | Unit 6 |
| Evolution | 54 | Unit 7 |
| Reproduction | 196 | Unit 8 |
| Support and Movement | 170 | Unit 9 |
| Inheritance (Genetics + Inheritance aliases) | 439 | Unit 10 |
| Body Fluids and Circulation | 80 | Unit 11 |
| Immunity | 0 | Unit 12 — no dedicated chapter-labeled rows |
| Respiration | 115 | Unit 13 |
| Digestion | 86 | Unit 14 |
| Homeostasis | 220 | Unit 15 |
| Biotechnology | 59 | Unit 16 |
| Ecology | 181 | Not one of the 16 PM&DC MDCAT-2025 Biology units |
| **Chapter-labeled total** | **3,452** | |

The 3,271 rows in the 16 named unit chapters are only a chapter-label proxy. They are **not** mapped to the 69 detailed learning outcomes. The 3,921 Biology Mixed Bank rows, 961 rows in past-paper-labelled sets, 47 Balochistan-labelled rows, 78 mock rows and 44 worksheet rows still require question-level classification and outcome mapping.

## 3. Chemistry — chapter-labeled rows

| Displayed chapter | Rows |
|---|---:|
| Acids, Bases and Salts | 167 |
| Alcohols and Phenols | 74 |
| Aldehydes and Ketones | 66 |
| Alkyl Halides | 60 |
| Atomic Structure | 250 |
| Basic Concepts | 237 |
| Chemical Bonding | 240 |
| Chemical Energetics | 84 |
| Chemical Equilibrium | 131 |
| Electrochemistry | 79 |
| Hydrocarbons | 61 |
| Liquids | 33 |
| Organic Chemistry | 289 |
| s and p Block Elements | 237 |
| **Chapter-labeled total** | **2,008** |

Chemistry also has 1,129 Mixed Bank rows, 1,380 rows in past-paper-labelled sets and 48 worksheet rows (2,557 sets total). Those rows are not outcome-mapped merely because they sit in a Chemistry bank.

## 4. Physics — chapter-labeled rows

| Displayed chapter | Rows |
|---|---:|
| Current Electricity | 88 |
| Dynamics | 107 |
| Electricity and Magnetism | 165 |
| Electromagnetic Induction | 115 |
| Fluid Dynamics | 83 |
| Force and Motion | 87 |
| Heat and Thermodynamics | 123 |
| Kinematics | 227 |
| Light and Optics | 37 |
| Measurements | 51 |
| Modern Physics | 67 |
| Oscillations and Waves | 129 |
| Rotational and Circular Motion | 93 |
| Waves | 90 |
| Work and Energy (case alias merged) | 228 |
| **Chapter-labeled total** | **1,690** |

Physics also has 856 Mixed Bank rows, 173 rows in the “500 Most Powerful MCQs” set and 96 worksheet rows (1,125 sets total).

## 5. English, Mathematics and Reasoning

| Category | Set | Rows | Chapter pages |
|---|---|---:|---:|
| English | Mixed Bank | 270 | 0 |
| Mathematics | Mixed Bank | 84 | 0 |
| Reasoning | Mixed Bank | 57 | 0 |

English and Logical Reasoning are PM&DC sections; Mathematics is additional practice, not a separate PM&DC MDCAT section. The absence of chapter pages is a navigation/mapping gap, not proof that the question topics are absent from the mixed banks.

## 6. Mapping and provenance limitations

The current served question records have no populated per-question `topic`, `exam_id`, `variant_id`, `learning_outcome_id`, `blueprint_version`, `source_url`, `source_document`, `source_page`, `license` or `licence` fields. The audit script now reports this metadata coverage.

`lib/mdcat-topics.ts` is a legacy display taxonomy with approximate subtopic labels for four subjects. It is not joined to the active topical question rows and does not cover Mathematics or Logical Reasoning. It must not be treated as evidence that individual questions are mapped to PM&DC outcomes.

The bank's generic `source` label is not a sufficient provenance record. It does not establish the original paper sitting, source page, ownership, licence or permission to republish. In particular, “Past Paper 2023” and similar names must remain source labels until verified against an official released paper.

## 7. Next mapping work

1. Add a stable mapping/provenance manifest: question key, exam ID, variant, syllabus version, one or more outcome IDs, source document/page, rights state, answer-review state and reviewer evidence.
2. Map the 3,271 Biology rows in the 16 named PM&DC unit chapters to exact learning outcomes; do not infer an outcome from the chapter alone.
3. Review the 181 Ecology rows separately; do not count them toward PM&DC 2025 coverage without official support.
4. Review the 3,921 Biology Mixed Bank rows and all paper/mock/worksheet sets in batches.
5. Build equivalent Chemistry, Physics, English and Logical Reasoning maps. Keep Mathematics as extra practice.
6. Map NUMS independently; no PM&DC-to-NUMS inference.
7. Keep unclassified, unclear-rights or academically unreviewed questions out of approved PM&DC/NUMS coverage claims.
