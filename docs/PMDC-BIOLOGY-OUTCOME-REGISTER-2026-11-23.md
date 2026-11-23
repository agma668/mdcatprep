# PM&DC MDCAT-2025 Biology — Outcome Register

**Blueprint:** PM&DC Uniform Curriculum MDCAT-2025, applied for MDCAT-2026 by PM&DC notice dated 19 May 2026.  
**Prepared:** 2026-11-23.  
**Status:** Outcome catalogue established; **zero question-to-outcome mappings have been independently verified yet**.  
**Official source:** https://pmdc.pk/Documents/Syllabus/Uniform%20Curriculum%20MDCAT-2025%20%20Final%20%2826-05-2025%29.pdf

This register uses stable local IDs `pmdc-bio-{unit}.{outcome}`. The short descriptions below are paraphrased for mapping work; consult the official PDF for exact wording and context. Do not assume this is the 2027 syllabus until PM&DC publishes the next cycle's document.

## 1. Current chapter-label proxy — not outcome coverage

The chapter counts below come from the current 16,294-row served bank after the malformed-option quarantine. They count questions under a chapter label only. They do not prove that any individual outcome is covered.

| PM&DC unit | Official unit (short label) | Biology rows under matching chapter label | Outcome IDs | Verified mapped questions |
|---|---|---:|---:|---:|
| 1 | Acellular life / viruses | 50 | 2 | 0 — unmapped |
| 2 | Bioenergetics | 217 | 1 | 0 — unmapped |
| 3 | Biological molecules | 627 | 10 | 0 — unmapped |
| 4 | Cell structure and function | 507 | 4 | 0 — unmapped |
| 5 | Coordination and control | 381 | 7 | 0 — unmapped |
| 6 | Enzymes | 70 | 4 | 0 — unmapped |
| 7 | Evolution | 54 | 3 | 0 — unmapped |
| 8 | Reproduction | 196 | 3 | 0 — unmapped |
| 9 | Support and movement | 170 | 7 | 0 — unmapped |
| 10 | Inheritance | 439 | 7 | 0 — unmapped |
| 11 | Circulation | 80 | 4 | 0 — unmapped |
| 12 | Immunity | 0 | 1 | 0 — unmapped |
| 13 | Respiration | 115 | 3 | 0 — unmapped |
| 14 | Digestion | 86 | 2 | 0 — unmapped |
| 15 | Homeostasis | 220 | 8 | 0 — unmapped |
| 16 | Biotechnology | 59 | 3 | 0 — unmapped |
| — | Ecology (not a named unit in PM&DC-2025 Biology) | 181 | — | Hold for review |

Additional unmapped Biology material:
- **3,921** rows are in the Biology Mixed Bank set.
- **1,130** rows are in other Biology sets (past-paper-labelled sets, mock, Balochistan-labelled collection and worksheet).
- These may contain relevant syllabus concepts, but they need question-level classification and outcome mapping before counting toward PM&DC coverage.
- Unit 12 (Immunity) has zero dedicated chapter-labeled rows; related questions may still exist inside mixed banks or sets and must be checked.

## 2. Mapping rules

- A question is not mapped merely because its chapter label resembles a unit.
- Each question must be read and assigned one primary outcome ID; add a secondary outcome only where the question genuinely assesses more than one.
- Keep a mapping evidence note explaining the concept assessed. Do not infer mapping from a keyword alone.
- Every mapping starts as `pending_review`; a subject reviewer independently confirms the mapping and answer key before it becomes `verified`.
- Questions that are mixed, ambiguous, outside the syllabus or unclear-rights stay `unclassified` / `held`; they do not count toward official coverage.
- Preserve source key, source document/page and reuse-rights state. A source label such as “Past Paper 2023” is not proof of an official sitting.

Suggested sidecar fields:
`question_key`, `exam_id`, `variant_id`, `blueprint_version`, `outcome_id`, `mapping_state`, `mapping_evidence`, `reviewer_id`, `reviewed_at`, `source_document_id`, `source_page`, `rights_state`.

