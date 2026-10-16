/**
 * USAT-M PUBLIC NOTES SEAM — mirrors lib/public-notes.ts.
 *
 * Easy-language notes for the HEC USAT-M (Pre-Medical) admission test,
 * written from the official HEC Content-Weightages structure and the
 * recurring categories in past papers. Same NoteBlock/NoteSection shape as
 * the MDCAT notes so the existing /notes renderer works unchanged.
 *
 * Honesty rules: no exam years are claimed for future papers; the weight
 * numbers are HEC's own published split for USAT-M (75 MCQs / 100 min) and
 * the Balochistan/ex-FATA scholarship variant (100 MCQs), restated here as
 * facts about the published structure — never predictions of paper content.
 * All prose is original.
 */

import type { NoteSection } from './mcat-notes';

export type { NoteSection } from './mcat-notes';

export const USAT_M_NOTES_PREAMBLE: string =
  'Easy-language notes for the HEC USAT-M (Pre-Medical) test — written to the official HEC weightage structure (75 MCQs: Verbal 20 · Quantitative 25 · Physics 8 · Chemistry 8 · Biology 14; the Balochistan/ex-FATA scholarship variant runs 100 MCQs with Verbal 26 · Quantitative 32 · Physics 11 · Chemistry 11 · Biology 20). Read an explanation, then drill the matching bank questions.';

