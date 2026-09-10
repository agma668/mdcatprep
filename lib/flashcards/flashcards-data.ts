// Flashcard decks for MDCAT revision — atomic question/answer pairs written
// from the same PMDC syllabus content that powers the master notes and the
// diagram/mindmap sections. Cards are static content shipped in code; only
// per-student review state lives in the database (flashcard_reviews).
//
// Card IDs are stable strings (never derived from array index) so review
// history survives reordering or additions.

export type Flashcard = {
  id: string
  front: string
  back: string
  hint?: string
}

export type FlashcardDeck = {
  id: string
  title: string
  subject: 'Biology' | 'Chemistry' | 'Physics' | 'English'
  icon: string
  description: string
  cards: Flashcard[]
}

export const FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'bio-cell',
    title: 'The Cell & Organelles',
    subject: 'Biology',
    icon: '🧬',
    description: 'Organelles, membranes, and the prokaryote/eukaryote split.',
    cards: [
      { id: 'bio-cell-01', front: 'Smallest structural and functional unit of life?', back: 'The cell.' },
      { id: 'bio-cell-02', front: 'Key difference between prokaryotic and eukaryotic cells?', back: 'Prokaryotes (bacteria) lack a true membrane-bound nucleus; eukaryotes have one.' },
      { id: 'bio-cell-03', front: 'Which organelle produces most ATP?', back: 'The mitochondrion — site of (aerobic) cellular respiration.', hint: 'The "powerhouse".' },
      { id: 'bio-cell-04', front: 'Site of photosynthesis in plant cells?', back: 'The chloroplast.' },
      { id: 'bio-cell-05', front: 'Site of protein synthesis?', back: 'Ribosomes (translation).' },
      { id: 'bio-cell-06', front: 'Which organelle modifies, packages and sorts proteins for secretion?', back: 'The Golgi apparatus.' },
      { id: 'bio-cell-07', front: 'Function of lysosomes?', back: 'Digestive enzymes break down waste, worn-out organelles and pathogens.' },
      { id: 'bio-cell-08', front: 'The fluid mosaic model describes…', back: 'The plasma membrane: a phospholipid bilayer with embedded proteins, selectively permeable.' },
      { id: 'bio-cell-09', front: 'Organelle that makes ribosomal subunits (in eukaryotes)?', back: 'The nucleolus (inside the nucleus).' },
      { id: 'bio-cell-10', front: 'Which structures organise the spindle during animal cell division?', back: 'Centrioles.' },
      { id: 'bio-cell-11', front: 'Which organelle detoxifies drugs and synthesises lipids?', back: 'Smooth endoplasmic reticulum (SER).' },
      { id: 'bio-cell-12', front: 'Rough ER is "rough" because of…', back: 'Ribosomes studded on its surface (it processes proteins).' },
    ],
  },
  {
    id: 'bio-molecules',
    title: 'Biological Molecules',
    subject: 'Biology',
    icon: '🧪',
    description: 'Carbohydrates, proteins, lipids, nucleic acids and enzymes.',
    cards: [
      { id: 'bio-mol-01', front: 'Monomer of carbohydrates?', back: 'Monosaccharides, e.g. glucose.' },
      { id: 'bio-mol-02', front: 'Bond joining two amino acids?', back: 'A peptide bond.' },
      { id: 'bio-mol-03', front: 'Bond joining nucleotides in DNA/RNA?', back: 'A phosphodiester bond.' },
      { id: 'bio-mol-04', front: 'Building blocks of lipids?', back: 'Glycerol + fatty acids.' },
      { id: 'bio-mol-05', front: 'Which biomolecule stores and transmits genetic information?', back: 'Nucleic acids (DNA and RNA).' },
      { id: 'bio-mol-06', front: 'What are enzymes?', back: 'Protein biological catalysts that lower activation energy; sensitive to temperature and pH.' },
      { id: 'bio-mol-07', front: 'Effect of increasing temperature well past the optimum on an enzyme?', back: 'Denaturation — the active site loses shape and activity drops permanently.' },
      { id: 'bio-mol-08', front: 'Which biomolecule forms cell membranes?', back: 'Phospholipids (a lipid).' },
      { id: 'bio-mol-09', front: 'Lock-and-key vs induced-fit: which allows active-site shape change?', back: 'Induced fit — the active site moulds around the substrate.' },
      { id: 'bio-mol-10', front: 'Competitive inhibitors compete with the substrate for…', back: 'The enzyme’s active site.' },
      { id: 'bio-mol-11', front: 'Test that confirms the presence of reducing sugars?', back: 'Benedict’s solution (turns brick-red when heated).' },
      { id: 'bio-mol-12', front: 'Biuret solution detects which biomolecule?', back: 'Protein (turns purple/violet).' },
    ],
  },
  {
    id: 'bio-physiology',
    title: 'Human Physiology',
    subject: 'Biology',
    icon: '🫀',
    description: 'Digestion, circulation, breathing, nerves, hormones, homeostasis.',
    cards: [
      { id: 'bio-phy-01', front: 'Enzyme in saliva and what it digests?', back: 'Salivary amylase — digests starch into maltose.' },
      { id: 'bio-phy-02', front: 'Which organ produces bile, and where is it stored?', back: 'Produced by the liver; stored in the gall bladder.' },
      { id: 'bio-phy-03', front: 'Which vessel carries oxygenated blood away from the heart?', back: 'The aorta.' },
      { id: 'bio-phy-04', front: 'Which vessels carry blood TOWARD the heart?', back: 'Veins (they have valves to stop backflow).' },
      { id: 'bio-phy-05', front: 'Where does gas exchange happen in the lungs?', back: 'The alveoli (single-cell-thick sacs wrapped in capillaries).' },
      { id: 'bio-phy-06', front: 'The pacemaker of the heart is the…', back: 'Sinoatrial (SA) node — sets the heartbeat rhythm.' },
      { id: 'bio-phy-07', front: 'Basic functional unit of the kidney?', back: 'The nephron — filters blood to form urine.' },
      { id: 'bio-phy-08', front: 'More ADH in the blood makes urine…', back: 'More concentrated (more water reabsorbed by the collecting duct).' },
      { id: 'bio-phy-09', front: 'Which part of the brain controls breathing and heart rate?', back: 'The medulla oblongata.' },
      { id: 'bio-phy-10', front: 'Balance and coordination are handled by the…', back: 'Cerebellum.' },
      { id: 'bio-phy-11', front: 'Chemical that crosses a synapse to carry the impulse?', back: 'A neurotransmitter (e.g. acetylcholine).' },
      { id: 'bio-phy-12', front: 'Insulin vs glucagon — which lowers blood glucose?', back: 'Insulin (from pancreatic β-cells); glucagon raises it.' },
      { id: 'bio-phy-13', front: 'Fight-or-flight hormone?', back: 'Adrenaline (from the adrenal medulla).' },
      { id: 'bio-phy-14', front: 'Body temperature in humans is regulated by the…', back: 'Hypothalamus (around 37 °C).' },
      { id: 'bio-phy-15', front: 'The "master gland" of the endocrine system?', back: 'The pituitary gland.' },
      { id: 'bio-phy-16', front: 'Sliding filament theory: which filaments slide over which?', back: 'Actin (thin) slides over myosin (thick).' },
    ],
  },
  {
    id: 'bio-genetics',
    title: 'Genetics & Reproduction',
    subject: 'Biology',
    icon: '🧫',
    description: 'Cell division, inheritance, DNA and the continuity of life.',
    cards: [
      { id: 'bio-gen-01', front: 'Diploid chromosome number in human somatic cells?', back: '46 (23 pairs).' },
      { id: 'bio-gen-02', front: 'Chromosome number in human gametes?', back: '23 (haploid).' },
      { id: 'bio-gen-03', front: 'Mitosis produces…', back: 'Two genetically identical diploid daughter cells (growth and repair).' },
      { id: 'bio-gen-04', front: 'Meiosis produces…', back: 'Four genetically different haploid gametes.' },
      { id: 'bio-gen-05', front: 'Define a gene.', back: 'A segment of DNA that codes for one trait — the unit of heredity.' },
      { id: 'bio-gen-06', front: 'Fertilisation produces a…', back: 'Zygote (fusion of sperm and egg).' },
      { id: 'bio-gen-07', front: 'Genotype with two identical alleles is called…', back: 'Homozygous (two different alleles = heterozygous).' },
      { id: 'bio-gen-08', front: 'Cross Aa × Aa — what fraction shows the recessive phenotype?', back: '1/4 (aa).', hint: 'Punnett square gives AA : Aa : Aa : aa.' },
      { id: 'bio-gen-09', front: 'Law of segregation says…', back: 'The two alleles of a gene separate during gamete formation; each gamete gets one.' },
      { id: 'bio-gen-10', front: 'Sex of a human child is determined by…', back: 'The father’s sperm — X gives a girl (XX), Y gives a boy (XY).' },
      { id: 'bio-gen-11', front: 'Where does DNA replication occur in the cell cycle?', back: 'S phase (of interphase, before mitosis).' },
      { id: 'bio-gen-12', front: 'DNA base pairing rules?', back: 'A–T and G–C (in RNA, A pairs with U).' },
    ],
  },
  {
    id: 'chem-foundation',
    title: 'Atomic Structure & Bonding',
    subject: 'Chemistry',
    icon: '⚗️',
    description: 'Atoms, isotopes, periodic basics, and every bond type.',
    cards: [
      { id: 'chem-atom-01', front: 'What defines an element’s identity?', back: 'Its atomic number (number of protons).' },
      { id: 'chem-atom-02', front: 'Mass number equals…', back: 'Protons + neutrons.' },
      { id: 'chem-atom-03', front: 'Isotopes differ in the number of…', back: 'Neutrons (same protons).' },
      { id: 'chem-atom-04', front: 'Electron shell capacities in order?', back: '2, 8, 18, 32.' },
      { id: 'chem-atom-05', front: 'Which particles sit in the nucleus?', back: 'Protons (+) and neutrons (0); electrons (−) orbit in shells.' },
      { id: 'chem-bond-01', front: 'Metal + non-metal usually forms which bond?', back: 'Ionic — electrons are transferred; strong attraction between oppositely charged ions (e.g. NaCl).' },
      { id: 'chem-bond-02', front: 'Non-metal + non-metal usually forms which bond?', back: 'Covalent — electron pairs are shared (e.g. H₂O, CO₂).' },
      { id: 'chem-bond-03', front: 'What holds metallic structures together?', back: 'Delocalised electrons around metal cations (metallic bond).' },
      { id: 'chem-bond-04', front: 'Why does water have an unusually high boiling point?', back: 'Hydrogen bonding between molecules (H bonded to electronegative O).' },
      { id: 'chem-bond-05', front: 'A dative (co-ordinate) bond is one where…', back: 'Both shared electrons come from the same atom, e.g. NH₄⁺.' },
      { id: 'chem-bond-06', front: 'Which bond type conducts electricity when molten or dissolved?', back: 'Ionic compounds (ions become mobile).' },
      { id: 'chem-bond-07', front: 'Why are metals good conductors?', back: 'Delocalised electrons carry charge through the lattice.' },
    ],
  },
  {
    id: 'chem-reactions',
    title: 'Energetics, Equilibrium & Organic',
    subject: 'Chemistry',
    icon: '🔥',
    description: 'Energy changes, rates, acids/bases, electrochemistry, hydrocarbons.',
    cards: [
      { id: 'chem-rx-01', front: 'Exothermic vs endothermic — sign of ΔH?', back: 'Exothermic: ΔH negative (heat released); endothermic: ΔH positive (heat absorbed).' },
      { id: 'chem-rx-02', front: 'What does a catalyst do?', back: 'Lowers activation energy and speeds up the reaction without being consumed.' },
      { id: 'chem-rx-03', front: 'State Le Chatelier’s principle.', back: 'A system at equilibrium responds to a stress (concentration, pressure, temperature) so as to reduce it.' },
      { id: 'chem-rx-04', front: 'At dynamic equilibrium…', back: 'Forward and reverse rates are equal; concentrations stay constant.' },
      { id: 'chem-rx-05', front: 'pH of an acidic / neutral / basic solution?', back: 'Below 7 acidic, exactly 7 neutral, above 7 basic.' },
      { id: 'chem-rx-06', front: 'Brønsted–Lowry: acid vs base?', back: 'Acid donates H⁺; base accepts H⁺.' },
      { id: 'chem-rx-07', front: 'Strong acid example and why "strong"?', back: 'HCl — it ionises almost completely in water.' },
      { id: 'chem-rx-08', front: 'At which electrode does oxidation happen?', back: 'The anode (reduction at the cathode).' },
      { id: 'chem-rx-09', front: 'General formula of alkanes and of alkenes?', back: 'Alkanes: CnH2n+2 (saturated); alkenes: CnH2n (unsaturated, C=C).' },
      { id: 'chem-rx-10', front: 'Functional group of alcohols / carboxylic acids?', back: 'Alcohols: –OH; carboxylic acids: –COOH.' },
      { id: 'chem-rx-11', front: 'What is cracking?', back: 'Breaking large hydrocarbons into smaller, more useful ones (petrol, alkenes).' },
      { id: 'chem-rx-12', front: 'Which gas turns limewater milky?', back: 'Carbon dioxide (CO₂).' },
      { id: 'chem-rx-13', front: 'In electrolysis, the electric current drives…', back: 'A non-spontaneous reaction.' },
      { id: 'chem-rx-14', front: 'Which reaction is used to harden vegetable oil into margarine?', back: 'Hydrogenation — adding H₂ across C=C double bonds (Ni catalyst).' },
    ],
  },
  {
    id: 'physics-motion',
    title: 'Motion, Forces & Energy',
    subject: 'Physics',
    icon: '⚛️',
    description: 'Kinematics, Newton’s laws, work-energy-power, momentum.',
    cards: [
      { id: 'phy-mot-01', front: 'Speed vs velocity?', back: 'Speed: distance ÷ time (scalar). Velocity: displacement ÷ time (vector).' },
      { id: 'phy-mot-02', front: 'Value and units of g near Earth’s surface?', back: '≈ 9.8 m/s² (acceleration due to gravity).' },
      { id: 'phy-mot-03', front: 'State Newton’s second law in symbols.', back: 'F = ma — force equals mass times acceleration.' },
      { id: 'phy-mot-04', front: 'Newton’s first law is the law of…', back: 'Inertia: no net force → no change in motion.' },
      { id: 'phy-mot-05', front: 'Newton’s third law pair example?', back: 'Rocket pushes gas down; gas pushes rocket up — equal and opposite.' },
      { id: 'phy-mot-06', front: 'Momentum formula, units, and conservation condition?', back: 'p = mv (kg·m/s); conserved when no external force acts.' },
      { id: 'phy-mot-07', front: 'Work done — formula and units?', back: 'W = F·d·cosθ, joules (J).' },
      { id: 'phy-mot-08', front: 'Kinetic and gravitational potential energy formulas?', back: 'KE = ½mv²; GPE = mgh.' },
      { id: 'phy-mot-09', front: 'Power — formula and units?', back: 'P = work ÷ time, watts (W).' },
      { id: 'phy-mot-10', front: 'State the law of conservation of energy.', back: 'Energy cannot be created or destroyed — only transformed from one form to another.' },
      { id: 'phy-mot-11', front: 'Which force always opposes motion between surfaces?', back: 'Friction.' },
      { id: 'phy-mot-12', front: 'A ball thrown up momentarily has acceleration equal to…', back: 'g downward (≈ 9.8 m/s²) — even at the top where v = 0.' },
    ],
  },
  {
    id: 'physics-waves-electricity',
    title: 'Waves, Light & Electricity',
    subject: 'Physics',
    icon: '💡',
    description: 'Wave behaviour, optics, Ohm’s law, magnetism, modern physics.',
    cards: [
      { id: 'phy-wv-01', front: 'Wave equation?', back: 'v = fλ (speed = frequency × wavelength).' },
      { id: 'phy-wv-02', front: 'Sound is what kind of wave?', back: 'Longitudinal mechanical — it needs a medium.' },
      { id: 'phy-wv-03', front: 'Light is what kind of wave?', back: 'Transverse electromagnetic — needs no medium.' },
      { id: 'phy-wv-04', front: 'Speed of light in vacuum?', back: '≈ 3 × 10⁸ m/s.' },
      { id: 'phy-wv-05', front: 'What is dispersion?', back: 'Splitting white light into its colour spectrum (e.g. by a prism).' },
      { id: 'phy-wv-06', front: 'Image formed by a plane mirror?', back: 'Virtual, upright, same size, laterally inverted.' },
      { id: 'phy-wv-07', front: 'Three ways heat transfers — which works through vacuum?', back: 'Conduction, convection, radiation — only radiation needs no medium.' },
      { id: 'phy-el-01', front: 'Ohm’s law in symbols?', back: 'V = IR.' },
      { id: 'phy-el-02', front: 'Current — formula and unit?', back: 'I = charge ÷ time, amperes (A).' },
      { id: 'phy-el-03', front: 'Resistors in series vs parallel?', back: 'Series: they add. Parallel: total is less than the smallest single resistance.' },
      { id: 'phy-el-04', front: 'Ammeter and voltmeter — how is each connected?', back: 'Ammeter in series; voltmeter in parallel.' },
      { id: 'phy-el-05', front: 'Magnetic poles rule?', back: 'Like poles repel, unlike poles attract.' },
      { id: 'phy-el-06', front: 'Who discovered electromagnetic induction?', back: 'Michael Faraday.' },
      { id: 'phy-el-07', front: 'Photon energy formula?', back: 'E = hf — energy is proportional to frequency.' },
      { id: 'phy-el-08', front: 'Define half-life.', back: 'Time for half the radioactive nuclei in a sample to decay.' },
      { id: 'phy-el-09', front: 'SI units: force, energy, power, pressure, current?', back: 'newton (N), joule (J), watt (W), pascal (Pa), ampere (A).' },
      { id: 'phy-el-10', front: 'kilo / centi / milli / micro multipliers?', back: '10³, 10⁻², 10⁻³, 10⁻⁶.' },
    ],
  },
  {
    id: 'chem-organic',
    title: 'Organic Chemistry Essentials',
    subject: 'Chemistry',
    icon: '🧴',
    description: 'Functional groups, isomerism, reactions of hydrocarbons and alcohol chemistry.',
    cards: [
      { id: 'chem-org-01', front: 'Define a functional group.', back: 'The reactive part of a molecule that gives a family (homologous series) its characteristic reactions.' },
      { id: 'chem-org-02', front: 'Structural isomers are compounds that…', back: 'Share the same molecular formula but differ in the arrangement of atoms (e.g. butane and isobutane, both C₄H₁₀).' },
      { id: 'chem-org-03', front: 'Markovnikov\'s rule predicts…', back: 'In HX addition to an unsymmetrical alkene, H goes to the carbon with MORE hydrogens (X to the carbon with fewer).' },
      { id: 'chem-org-04', front: 'Product of complete combustion of any hydrocarbon?', back: 'Carbon dioxide (CO₂) and water (H₂O).' },
      { id: 'chem-org-05', front: 'Substitution vs addition — which reaction is typical of alkanes?', back: 'Alkanes: substitution (e.g. halogenation in UV light). Alkenes: addition across the C=C.' },
      { id: 'chem-org-06', front: 'How is ethanol oxidised to ethanoic acid in the lab?', back: 'Heating with acidified potassium dichromate(VI) (K₂Cr₂O₇/H₂SO₄) — orange to green.' },
      { id: 'chem-org-07', front: 'Ester + functional groups formed from alcohol + carboxylic acid?', back: 'An ester (–COO–) plus water; the reaction is esterification, catalysed by concentrated H₂SO₄.' },
      { id: 'chem-org-08', front: 'Which gas is produced when a carbonate reacts with an acid?', back: 'Carbon dioxide (fizzing; turns limewater milky).' },
      { id: 'chem-org-09', front: 'What is a homologous series?', back: 'A family of compounds with the same general formula, same functional group, and a constant –CH₂– gradation in physical properties.' },
      { id: 'chem-org-10', front: 'Test to distinguish an alkene from an alkane?', back: 'Bromine water: decolourises (orange → colourless) with an alkene, stays orange with an alkane.' },
      { id: 'chem-org-11', front: 'IUPAC name of CH₃–CH₂–OH?', back: 'Ethanol.' },
      { id: 'chem-org-12', front: 'Why does catenation happen in carbon?', back: 'Carbon atoms bond strongly to each other (C–C bonds), forming long chains and rings — the basis of organic chemistry.' },
    ],
  },
  {
    id: 'eng-vocab',
    title: 'MDCAT High-Frequency Vocabulary',
    subject: 'English',
    icon: '🔤',
    description: 'Synonyms, antonyms and word-meaning cards from real MDCAT word lists.',
    cards: [
      { id: 'eng-voc-01', front: 'Meaning of "benevolent"?', back: 'Kind and generous (synonym: charitable).' },
      { id: 'eng-voc-02', front: 'Meaning of "meticulous"?', back: 'Extremely careful and precise about details.' },
      { id: 'eng-voc-03', front: 'Synonym of "obsolete"?', back: 'Outdated (antonym: current/modern).' },
      { id: 'eng-voc-04', front: 'Meaning of "ambiguous"?', back: 'Open to more than one interpretation; unclear.' },
      { id: 'eng-voc-05', front: 'Synonym of "candid"?', back: 'Honest, frank.' },
      { id: 'eng-voc-06', front: 'Meaning of "pragmatic"?', back: 'Practical rather than idealistic.' },
      { id: 'eng-voc-07', front: 'Antonym of "scarce"?', back: 'Abundant / plentiful.' },
      { id: 'eng-voc-08', front: 'Meaning of "tenacious"?', back: 'Holding firmly; persistent and determined.' },
      { id: 'eng-voc-09', front: 'Synonym of "prudent"?', back: 'Wise and careful (antonym: reckless).' },
      { id: 'eng-voc-10', front: 'Meaning of "deteriorate"?', back: 'To become progressively worse.' },
      { id: 'eng-voc-11', front: 'Synonym of "verbose"?', back: 'Wordy (antonym: concise).' },
      { id: 'eng-voc-12', front: 'Meaning of "inevitable"?', back: 'Unavoidable — certain to happen.' },
      { id: 'eng-voc-13', front: 'Antonym of "optimist"?', back: 'Pessimist.' },
      { id: 'eng-voc-14', front: 'Meaning of "resilient"?', back: 'Able to recover quickly from difficulty; tough.' },
    ],
  },
  {
    id: 'english-grammar-vocab',
    title: 'English Grammar & Vocabulary',
    subject: 'English',
    icon: '📖',
    description: 'Grammar rules, prepositions, synonyms/antonyms, sentence patterns.',
    cards: [
      { id: 'eng-01', front: 'He/she/it + present simple verb takes which ending?', back: '–s (she goes); negatives use doesn’t + base verb.' },
      { id: 'eng-02', front: 'Past forms: buy, go, see?', back: 'bought, went, saw (past participles: bought, gone, seen).' },
      { id: 'eng-03', front: 'Structure of the passive voice?', back: 'Object + be + past participle + (by + agent).' },
      { id: 'eng-04', front: 'Who vs which vs whose?', back: 'who = people, which = things, whose = possession.' },
      { id: 'eng-05', front: 'Present perfect structure?', back: 'have/has + past participle.' },
      { id: 'eng-06', front: 'First conditional structure?', back: 'If + present simple, will + base verb.' },
      { id: 'eng-07', front: '"an hour" but "a house" — why?', back: 'A/an depends on the SOUND, not the letter: "hour" starts with a vowel sound.' },
      { id: 'eng-08', front: 'Fixed preposition: "succeed ___"?', back: 'succeed in.' },
      { id: 'eng-09', front: 'Fixed preposition: "prevent ___ doing something"?', back: 'prevent from.' },
      { id: 'eng-10', front: 'Synonym of "abundant"?', back: 'Plentiful.' },
      { id: 'eng-11', front: 'Synonym of "diligent"?', back: 'Hardworking.' },
      { id: 'eng-12', front: 'Antonym of "ancient"?', back: 'Modern.' },
      { id: 'eng-13', front: 'Antonym of "victory"?', back: 'Defeat.' },
      { id: 'eng-14', front: '"Too weak ___ walk" — which word completes it?', back: 'to ("too … to" pattern).' },
      { id: 'eng-15', front: 'Where does a paragraph’s main idea usually live?', back: 'In the topic (usually first) sentence.' },
      { id: 'eng-16', front: 'Physician vs physicist vs pharmacist?', back: 'Physician = medical doctor; physicist = physics scientist; pharmacist = dispensing medicines.' },
    ],
  },
]

export const FLASHCARD_META = {
  title: 'Flashcards',
  totalDecks: FLASHCARD_DECKS.length,
  totalCards: FLASHCARD_DECKS.reduce((n, d) => n + d.cards.length, 0),
} as const

/** Flat lookup: card id -> { card, deck } (used by the review action). */
export const CARDS_BY_ID: ReadonlyMap<string, { card: Flashcard; deck: FlashcardDeck }> =
  new Map(
    FLASHCARD_DECKS.flatMap((deck) => deck.cards.map((card) => [card.id, { card, deck }]))
  )
