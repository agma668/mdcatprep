# HEC USAT-M — Corpus Analysis & Prediction (2026-27)

Source: full OCR corpus at `EDWEB KNOWLEDGE BASE\USAT-M-Prep-OCR\` (24 documents, 724 pages, ~943k chars).
This document is analysis only. No verbatim paper text may be published on the site; all new site content must be original synthesis. Counts on the site stay derived (`lib/stats.ts`).

---

## 1. The official pattern (ground truth — HEC's own Content Weightages PDF)

Two distinct exams exist and our platform must name them honestly:

**USAT-M (mainstream HEC USAT, Pre-Medical stream)** — Part I: **75 MCQs / 100 min**:

| Section | Items | Split |
|---|---|---|
| Verbal Reasoning | 20 | Analogy 5 · Synonym/Antonym 4 · Sentence Completion 6 · Comprehension 5 |
| Quantitative Reasoning | 25 | Arithmetic 6 · Algebra & functions 4 · Geometry 3 · Equations 3 · Statistics 3 · Scenario/Mental Math 6 |
| Physics | 8 | — |
| Chemistry | 8 | — |
| Biology | 14 | — |
| Part II (40 min) | 2 essays | Argument (15) + Narrative (10), English or Urdu |

**Balochistan / ex-FATA Undergraduate Scholarship Test (Batch variant)** — **100 MCQs / 100 min**: Verbal 26 · Quantitative 32 · Physics 11 · Chemistry 11 · Biology 20. Passing mark: **50%**. Scholarship merit = HEC test 50% + FSc 30% + Matric 20%; MBBS/BDS placement is open merit on MDCAT 50% + FSc 30% + Matric 20%.

**Strategy intel from the corpus (Dawar guidance doc, matches paper structure):** science sections (42 of 100) are the *easiest*; English (26) moderate; Maths (32) hardest and most time-consuming. This drives both our practice-mode design and our notes ordering.

## 2. Observed past-paper patterns (2018–2024 papers in corpus)

**Verbal (stable across papers):**
- Sentence completion: single-blank + **phrasal verbs** (wind up, break down, look forward to, look down upon) + **prepositions** (different *from*, over the moon) + verb-form traps (used to + -ing).
- Analogies: part↔whole (ANKLE:FOOT), intensity (RAIN:DRIZZLE), worker↔tool (FINGER:GUITAR), symbol↔meaning, category↔member (OCEAN:WEEDS), language pairs (SINGULAR:PLURAL, SUMMARY:PRECIS).
- Synonym/antonym asked **in context** (a sentence with the capitalized word), not bare word lists.
- Comprehension: one ~400-word modern-topic passage (2023: women's football coverage) with inference + vocabulary-in-context items.

**Quantitative (32 items in FATA variant; subtopic spread):** profit/loss & discount (recurring), simple interest, relative speed & average speed, age problems, work/pipes, ratio→percentage, BODMAS nested brackets, surds & rational vs irrational numbers, function evaluation, sum/product of roots, log properties, conic identification (x²+y²=1), exterior angle sums, complementary/supplementary, clock angles, mean/median/range, permutations of digits, pyramid-volume ratios from base ratios, face value vs place value.

**Physics (8–11 items):** dimensions (LT⁻²), vectors (null resultant), work max at 0°, uniform velocity definition, rectification, effects of current ("which is NOT"), Doppler (satellite tracking), photoelectric vs Compton vs pair production (X-ray production), geothermal energy, induced-current factors (EXCEPT format), impedance = resistance + reactance. Clearly **first-year FSc physics**, conceptual over numerical.

**Chemistry (8–11 items):** indicators (methyl orange in base → yellow), hybridization, geometry of complexes ([Pt(NH₃)₄]²⁺ square planar), systematic vs random error, alkane halogenation conditions (diffused sunlight), proton discovery (Goldstein), gaseous state, endothermic examples, ionization-energy trends, Kc applications, Aufbau/Hund/Pauli. First-year FSc chemistry, definition-heavy.

**Biology (14–20 items — the largest science section):** biotech (pBR322 plasmid), ecology (abiotic factors), plant hormones (IAA → auxin), biomolecules (sucrose = glucose+fructose), retroviruses (RNA), digestion (duodenum receives pancreatic juice), fungal cell wall (chitin), veins (semilunar valves), DNA X-ray (2 nm helix), embryology terms, double fertilization (angiosperms), earthworm hydrostatic skeleton, photolysis at PSII not PSI, incomplete dominance (pink F1), parathyroid & Ca²⁺, K⁺ in stomata, centrioles & microtubules, non-competitive inhibitors (allosteric site), Brassica mesophyte, cleavage → morula. Spans the whole FSc syllabus with **cell processes + genetics + human systems** dominating.

**Vocabulary banks (NK Academy 2025):** deliberately easy-to-moderate A–Z pairs (optimistic/pessimistic, ancient/modern) — matches the exam's English level, which tests *recognition in context*, not exotic GRE words.

## 3. Prediction for the 2026-27 cycle (reasoning)
1. **Structure will not change.** The weightage PDF covers all six USAT streams with identical Verbal/Quant splits; papers 2022–2024 follow it exactly. Expect 75/100 MCQs with the same section splits, + essays for mainstream USAT.
2. **Question *faces* rotate, *categories* don't.** Every past paper recycles the same ~30 quantitative categories and the same FSc science chapters with fresh numbers/wording. Highest-yield quant: percentage-profit, simple interest, speed, ages, work-pipes, statistics trio (mean/median/range), BODMAS. Highest-yield bio: photosynthesis, enzymes, genetics, human digestion/circulation/excretion, biotech tools.
3. **English stays in-context.** Analogy types and phrasal-verb/preposition completion will reappear; comprehension passages will be modern/current-affairs flavoured. Prep should drill *categories of relationships*, not word memorization alone.
4. **FATA/Balochistan sitting = 100-MCQ variant** with heavier Biology (20) — our derived per-subject bank mix should therefore over-weight Biology, then Quant, then Verbal, matching 14:25:20 → scaled.
5. **Timing strategy is a real differentiator** (science first, English, maths last) — worth building into practice UX copy and notes.

## 3b. Oct 2025 drop — the NK Academy packs (analogy, antonyms, synonyms, parts of speech, sentence completion)

Processed 17 Oct 2026. Five distinct teaching packs, all fingerprinted to the same exam family.

- **Analogy pack** teaches by the SAME ladder this repo derived independently (part:whole crumb:bread; container album:photographs; material:craftsman iron:blacksmith; covering fish:scales; organ:function nose:smell; assemblage collage:images; creator:creation sketch:artist; tool:action knife:cut; category:example fish:trout; whole:part rifle:gun; part:part gill:fin) and — key for item design — explains **every option, not just the answer**. Our Batch-4 analogy items are built to that standard: every distractor is named by the family it *does* belong to.
- **Antonym pack** drills A–Z easy-to-moderate pairs; its question shape is almost always **three synonym-style options + one true opposite** — the trap we now reproduce deliberately in v-044…v-048.
- **Synonym pack** teaches the same easy pairs plus harder variants (ephemeral/transient, abstruse/obscure, cacophony/discord, ennui/boredom) — confirming the exam's vocabulary ceiling sits *below* GRE level, in the band those words occupy.
- **Parts-of-speech pack** is a full noun-classification syllabus (proper/common/collective/abstract/concrete/countable) — the source of our Batch-4 grammar items (quickly = adverb, liberty = abstract, herd = collective, Everest = proper, team plays = collective-as-one-unit).
- **Sentence-completion pack** runs single-blank consequence-logic items (scandal → damaged; sales rose → effective); our v-049…v-054 mirror its cause-pole structure with original sentences.
- **Image-only PDFs excluded from teaching** (Model QCA Key, HEC PAST PAPER 2019 with Answer Keys, HEC Past Papers, MedExel Chemistry Shortlisting, HEC Test 2024 Dawar-1, HEC test 2022 2023): pdftotext yields only headers — the layers are scans without extractable text in this drop's copies. Not analysed; can be OCR'd later if needed.

**Prediction update:** the verbal section's relationship families and trap architecture are now triangulated from a SECOND independent source — confidence in the ladder, in three-synonym antonym sets, and in consequence-logic completion is higher than one corpus alone can give.

## 4. Production plan (what we build, in order)

**Questions (lib/usat-comprehensive-bank.ts):** grow to a target of ~120 items with the official ratio ≈ Verbal 27% · Quant 33% · Physics 11% · Chemistry 11% · Biology 18% (Biology over-weighted for the FATA variant). Every item original, tagged with the subtopic above, difficulty easy/medium/hard.

**Flashcards (lib/flashcards/flashcards-data.ts):** new `USAT-M` deck(s) — formulas (SI, averages, angle sums, roots of quadratics, clock-angle, pipes), verbal relationship categories, science rapid-facts (net ATP 2, photolysis at PSII, chitin, K⁺ stomata, LT⁻², impedance). IDs `usat-m-NN` (stable, never index-derived).

**Notes:** blueprint per section —
- Verbal: analogy-relationship taxonomy (7 types), phrasal-verb list, preposition traps, comprehension method.
- Quant: one worked example per category above, in exam order (easy→hard).
- Science: chapter-by-chapter rapid notes strictly following FSc + the observed question list.
(Notes pages themselves are the next build step — this doc is the blueprint.)

**Honesty guardrails:** no paper text on site; weightage numbers quoted only from HEC's own published PDF (already public); no invented seat numbers — the 333-seat/166-FATA figures circulating in WhatsApp guidance docs are **not** HEC-official as far as our corpus shows, and must not be printed on the site.