## 3. Outcome catalogue

All outcomes below currently have **0 verified mapped questions**. This is an honest baseline, not a claim that the question bank contains none of these concepts.

### Unit 1 — Acellular life

- `pmdc-bio-1.1`: classify viruses using structural features, genome type, host and disease associations.
- `pmdc-bio-1.2`: identify the causative virus and key transmission routes and symptoms associated with HIV/AIDS.

### Unit 2 — Bioenergetics

- `pmdc-bio-2.1`: compare how proteins and fats enter cellular respiration with the pathways used by glucose.

### Unit 3 — Biological molecules

- `pmdc-bio-3.1`: define and group the major biological molecule classes.
- `pmdc-bio-3.2`: explain why biological molecules matter to living systems.
- `pmdc-bio-3.3`: explain water properties relevant to biology, including polarity, solvent action, heat capacity, cohesion and ionization.
- `pmdc-bio-3.4`: distinguish major carbohydrate groups and representative examples.
- `pmdc-bio-3.5`: describe amino acids and levels/structure of proteins.
- `pmdc-bio-3.6`: describe triglycerides, phospholipids and related lipid chemistry.
- `pmdc-bio-3.7`: explain RNA structure and function.
- `pmdc-bio-3.8`: explain the composition and roles of glycolipids and glycoproteins.
- `pmdc-bio-3.9`: explain the accepted double-helix model of DNA.
- `pmdc-bio-3.10`: explain a gene as a DNA nucleotide sequence that specifies a polypeptide product.

### Unit 4 — Cell structure and function

- `pmdc-bio-4.1`: compare typical plant and animal cell structures.
- `pmdc-bio-4.2`: distinguish prokaryotic and eukaryotic cell organization.
- `pmdc-bio-4.3`: relate the structure of the nucleus, ER, Golgi apparatus and mitochondria to their functions.
- `pmdc-bio-4.4`: describe chromosome structure, chemical composition and role.

### Unit 5 — Coordination and control

- `pmdc-bio-5.1`: explain receptors as structures that convert stimuli into biological signals.
- `pmdc-bio-5.2`: identify the main structural parts of a neuron.
- `pmdc-bio-5.3`: define a nerve impulse.
- `pmdc-bio-5.4`: classify reflex actions.
- `pmdc-bio-5.5`: explain the role of each component in a reflex arc.
- `pmdc-bio-5.6`: identify major brain regions, including brain-stem components, midbrain, cerebellum and cerebrum.
- `pmdc-bio-5.7`: connect each major brain region with its principal functions.

### Unit 6 — Enzymes

- `pmdc-bio-6.1`: describe defining properties of enzymes.
- `pmdc-bio-6.2`: explain how enzyme action proceeds.
- `pmdc-bio-6.3`: explain how temperature, pH and concentration affect enzyme reaction rates.
- `pmdc-bio-6.4`: distinguish enzyme inhibition mechanisms.

### Unit 7 — Evolution

- `pmdc-bio-7.1`: explain the syllabus-level account of the origin of life and evolutionary ideas.
- `pmdc-bio-7.2`: describe Lamarck's inheritance-of-acquired-characteristics proposal as a historical theory.
- `pmdc-bio-7.3`: explain Darwinian natural selection.

### Unit 8 — Reproduction

- `pmdc-bio-8.1`: relate the main male and female reproductive structures to their functions and hormonal regulation.
- `pmdc-bio-8.2`: explain the menstrual cycle with emphasis on hormonal changes.
- `pmdc-bio-8.3`: identify common sexually transmitted infections, their causes and main symptoms in an age-appropriate, factual way.

### Unit 9 — Support and movement

