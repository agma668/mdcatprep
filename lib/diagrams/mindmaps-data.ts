// Chapter mindmaps — collapsible revision trees per subject, written from the
// same PMDC syllabus content as the master notes and flashcards. Each tree is
// displayed with expand/collapse per node, so a student can revise a chapter
// top-down and tap open only the branches they still need.
//
// Kept deliberately shallow (chapter -> topic -> key points): mindmaps that
// nest five levels deep stop being revision aids and become documents.

export type MindmapNode = {
  title: string
  children?: MindmapNode[]
}

export type Mindmap = {
  id: string
  subject: 'Biology' | 'Chemistry' | 'Physics' | 'English'
  icon: string
  title: string
  root: MindmapNode[]
}

export const MINDMAPS: Mindmap[] = [
  {
    id: 'bio',
    subject: 'Biology',
    icon: '🧬',
    title: 'Biology — full syllabus map',
    root: [
      {
        title: 'Cell structure & function',
        children: [
          { title: 'Prokaryote vs eukaryote' },
          { title: 'Organelles', children: [
            { title: 'Mitochondria — respiration/ATP' },
            { title: 'Chloroplast — photosynthesis' },
            { title: 'Ribosome — protein synthesis' },
            { title: 'Golgi — package & secrete' },
            { title: 'Lysosome — waste digestion' },
          ] },
          { title: 'Plasma membrane — fluid mosaic' },
        ],
      },
      {
        title: 'Biological molecules',
        children: [
          { title: 'Carbs → monosaccharides' },
          { title: 'Proteins → amino acids, peptide bonds' },
          { title: 'Lipids → glycerol + fatty acids' },
          { title: 'Nucleic acids → nucleotides' },
          { title: 'Enzymes — pH & temperature sensitivity' },
        ],
      },
      {
        title: 'Bioenergetics',
        children: [
          { title: 'Photosynthesis — chloroplast' },
          { title: 'Aerobic respiration — mitochondria' },
          { title: 'Glycolysis — cytoplasm, no O₂' },
          { title: 'Anaerobic: lactic acid / ethanol' },
        ],
      },
      {
        title: 'Coordination & control',
        children: [
          { title: 'Neuron + synapse' },
          { title: 'Brain: cerebrum / cerebellum / medulla' },
          { title: 'Hormones', children: [
            { title: 'Insulin ↓ glucose, glucagon ↑' },
            { title: 'Adrenaline — fight or flight' },
            { title: 'Pituitary — master gland' },
          ] },
        ],
      },
      {
        title: 'Homeostasis',
        children: [
          { title: 'Nephron — filtration & urine' },
          { title: 'ADH — water reabsorption' },
          { title: 'Thermoregulation — hypothalamus, 37 °C' },
        ],
      },
      {
        title: 'Support, genetics & reproduction',
        children: [
          { title: 'Muscle: actin slides over myosin' },
          { title: '46 chromosomes / 23 in gametes' },
          { title: 'Mitosis vs meiosis' },
          { title: 'Fertilisation → zygote' },
        ],
      },
    ],
  },
  {
    id: 'chem',
    subject: 'Chemistry',
    icon: '⚗️',
    title: 'Chemistry — full syllabus map',
    root: [
      {
        title: 'Atomic structure',
        children: [
          { title: 'Atomic number = identity' },
          { title: 'Mass number = p + n' },
          { title: 'Isotopes — same p, different n' },
          { title: 'Shells fill 2, 8, 18, 32' },
        ],
      },
      {
        title: 'Bonding',
        children: [
          { title: 'Ionic — transfer (NaCl)' },
          { title: 'Covalent — sharing (H₂O, CO₂)' },
          { title: 'Metallic — delocalised e⁻' },
          { title: 'Hydrogen — H to O/N/F' },
          { title: 'Dative — both e⁻ from one atom' },
        ],
      },
      {
        title: 'States & energetics',
        children: [
          { title: 'Solid / liquid / gas behaviour' },
          { title: 'Boyle P∝1/V; Charles V∝T' },
          { title: 'Exo ΔH− / Endo ΔH+' },
          { title: 'Catalyst lowers activation energy' },
        ],
      },
      {
        title: 'Equilibrium & acids',
        children: [
          { title: 'Dynamic equilibrium — equal rates' },
          { title: 'Le Chatelier — oppose the stress' },
          { title: 'Acid donates H⁺ / base accepts' },
          { title: 'pH < 7 acid, > 7 base' },
        ],
      },
      {
        title: 'Electro & organic',
        children: [
          { title: 'OIL RIG at anode/cathode' },
          { title: 'Alkanes CnH2n+2 / alkenes CnH2n' },
          { title: 'Groups: –OH, –COOH, –CHO, –CO–' },
          { title: 'Cracking big → small hydrocarbons' },
        ],
      },
    ],
  },
  {
    id: 'phy',
    subject: 'Physics',
    icon: '⚛️',
    title: 'Physics — full syllabus map',
    root: [
      {
        title: 'Measurement',
        children: [
          { title: 'N, J, W, Pa, A' },
          { title: 'Vectors vs scalars' },
          { title: 'Prefixes k, c, m, µ' },
        ],
      },
      {
        title: 'Kinematics & dynamics',
        children: [
          { title: 'v = s/t; a = Δv/t' },
          { title: 'g ≈ 9.8 m/s²' },
          { title: 'Newton I, II (F=ma), III' },
          { title: 'Momentum p = mv conserved' },
          { title: 'Friction opposes motion' },
        ],
      },
      {
        title: 'Work, energy & power',
        children: [
          { title: 'W = Fd cosθ' },
          { title: 'KE ½mv²; GPE mgh' },
          { title: 'P = W/t' },
          { title: 'Energy conserved' },
        ],
      },
      {
        title: 'Waves, light & heat',
        children: [
          { title: 'v = fλ' },
          { title: 'Sound longitudinal; light transverse' },
          { title: 'c ≈ 3×10⁸ m/s' },
          { title: 'Conduction / convection / radiation' },
        ],
      },
      {
        title: 'Electricity & modern physics',
        children: [
          { title: 'V = IR; series/parallel resistors' },
          { title: 'Ammeter series; voltmeter parallel' },
          { title: 'Like poles repel' },
          { title: 'E = hf; half-life' },
        ],
      },
    ],
  },
  {
    id: 'eng',
    subject: 'English',
    icon: '📖',
    title: 'English — full syllabus map',
    root: [
      {
        title: 'Grammar',
        children: [
          { title: 'Present simple –s (he goes)' },
          { title: 'Irregular verbs' },
          { title: 'Passive: be + past participle' },
          { title: 'Conditionals: if + present, will' },
        ],
      },
      {
        title: 'Articles & prepositions',
        children: [
          { title: 'a/an by SOUND (an hour)' },
          { title: 'succeed in / prevent from' },
        ],
      },
      {
        title: 'Vocabulary',
        children: [
          { title: 'Synonyms: abundant, diligent…' },
          { title: 'Antonyms: ancient↔modern…' },
          { title: 'Physician vs physicist vs pharmacist' },
        ],
      },
      {
        title: 'Sentences & comprehension',
        children: [
          { title: 'too…to; despite + noun' },
          { title: 'Main idea = topic sentence' },
          { title: 'Fit grammar AND context' },
        ],
      },
    ],
  },
]
