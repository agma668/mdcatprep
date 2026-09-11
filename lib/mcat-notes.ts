// MDCAT Master Concept Notes for pre-medical students.
// Easy-language notes written from the PMDC MDCAT syllabus. Read each
// explanation, then solve 3–5 questions to lock the idea in.

export type NoteBlock = { type: 'para' | 'bullet'; text: string }
export type NoteTopic = { title: string; blocks: NoteBlock[] }
export type NoteSection = { title: string; topics: NoteTopic[] }

export const MCAT_NOTES_PREAMBLE: NoteBlock[] = [
  { type: 'para', text: 'MDCAT MASTER CONCEPT NOTES' },
  { type: 'para', text: 'Easy-language notes for Pre-Medical (F.Sc./A-Level) students sitting the Pakistan MDCAT.' },
  { type: 'para', text: 'Based on the PMDC MDCAT syllabus. Aim: understand the idea first, then solve questions. Read an explanation → cover the examples → explain the idea aloud in your own words → solve 3–5 questions without looking.' },
]

export const MCAT_NOTES_SECTIONS: NoteSection[] = [
  {
    title: '1. BIOLOGY',
    topics: [
      {
        title: '',
        blocks: [
          { type: 'para', text: 'Biology is the study of living organisms and their interactions. For MDCAT, focus on understanding concepts and applying them to MCQs rather than on rote memorisation alone.' },
        ],
      },
      {
        title: 'The cell — life’s building block',
        blocks: [
          { type: 'para', text: 'A cell is the smallest structural and functional unit of living things.' },
          { type: 'bullet', text: 'Prokaryotic cells (bacteria) lack a true nucleus; eukaryotic cells (plants, animals, fungi) have a membrane-bound nucleus.' },
          { type: 'bullet', text: 'Plasma membrane: selectively permeable, made of a phospholipid bilayer with embedded proteins (fluid mosaic model).' },
          { type: 'bullet', text: 'Mitochondria: site of cellular respiration and ATP production — the “powerhouse.”' },
          { type: 'bullet', text: 'Chloroplasts: site of photosynthesis (plants only).' },
          { type: 'bullet', text: 'Ribosomes: site of protein synthesis (translation).' },
          { type: 'bullet', text: 'Golgi apparatus: modifies, packages and sorts proteins for secretion.' },
          { type: 'bullet', text: 'Lysosomes: contain digestive enzymes that break down waste and pathogens.' },
          { type: 'para', text: 'Think like this: where energy is made → mitochondria; where proteins are made → ribosomes; where photosynthesis happens → chloroplast.' },
        ],
      },
      {
        title: 'Biological molecules',
        blocks: [
          { type: 'para', text: 'Life is built from four classes of biomolecule.' },
          { type: 'bullet', text: 'Carbohydrates: sugars and starches; monomers are monosaccharides (e.g. glucose).' },
          { type: 'bullet', text: 'Lipids: fats, oils, phospholipids and steroids; made of glycerol and fatty acids; store energy and form cell membranes.' },
          { type: 'bullet', text: 'Proteins: polymers of amino acids joined by peptide bonds; include enzymes and structural proteins.' },
          { type: 'bullet', text: 'Nucleic acids: DNA and RNA; polymers of nucleotides; store and transmit genetic information.' },
          { type: 'bullet', text: 'Enzymes are proteins that act as biological catalysts and are sensitive to temperature and pH.' },
          { type: 'para', text: 'Think like this: amino acids link by peptide bonds → protein; nucleotides link by phosphodiester bonds → nucleic acid.' },
        ],
      },
      {
        title: 'Bioenergetics (metabolism)',
        blocks: [
          { type: 'para', text: 'Energy flows through cells by photosynthesis and respiration.' },
          { type: 'bullet', text: 'Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂, in the chloroplasts.' },
          { type: 'bullet', text: 'Aerobic respiration: glucose + O₂ → CO₂ + H₂O + energy (ATP), in the mitochondria.' },
          { type: 'bullet', text: 'Glycolysis occurs in the cytoplasm and does not need oxygen.' },
          { type: 'bullet', text: 'The Krebs cycle and electron transport chain occur in the mitochondria.' },
          { type: 'bullet', text: 'Anaerobic respiration in muscles produces lactic acid; in yeast it produces ethanol and CO₂.' },
          { type: 'para', text: 'Think like this: no oxygen → lactic acid (muscle) or ethanol (yeast); with oxygen → CO₂ and H₂O with much more ATP.' },
        ],
      },
      {
        title: 'Coordination and control',
        blocks: [
          { type: 'para', text: 'The body coordinates its activities through the nervous and endocrine systems.' },
          { type: 'bullet', text: 'The basic unit of the nervous system is the neuron; impulses cross a synapse via neurotransmitters.' },
          { type: 'bullet', text: 'The cerebrum controls thought and voluntary action; the cerebellum controls balance and coordination; the medulla controls breathing and heart rate.' },
          { type: 'bullet', text: 'The pituitary is the “master gland” controlling many other endocrine glands.' },
          { type: 'bullet', text: 'Insulin (pancreas) lowers blood glucose; glucagon raises it.' },
          { type: 'bullet', text: 'Adrenaline (adrenal medulla) prepares the body for fight-or-flight.' },
          { type: 'para', text: 'Think like this: raised blood sugar → insulin releases it; dropped blood sugar → glucagon raises it back.' },
        ],
      },
      {
        title: 'Homeostasis',
        blocks: [
          { type: 'para', text: 'Homeostasis keeps the internal environment stable.' },
          { type: 'bullet', text: 'The nephron is the functional unit of the kidney where blood is filtered to form urine.' },
          { type: 'bullet', text: 'ADH controls water reabsorption: more ADH → concentrated urine; less ADH → dilute urine.' },
          { type: 'bullet', text: 'Body temperature is regulated around 37°C by the hypothalamus.' },
          { type: 'para', text: 'Think like this: too much water in the body → the kidney makes dilute urine to flush it out.' },
        ],
      },
      {
        title: 'Support, genetics and reproduction',
        blocks: [
          { type: 'para', text: 'Final key topics tie movement, inheritance and continuity of life together.' },
          { type: 'bullet', text: 'Muscle contraction happens when actin (thin filaments) slides over myosin (thick filaments).' },
          { type: 'bullet', text: 'A gene is a segment of DNA that codes for a trait; it is the unit of heredity.' },
          { type: 'bullet', text: 'Human somatic cells have 46 chromosomes (23 pairs); gametes have 23.' },
          { type: 'bullet', text: 'Meiosis produces four genetically different haploid gametes; mitosis produces two identical diploid cells.' },
          { type: 'bullet', text: 'Fertilisation is the fusion of sperm and egg to form a zygote.' },
          { type: 'para', text: 'Think like this: sex cells divide by meiosis (genetic variety); body cells divide by mitosis (identical copies for growth and repair).' },
        ],
      },
    ],
  },
  {
    title: '2. CHEMISTRY',
    topics: [
      {
        title: 'Atomic structure',
        blocks: [
          { type: 'para', text: 'Matter is made of atoms.' },
          { type: 'bullet', text: 'An atom has protons (+) and neutrons (0) in the nucleus and electrons (–) in shells.' },
          { type: 'bullet', text: 'Atomic number = number of protons (defines the element). Mass number = protons + neutrons.' },
          { type: 'bullet', text: 'Isotopes have the same number of protons but different numbers of neutrons.' },
          { type: 'bullet', text: 'Electron shells fill from the inside out: capacities 2, 8, 18, 32.' },
          { type: 'para', text: 'Think like this: the atomic number is the element’s identity; isotopes are the same identity with a different weight.' },
        ],
      },
      {
        title: 'Chemical bonding',
        blocks: [
          { type: 'para', text: 'Atoms bond to become stable.' },
          { type: 'bullet', text: 'Ionic bond: transfer of electrons (e.g. NaCl) — strong attraction between oppositely charged ions.' },
          { type: 'bullet', text: 'Covalent bond: sharing of electron pairs (e.g. H₂, H₂O, CO₂).' },
          { type: 'bullet', text: 'Metallic bond: delocalised electrons among metal cations.' },
          { type: 'bullet', text: 'Hydrogen bond: a weak attraction between a hydrogen atom and an electronegative atom (O, N, F), important in water and DNA.' },
          { type: 'bullet', text: 'In a co-ordinate (dative) bond one atom supplies both shared electrons, e.g. in the ammonium ion.' },
          { type: 'para', text: 'Think like this: metal + nonmetal → usually ionic; nonmetal + nonmetal → covalent.' },
        ],
      },
      {
        title: 'States of matter and energetics',
        blocks: [
          { type: 'para', text: 'Matter exists in three main states, each with different particle behaviour.' },
          { type: 'bullet', text: 'Solids have fixed shape and volume; liquids have fixed volume but no fixed shape; gases have neither.' },
          { type: 'bullet', text: 'Sublimation: solid → gas directly (e.g. dry ice, iodine).' },
          { type: 'bullet', text: 'Boyle’s law: P ∝ 1/V at constant T. Charles’ law: V ∝ T at constant P.' },
          { type: 'bullet', text: 'Exothermic reactions release heat (ΔH negative); endothermic reactions absorb heat.' },
          { type: 'bullet', text: 'A catalyst lowers activation energy and speeds up a reaction without being used up.' },
          { type: 'para', text: 'Think like this: “exo” = exit/out → heat leaves; “endo” = heat comes in.' },
        ],
      },
      {
        title: 'Equilibrium, acids and bases',
        blocks: [
          { type: 'para', text: 'Many reactions are reversible and reach equilibrium.' },
          { type: 'bullet', text: 'At dynamic equilibrium the forward and reverse reaction rates are equal.' },
          { type: 'bullet', text: 'Le Chatelier’s principle: a system at equilibrium responds to a stress (heat, pressure, concentration) in a way that reduces it.' },
          { type: 'bullet', text: 'Acids donate H⁺; bases accept H⁺ (or donate OH⁻).' },
          { type: 'bullet', text: 'pH below 7 is acidic, pH 7 neutral, pH above 7 basic.' },
          { type: 'bullet', text: 'Strong acids (e.g. HCl) ionise almost completely; weak acids (e.g. acetic, carbonic) ionise only slightly.' },
          { type: 'para', text: 'Think like this: the pH scale runs 0–14; lower pH = more H⁺ = more acidic.' },
        ],
      },
      {
        title: 'Electrochemistry and organic chemistry',
        blocks: [
          { type: 'para', text: 'Two big applied areas round out the syllabus.' },
          { type: 'bullet', text: 'Electrolysis: an electric current drives a non-spontaneous reaction.' },
          { type: 'bullet', text: 'Oxidation (loss of electrons) occurs at the anode; reduction (gain of electrons) at the cathode.' },
          { type: 'bullet', text: 'Alkanes have the formula CnH2n+2 (saturated); alkenes CnH2n (unsaturated, with a C=C bond).' },
          { type: 'bullet', text: 'Functional groups: –OH alcohol, –COOH carboxylic acid, –CHO aldehyde, –CO– ketone.' },
          { type: 'bullet', text: 'Cracking breaks large hydrocarbons into smaller, more useful ones to make petrol and alkenes.' },
          { type: 'para', text: 'Think like this: alkanes end in “-ane,” alkenes in “-ene” (the “e” signals the double bond).' },
        ],
      },
    ],
  },
  {
    title: '3. PHYSICS',
    topics: [
      {
        title: 'Measurement and units',
        blocks: [
          { type: 'para', text: 'Physics questions lean heavily on units and scalar/vector ideas.' },
          { type: 'bullet', text: 'SI units: force — newton (N), energy — joule (J), power — watt (W), pressure — pascal (Pa), current — ampere (A).' },
          { type: 'bullet', text: 'Vectors have magnitude and direction (velocity, force, displacement, acceleration); scalars have only magnitude (speed, distance, mass, time).' },
          { type: 'bullet', text: 'Prefixes: kilo = ×10³, centi = ×10⁻², milli = ×10⁻³, micro = ×10⁻⁶.' },
          { type: 'para', text: 'Think like this: “kilo” = a thousand, “milli” = a thousandth.' },
        ],
      },
      {
        title: 'Kinematics and dynamics',
        blocks: [
          { type: 'para', text: 'Motion and the forces that cause it.' },
          { type: 'bullet', text: 'Speed = distance ÷ time (scalar); velocity = displacement ÷ time (vector); acceleration = change in velocity ÷ time (m/s²).' },
          { type: 'bullet', text: 'g ≈ 9.8 m/s² near the Earth’s surface.' },
          { type: 'bullet', text: 'Newton’s laws: (1) inertia, (2) F = ma, (3) equal and opposite action–reaction.' },
          { type: 'bullet', text: 'Momentum p = mv (kg·m/s) and is conserved when no external force acts.' },
          { type: 'bullet', text: 'Friction opposes motion.' },
          { type: 'para', text: 'Think like this: Newton’s first law is about inertia (no force → no change); the second says how force changes motion (F = ma).' },
        ],
      },
      {
        title: 'Work, energy and power',
        blocks: [
          { type: 'para', text: 'Energy is conserved and transfers between forms.' },
          { type: 'bullet', text: 'Work = force × displacement in the direction of the force (W = Fd cosθ).' },
          { type: 'bullet', text: 'Kinetic energy = ½mv²; gravitational potential energy = mgh.' },
          { type: 'bullet', text: 'Power = work ÷ time (watts).' },
          { type: 'bullet', text: 'The law of conservation of energy: energy cannot be created or destroyed, only transformed.' },
          { type: 'para', text: 'Think like this: a moving body has kinetic energy; a raised body has potential energy; work changes one into the other.' },
        ],
      },
      {
        title: 'Waves, light and heat',
        blocks: [
          { type: 'para', text: 'Wave behaviour and how heat moves.' },
          { type: 'bullet', text: 'Wave speed v = fλ (frequency × wavelength).' },
          { type: 'bullet', text: 'Sound is a longitudinal mechanical wave; light is a transverse electromagnetic wave.' },
          { type: 'bullet', text: 'Light travels at about 3×10⁸ m/s in a vacuum.' },
          { type: 'bullet', text: 'Dispersion splits white light into its spectrum; a plane mirror forms a virtual, upright image; a concave lens forms a virtual, diminished image.' },
          { type: 'bullet', text: 'Heat transfers by conduction, convection and radiation; only radiation travels through a vacuum.' },
          { type: 'para', text: 'Think like this: sound needs matter, light does not — that is why you cannot hear in space but can see.' },
        ],
      },
      {
        title: 'Electricity, magnetism and modern physics',
        blocks: [
          { type: 'para', text: 'Electricity, magnetism and the quantum ideas behind modern physics.' },
          { type: 'bullet', text: 'Current I = charge ÷ time (amperes). Ohm’s law: V = IR.' },
          { type: 'bullet', text: 'Resistors in series add; in parallel the total is smaller than the smallest single resistance.' },
          { type: 'bullet', text: 'An ammeter (in series) measures current; a voltmeter (in parallel) measures potential difference.' },
          { type: 'bullet', text: 'Like poles repel; unlike poles attract. Faraday discovered electromagnetic induction.' },
          { type: 'bullet', text: 'Photon energy E = hf, proportional to frequency.' },
          { type: 'bullet', text: 'Half-life is the time for half the radioactive nuclei to decay.' },
          { type: 'para', text: 'Think like this: volt = push, ohm = resistance to flow, amp = how much flows per second.' },
        ],
      },
    ],
  },
  {
    title: '4. ENGLISH',
    topics: [
      {
        title: 'Grammar essentials',
        blocks: [
          { type: 'para', text: 'Grammar rules that recur on the MDCAT English section.' },
          { type: 'bullet', text: 'He/she/it + present simple → verb + –s (she goes); negatives use “doesn’t” + base verb.' },
          { type: 'bullet', text: 'Irregular verbs: buy–bought–bought, go–went–gone, see–saw–seen.' },
          { type: 'bullet', text: 'Passive voice: object + be + past participle + by + agent.' },
          { type: 'bullet', text: 'Relative pronouns: who (people), which (things), whose (possession).' },
          { type: 'bullet', text: 'Present perfect: have/has + past participle.' },
          { type: 'bullet', text: 'First conditional: if + present simple, will + base verb.' },
          { type: 'para', text: 'Think like this: for one person (he/she/it) add –s; for everyone else keep the base verb.' },
        ],
      },
      {
        title: 'Articles and prepositions',
        blocks: [
          { type: 'para', text: 'Small words that trip many students.' },
          { type: 'bullet', text: 'Use “a” before consonant sounds and “an” before vowel sounds: an honest, a university.' },
          { type: 'bullet', text: 'Fixed prepositions: key to success, succeed in, look forward to, prevent from.' },
          { type: 'para', text: 'Think like this: the sound, not the letter, decides a/an — “an hour” but “a house.”' },
        ],
      },
      {
        title: 'Vocabulary',
        blocks: [
          { type: 'para', text: 'Synonyms and antonyms are tested every year.' },
          { type: 'bullet', text: 'Synonyms: abundant = plentiful, diligent = hardworking, essential = necessary, rapid = fast, obvious = evident.' },
          { type: 'bullet', text: 'Antonyms: brave → cowardly, ancient → modern, artificial → natural, permanent → temporary, victory → defeat.' },
          { type: 'bullet', text: 'A physician is a doctor; do not confuse with physicist or pharmacist.' },
          { type: 'para', text: 'Think like this: to find an antonym, think of the word’s exact opposite, not just a related word.' },
        ],
      },
      {
        title: 'Sentence completion and comprehension',
        blocks: [
          { type: 'para', text: 'Sentence patterns and how to read a paragraph.' },
          { type: 'bullet', text: 'Common patterns: “too…to” (too weak to walk), “despite + noun,” and “neither…nor” agrees with the nearer subject.' },
          { type: 'bullet', text: 'A paragraph’s main idea is usually in its topic (first) sentence.' },
          { type: 'bullet', text: 'Read the whole sentence before choosing: the correct option must fit grammatically and contextually.' },
          { type: 'para', text: 'Think like this: for “neither…nor” and “either…or,” look at the noun right after the last connector to choose a singular or plural verb.' },
        ],
      },
    ],
  },
]

export const MCAT_NOTES_META = {
  title: 'MDCAT Master Concept Notes',
  subtitle: 'Easy-language notes for Pre-Medical (F.Sc./A-Level) students',
  badge: 'Based on the PMDC MDCAT Syllabus',
} as const

// ── Deep corpus-derived master notes ─────────────────────────────────────────
// Auto-converted from the MDCAT PYQ corpus (2,573 fact lines across Biology,
// Chemistry and Physics, bucketed by PMDC unit). These expand the light overview
// above into exam-depth revision material with per-bucket ×n repetition flags.
import { MCAT_BIOLOGY_NOTES_SECTIONS } from './mcat-biology-notes'
import { MCAT_CHEMISTRY_NOTES_SECTIONS } from './mcat-chemistry-notes'
import { MCAT_PHYSICS_NOTES_SECTIONS } from './mcat-physics-notes'

export const MCAT_DEEP_SECTIONS: NoteSection[] = [
  ...MCAT_BIOLOGY_NOTES_SECTIONS,
  ...MCAT_CHEMISTRY_NOTES_SECTIONS,
  ...MCAT_PHYSICS_NOTES_SECTIONS,
]