- `pmdc-bio-9.1`: describe cartilage, muscle and bone.
- `pmdc-bio-9.2`: connect key properties of cartilage and bone with their functions.
- `pmdc-bio-9.3`: compare smooth, cardiac and skeletal muscle.
- `pmdc-bio-9.4`: explain skeletal-muscle ultrastructure.
- `pmdc-bio-9.5`: outline skeletal-muscle contraction.
- `pmdc-bio-9.6`: classify joints.
- `pmdc-bio-9.7`: define arthritis.

### Unit 10 — Inheritance

- `pmdc-bio-10.1`: connect inheritance patterns with Mendel's laws.
- `pmdc-bio-10.2`: explain independent assortment using a suitable genetic example.
- `pmdc-bio-10.3`: define linkage and crossing over.
- `pmdc-bio-10.4`: explain how linkage and crossing over affect expected inheritance patterns.
- `pmdc-bio-10.5`: explain sex linkage.
- `pmdc-bio-10.6`: describe inheritance of sex-linked traits.
- `pmdc-bio-10.7`: analyse the inheritance pattern of haemophilia.

### Unit 11 — Circulation

- `pmdc-bio-11.1`: describe the general structure of the human heart.
- `pmdc-bio-11.2`: explain the phases of the cardiac cycle.
- `pmdc-bio-11.3`: compare arteries, veins and capillaries by structure and function.
- `pmdc-bio-11.4`: describe lymphatic vessels, nodes and organs.

### Unit 12 — Immunity

- `pmdc-bio-12.1`: explain the role and importance of specific/adaptive defence mechanisms.

### Unit 13 — Respiration

- `pmdc-bio-13.1`: describe the functions of the main respiratory structures.
- `pmdc-bio-13.2`: explain gas exchange in the lungs.
- `pmdc-bio-13.3`: explain effects of smoking on the respiratory system factually.

### Unit 14 — Digestion

- `pmdc-bio-14.1`: identify the main parts of the human digestive tract.
- `pmdc-bio-14.2`: relate digestive organs, accessory structures and glands to their functions.

### Unit 15 — Homeostasis

- `pmdc-bio-15.1`: describe urinary organs and relate kidney structure to function.
- `pmdc-bio-15.2`: explain filtration, selective reabsorption and tubular secretion in kidney function.
- `pmdc-bio-15.3`: explain how kidney function contributes to excretion and osmoregulation.
- `pmdc-bio-15.4`: compare glomerular and peritubular capillary beds.
- `pmdc-bio-15.5`: identify causes and treatment approaches for kidney stones at syllabus level.
- `pmdc-bio-15.6`: outline causes of kidney failure.
- `pmdc-bio-15.7`: explain thermoregulation and why it is needed.
- `pmdc-bio-15.8`: identify major nitrogen-containing waste products excreted by organisms.

### Unit 16 — Biotechnology

- `pmdc-bio-16.1`: explain vaccine production as one health application of biotechnology.
- `pmdc-bio-16.2`: describe diagnostic uses of nucleic-acid probes and monoclonal antibodies.
- `pmdc-bio-16.3`: identify biotechnology-derived products used in disease treatment.

## 4. Next mapping batch

1. Start with chapter-labeled Biology rows in Unit 1–16 and map each question to the exact outcome it tests.
2. Review the Biology Mixed Bank (3,921 rows) in manageable batches; do not map all of it to a unit just because it is in Biology.
3. Review the 181 Ecology rows separately and exclude them from PM&DC-2025 coverage unless the official curriculum supports them.
4. Review the other Biology sets separately, verifying the actual paper/source before using a past-paper label.
5. Publish a per-outcome coverage report only after reviewer verification. Until then, all outcome counts remain zero verified.

## 5. Known evidence limits

The current question records have no per-question `topic`, `exam_id`, `variant_id`, `learning_outcome_id`, `blueprint_version`, source URL/document/page or rights fields. The legacy `lib/mdcat-topics.ts` taxonomy is not joined to the active question bank. The outcome IDs in this file are a register for future mapping, not a completed map.