export const USAT_M_NOTES_SECTIONS: NoteSection[] = [
  {
    title: '1. Verbal Reasoning (20 MCQs — or 26 on the 100-question variant)',
    topics: [
      {
        title: 'Analogies — find the relationship first',
        blocks: [
          { type: 'para', text: 'An analogy question gives one word pair and asks which option repeats the SAME relationship. Never match topics — match the relationship.' },
          { type: 'bullet', text: 'Name the relationship in one sentence before looking at options: chisel→sculptor is "tool used by its worker"; famine→food is "severe shortage of".' },
          { type: 'bullet', text: 'Common relationship families: tool:user (saw:carpenter), part:whole (elbow:arm), cause:sign (smoke:fire, symptom:disease), shortage (famine:food, drought:rain), degree (run:jog), worker:workplace (chef:kitchen).' },
          { type: 'bullet', text: 'Distractors reuse the same topic with a DIFFERENT relationship: for CHISEL:SCULPTOR, "wood : furniture" is tempting because both words belong to carving — but it is material:product, not tool:user.' },
          { type: 'bullet', text: 'Keep word order: if the stem is A:B, the answer must be X:Y in the same direction. An option that reverses the roles is wrong even when every word fits.' },
          { type: 'para', text: 'Think like this: cover the options, say the relationship aloud ("a chisel is the tool a sculptor uses"), then scan options for the tool that a worker uses.' },
        ],
      },
      {
        title: 'Synonyms & antonyms — in context',
        blocks: [
          { type: 'para', text: 'USAT rarely asks for a bare definition: the word sits in a sentence, and the context decides which sense is tested. SUBSIST in "the tribe subsisted on roots" means survived, not existed formally.' },
          { type: 'bullet', text: 'First replace the capitalised word with each option mentally — the sentence must keep the same meaning (synonym) or flip it (antonym).' },
          { type: 'bullet', text: 'Watch for the second-commonest sense: stringent usually means strict, but in banking it can mean rigidly required — the sentence picks the sense.' },
          { type: 'bullet', text: 'For antonyms, eliminate synonyms first; then eliminate words merely unrelated to the stem. The right antonym contrasts directly: stringent ↔ lenient.' },
          { type: 'para', text: 'Think like this: context, not the dictionary, chooses the answer — one sentence can make "prudent" mean cautious for doctors and stingy for shoppers.' },
        ],
      },
      {
        title: 'Sentence completion — grammar beats vocabulary',
        blocks: [
          { type: 'para', text: 'Most completion items test fixed grammar patterns, not rare words. Learn the pattern, and the blank fills itself.' },
          { type: 'bullet', text: 'Preposition collocations: allergic TO, different FROM, satisfied WITH, arrive AT, consist OF, capable OF, married TO.' },
          { type: 'bullet', text: 'Tense anchors: "by the time + past" → past perfect before it (had given). "As soon as + present" → present simple. "Would have escaped if" → past perfect in the if-clause.' },
          { type: 'bullet', text: 'Phrasal verbs by meaning: break down = fail/collapse (talks, machines); break out = erupt; break up = end a relationship; look forward to + -ing.' },
          { type: 'bullet', text: 'Correlative pairs: neither…nor, either…or, not only…but also — the second word is fixed once the first appears.' },
          { type: 'para', text: 'Think like this: underline the words AROUND the blank — "allergic ___ penicillin" can only end in "to", whatever the vocabulary level.' },
        ],
      },
      {
        title: 'Comprehension — answers live in the passage',
        blocks: [
          { type: 'para', text: 'A short passage, then 4–6 questions. Every correct answer is supported by stated text; every trap is merely plausible.' },
          { type: 'bullet', text: 'Read the questions BEFORE the passage so you know what to hunt for — names, numbers, causes, comparisons.' },
          { type: 'bullet', text: 'For "according to the passage", the answer must be written or directly restated. If an option needs outside knowledge, it is a trap.' },
          { type: 'bullet', text: 'For "can be inferred", the answer must follow necessarily from the text — protecting sleep follows from "consolidation happens in deep sleep"; "study in the morning" does not.' },
          { type: 'bullet', text: 'Vocabulary-in-context items: replace the word with each option inside the sentence from the passage, not from the dictionary.' },
          { type: 'para', text: 'Think like this: the passage is the only witness. If the passage did not say it, it did not happen — however sensible the option sounds.' },
        ],
      },
    ],
  },
  {
    title: '2. Quantitative Reasoning (25 MCQs — or 32 on the 100-question variant)',
    topics: [
      {
        title: 'Arithmetic (6 MCQs): percentages, profit/loss, simple interest, speed, ages',
        blocks: [
          { type: 'bullet', text: 'Percentage base decides everything: "75% of a number is 510" → divide (510 ÷ 0.75 = 680). Multiplying instead is the classic direction trap.' },
          { type: 'bullet', text: 'Profit/loss: SP = CP × (1 ± p/100). Given SP and profit %, reverse with CP = SP ÷ (1 + p/100) — never subtract p% of SP; the percentage belongs to the cost.' },
          { type: 'bullet', text: 'Simple interest: SI = P × r × t / 100. Any three of P, SI, r, t give the fourth. No compounding unless the question says so.' },
          { type: 'bullet', text: 'Average speed = total distance ÷ total time, never the mean of the two speeds.' },
          { type: 'bullet', text: 'Age problems: write both equations in the SAME time frame — "six years ago" subtracts 6 from both people, not just one.' },
          { type: 'para', text: 'Think like this: every word problem is one formula plus one trap. Name the formula, name the trap, then compute.' },
        ],
      },
      {
        title: 'BODMAS and brackets (inside Arithmetic & Scenario)',
        blocks: [
          { type: 'bullet', text: 'Order: Brackets → (ranks) of → Division → Multiplication → Addition → Subtraction; innermost braces first, then square brackets.' },
          { type: 'bullet', text: 'Work an expression one layer at a time and write the intermediate result — mental jumping is where marks leak.' },
          { type: 'bullet', text: 'Division binds only to the term it follows: 36 ÷ [24 − 21] means the WHOLE bracket divides, so resolve the bracket fully before dividing.' },
          { type: 'para', text: 'Think like this: strip the expression like an onion — innermost braces, then brackets, then the outer operation. One layer per line.' },
        ],
      },
      {
        title: 'Algebra & functions (4 MCQs)',
        blocks: [
          { type: 'bullet', text: 'Linear equations: collect x-terms one side, numbers the other, keeping signs (5x − 3 = 2x + 12 → 3x = 15 → x = 5).' },
          { type: 'bullet', text: 'Quadratic roots: sum = −b/a, product = c/a; a quadratic with roots 1 and 2 is x² − (sum)x + (product) = x² − 3x + 2.' },
          { type: 'bullet', text: 'Function evaluation: substitute carefully, especially negatives — f(−2) for 2x² − 5x + 1 is 2(4) + 10 + 1 = 19; the −5(−2) double negative is the trap.' },
          { type: 'bullet', text: 'Sequence/next-term items: check differences first (3, 7, 12, 18 → +4, +5, +6), then ratios, then a second difference.' },
          { type: 'para', text: 'Think like this: signs are the whole game in algebra — write the minus, then ask what multiplying it does.' },
        ],
      },
      {
        title: 'Geometry (3 MCQs) and Equations (3 MCQs)',
        blocks: [
          { type: 'bullet', text: 'Polygon angles: exterior angles sum to 360° always; each interior angle of a regular n-gon = (n − 2) × 180° / n (hexagon → 120°).' },
          { type: 'bullet', text: 'Triangle inequality: sides x, y, z form a triangle only if every side is LESS than the sum of the other two (7, 5, 12 fails — 12 = 5 + 7).' },
          { type: 'bullet', text: 'Clock angles: |30h − 5.5m| degrees, take the smaller result (9:00 → 90°).' },
          { type: 'bullet', text: 'Standard geometry facts recycled every cycle: sum of triangle angles 180°, exterior-angle sum 360°, Pythagoras triples 3-4-5 / 5-12-13 / 8-15-17.' },
          { type: 'bullet', text: 'Equations topics: linear solve (above), simultaneous pairs (add/subtract to cancel one variable), simple quadratics by factoring or the sum/product shortcut.' },
          { type: 'para', text: 'Think like this: geometry on USAT is fact-recall, not construction — know the angle-sum family cold and the clock/polygon formulas do the rest.' },
        ],
      },
      {
        title: 'Statistics (3 MCQs): mean, median, mode, range',
        blocks: [
          { type: 'bullet', text: 'Median: SORT FIRST. An unsorted middle value is the single commonest trap (7, 3, 9, 4, 11, 5, 8 → median 7, not 11).' },
          { type: 'bullet', text: 'Even count → median is the mean of the two middle values (can be a .5).' },
          { type: 'bullet', text: 'Mode: the most frequent value — there can be more than one; "1, 3" as a pair is a valid answer in some keys.' },
          { type: 'bullet', text: 'Range = max − min, including negatives: for 2, 7, 9, 13, −3, 8 the range is 13 − (−3) = 16.' },
          { type: 'bullet', text: 'Corrected-mean items: mean × n = old sum; fix the entry, recompute, divide again (45 entered as 24 → add 21 to the sum).' },
          { type: 'para', text: 'Think like this: statistics questions are one-step each — the trap is always procedure (unsorted data, wrong base), never arithmetic.' },
        ],
      },
      {
        title: 'Scenario / mental maths (6 MCQs): pipes, work, sharing, mixtures',
        blocks: [
          { type: 'bullet', text: 'Two pipes filling in a and b minutes together take ab/(a + b) minutes (12 & 24 → 8). Together is always FASTER than either alone — reject any option slower.' },
          { type: 'bullet', text: 'An emptying pipe adds a negative rate: A fills 1/10, B empties 1/30 → net 1/15 tank per minute.' },
          { type: 'bullet', text: 'Sharing/money-passing items: track each person with a running equation — "A gives B Rs 60, B gives C Rs 90, all equal" → solve for the starting gap.' },
          { type: 'bullet', text: 'Food-last-days items: food × people × days is constant — more people, fewer days (50 people × 5 days; after 2 days, 15 join → remaining food 50×3 = 150 person-days ÷ 65 people).' },
          { type: 'para', text: 'Think like this: convert every scenario to rates or to a constant product, and the story melts into arithmetic.' },
        ],
      },
    ],
  },
  {
    title: '3. Physics (8 MCQs — or 11)',
    topics: [
      {
        title: 'Measurements, vectors and mechanics',
        blocks: [
          { type: 'bullet', text: 'Base SI units (recall all seven): metre, kilogram, second, ampere, kelvin, mole, candela. Force, pressure, work, energy are derived.' },
          { type: 'bullet', text: 'Equal magnitude + opposite direction → resultant is the null vector. Equal magnitude + same direction → equal vectors.' },
          { type: 'bullet', text: 'W = Fd cos θ: maximum at 0°, zero at 90°. Work, energy share the joule; power is the watt.' },
          { type: 'bullet', text: 'First law of thermodynamics = conservation of energy (ΔU = Q − W). Mass-energy link: E = mc².' },
          { type: 'bullet', text: 'Dimensions worth memorising: acceleration LT⁻², force MLT⁻², momentum MLT⁻¹; Planck\u2019s constant shares dimensions with angular momentum.' },
          { type: 'para', text: 'Think like this: half the physics section is definition-matching — the options are all real terms, and only the pairings change.' },
        ],
      },
      {
        title: 'Waves, light, electricity, modern physics',
        blocks: [
          { type: 'bullet', text: 'Sound transfers energy, not matter; it is longitudinal. Water and rope waves are transverse on the surface.' },
          { type: 'bullet', text: 'Mirror image = regular reflection. Refraction bends light entering a denser medium TOWARDS the normal (it slows).' },
          { type: 'bullet', text: 'Identical resistors in parallel: R = R₀/n (three 6 Ω → 2 Ω). Parallel is always below the smallest member.' },
          { type: 'bullet', text: 'Logic gates: AND = all inputs 1; OR = any input 1; NAND/NOR negate those outputs.' },
          { type: 'bullet', text: 'Photoelectric effect: electron KE depends on frequency (E = hf), intensity sets the COUNT of electrons — Einstein\u2019s photon model explains it.' },
          { type: 'bullet', text: 'X-ray production, Doppler tracking and pair production are named effects — know which phenomenon each label belongs to.' },
          { type: 'para', text: 'Think like this: the physics distractors are sibling concepts (work vs power, reflection vs refraction, series vs parallel). Attach each term to its one-line definition and the pairs separate.' },
        ],
      },
    ],
  },
  {
    title: '4. Chemistry (8 MCQs — or 11)',
    topics: [
      {
        title: 'Mole concept, gas laws, periodic trends',
        blocks: [
          { type: 'bullet', text: 'Molar mass first, always: CaCO₃ = 40 + 12 + 48 = 100 g/mol → 100 g is exactly 1 mol = 6.02 × 10²³ particles.' },
          { type: 'bullet', text: 'Atomic size increases DOWN a group (new shells) and decreases ACROSS a period (rising nuclear charge pulls the shell in).' },
          { type: 'bullet', text: 'Gas laws by job: Boyle = pressure↔volume, Charles = volume↔temperature, Avogadro = moles↔volume, Graham = diffusion rate ∝ 1/√molar mass.' },
          { type: 'bullet', text: 'Ionisation energy falls down a group as atomic size rises — the outer electron is further out and better shielded.' },
          { type: 'para', text: 'Think like this: compute nothing until the molar mass or the law name is written down — most chemistry slips are skipped-setup slips.' },
        ],
      },
      {
        title: 'Bonding, solutions, acids-bases, organic separation',
        blocks: [
          { type: 'bullet', text: 'Hybridisation by count of sigma directions: 2 → sp (ethyne), 3 → sp² (ethene), 4 → sp³ (ethane, methane).' },
          { type: 'bullet', text: 'Colligative properties depend on particle COUNT: any non-volatile solute lowers vapour pressure below that of the pure solvent; ionic solutes lower it most per mole.' },
          { type: 'bullet', text: 'Indicators: methyl orange — red acid / orange endpoint / yellow base. Litmus: red acid / blue base. Do not cross the two families.' },
          { type: 'bullet', text: 'Fungi wall = chitin; plant wall = cellulose; bacteria = peptidoglycan — a biology crossover question appears in chemistry sets too.' },
          { type: 'bullet', text: 'Separation techniques by property: chromatography = differing adsorption/speed (ink dyes), crystallisation = solubility, sublimation = volatility of solids, filtration = insolubility.' },
          { type: 'para', text: 'Think like this: each technique or indicator is paired with exactly one job — match the job (separate dyes? dry crystals?) to the tool, and options like filtration fall away.' },
        ],
      },
    ],
  },
  {
    title: '5. Biology (14 MCQs — the largest section; 20 on the 100-question variant)',
    topics: [
      {
        title: 'Cell biology and enzymes',
        blocks: [
          { type: 'bullet', text: 'Enzyme inhibition: competitive = mimics substrate AT the active site; non-competitive = binds the allosteric site and distorts the active site.' },
          { type: 'bullet', text: 'Holoenzyme = enzyme protein (apoenzyme) + cofactor. Coenzymes are organic (vitamin-derived); metal-ion cofactors are inorganic.' },
          { type: 'bullet', text: 'Mitosis: spindle microtubules originate from centrioles (animal cells); metaphase aligns, anaphase separates sister chromatids.' },
          { type: 'bullet', text: 'Lysosome = single membrane, digestive enzymes ("suicide bag"). Mitochondrion = double membrane, own circular DNA, ATP production.' },
          { type: 'bullet', text: 'Human RBCs are enucleated; frog (amphibian) RBCs keep a nucleus — a recurring comparison question.' },
          { type: 'para', text: 'Think like this: organelle questions pair a structure with ONE function — powerhouse, protein factory, recycling centre, packaging depot. Learn the nickname list.' },
        ],
      },
      {
        title: 'Photosynthesis, respiration, plant physiology',
        blocks: [
          { type: 'bullet', text: 'Photolysis of water happens at Photosystem II (P680 has the energy to split water); PSI re-energises electrons — that energy difference is the reason, not membrane shape.' },
          { type: 'bullet', text: 'Light reactions\u2019 final electron acceptor is NADP⁺ (→ NADPH). Oxygen is a by-product, not an acceptor; glucose belongs to the Calvin cycle.' },
          { type: 'bullet', text: 'Glycolysis: net 2 ATP per glucose (4 made, 2 invested); occurs in the cytoplasm, oxygen-free.' },
          { type: 'bullet', text: 'Stomata open/close by K⁺ pumping in and out of guard cells (turgid = open).' },
          { type: 'bullet', text: 'Guttation = water loss through hydathodes (liquid); transpiration = vapour through stomata. Excretory proteins are made on the rough ER.' },
          { type: 'para', text: 'Think like this: plant questions love the "which is involved in X" format — anchor each process (photolysis, stomatal movement, guttation) to its one specific agent.' },
        ],
      },
      {
        title: 'Genetics, reproduction, ecology',
        blocks: [
          { type: 'bullet', text: 'Test cross: unknown tall plant × homozygous recessive — any short offspring proves heterozygous. Do not cross with another tall plant.' },
          { type: 'bullet', text: 'Incomplete dominance: red × white → pink F1 (heterozygous intermediate). Co-dominance would show BOTH colours.' },
          { type: 'bullet', text: 'Embryology order: zygote → cleavage → morula (solid ball) → blastula (hollow) → gastrula (three layers) → neurula.' },
          { type: 'bullet', text: 'Skeletons: hydrostatic = fluid cavity (earthworm, cnidarians); exoskeleton = chitin shell (arthropods); endoskeleton = internal bone.' },
          { type: 'bullet', text: 'Ecology vocabulary: biotic = living (producers, consumers, decomposers); abiotic = non-living (temperature, water, topography). Microbes are biotic — a favourite EXCEPT-item.' },
          { type: 'bullet', text: 'Female oogenesis happens in the ovary; nephrons are the kidney\u2019s functional units; 12 pairs of cranial nerves leave the brain.' },
          { type: 'para', text: 'Think like this: name the category first (which kingdom, which stage, which skeleton) — biology options are almost always one per category, and the stem fixes the category.' },
        ],
      },
    ],
  },
];

export const USAT_M_NOTES_NOTE: string =
  'Structure stated here is the official published weightage. Question topics are the recurring categories across publicly shared past papers and prep corpora — no claim is made about any future paper\u2019s contents. Every practice question on this site is original, written to these patterns.';
