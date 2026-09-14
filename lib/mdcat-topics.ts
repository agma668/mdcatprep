// PMDC MDCAT topic taxonomy.
// Organises the four subjects into chapters → topics so the practice page can
// render a structured drill-down navigator.  The leaf `topics` arrays contain
// the exact strings stored in each question's `topic` field.

export type TopicEntry = {
  /** Display name shown in the UI. */
  name: string
  /** Approximate PMDC sub-topics (informational — not matched against questions). */
  subtopics?: string[]
}

export type ChapterEntry = {
  name: string
  topics: TopicEntry[]
}

export type SubjectTaxonomy = {
  icon: string
  chapters: ChapterEntry[]
}

export const MDCAT_TAXONOMY: Record<string, SubjectTaxonomy> = {
  Biology: {
    icon: '🧬',
    chapters: [
      {
        name: 'Cell Biology',
        topics: [
          {
            name: 'Cell Structure',
            subtopics: [
              'Cell membrane & organelles',
              'Prokaryotic vs eukaryotic cells',
              'Endomembrane system',
            ],
          },
        ],
      },
      {
        name: 'Biological Molecules',
        topics: [
          {
            name: 'Biological Molecules',
            subtopics: [
              'Carbohydrates',
              'Lipids',
              'Proteins',
              'Nucleic acids',
              'Enzymes',
            ],
          },
        ],
      },
      {
        name: 'Bioenergetics',
        topics: [
          {
            name: 'Bioenergetics',
            subtopics: [
              'Photosynthesis',
              'Cellular respiration',
              'Energy transfer',
            ],
          },
        ],
      },
      {
        name: 'Coordination and Control',
        topics: [
          {
            name: 'Coordination and Control',
            subtopics: [
              'Nervous system',
              'Endocrine system',
              'Sensory organs',
              'Reflex arcs',
            ],
          },
        ],
      },
      {
        name: 'Homeostasis',
        topics: [
          {
            name: 'Homeostasis',
            subtopics: [
              'Osmoregulation',
              'Kidney structure & function',
              'Thermoregulation',
              'Blood sugar regulation',
            ],
          },
        ],
      },
      {
        name: 'Support and Movement',
        topics: [
          {
            name: 'Support and Movement',
            subtopics: [
              'Skeletal system',
              'Muscular system',
              'Joints & movement',
            ],
          },
        ],
      },
      {
        name: 'Genetics',
        topics: [
          {
            name: 'Genetics',
            subtopics: [
              'Mendelian genetics',
              'Molecular genetics',
              'Chromosomes & inheritance',
              'DNA replication & protein synthesis',
            ],
          },
        ],
      },
      {
        name: 'Reproduction',
        topics: [
          {
            name: 'Reproduction',
            subtopics: [
              'Asexual reproduction',
              'Sexual reproduction',
              'Human reproductive system',
              'Gametogenesis',
            ],
          },
        ],
      },
      {
        name: 'Ecology',
        topics: [
          {
            name: 'Ecology',
            subtopics: [
              'Ecosystems & energy flow',
              'Biodiversity',
              'Environmental issues',
              'Succession',
            ],
          },
        ],
      },
    ],
  },

  Chemistry: {
    icon: '⚗️',
    chapters: [
      {
        name: 'Basic Concepts',
        topics: [
          {
            name: 'States of Matter',
            subtopics: ['Gases', 'Liquids', 'Solids', 'Intermolecular forces'],
          },
        ],
      },
      {
        name: 'Atomic Structure',
        topics: [
          {
            name: 'Atomic Structure',
            subtopics: ['Bohr model', 'Quantum numbers', 'Electronic configuration', 'Isotopes'],
          },
        ],
      },
      {
        name: 'Chemical Bonding',
        topics: [
          {
            name: 'Chemical Bonding',
            subtopics: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding', 'VSEPR theory'],
          },
        ],
      },
      {
        name: 'Chemical Energetics',
        topics: [
          {
            name: 'Chemical Energetics',
            subtopics: ['Enthalpy', 'Hess\'s law', 'Bond energies', 'Entropy'],
          },
        ],
      },
      {
        name: 'Chemical Equilibrium',
        topics: [
          {
            name: 'Chemical Equilibrium',
            subtopics: ['Le Chatelier\'s principle', 'Equilibrium constant', 'Dynamic equilibrium'],
          },
        ],
      },
      {
        name: 'Acids, Bases and Salts',
        topics: [
          {
            name: 'Acids and Bases',
            subtopics: ['pH scale', 'Buffer solutions', 'Neutralisation', 'Salt hydrolysis'],
          },
        ],
      },
      {
        name: 's and p Block Elements',
        topics: [
          {
            name: 's and p Block Elements',
            subtopics: ['Alkali metals', 'Alkaline earth metals', 'Halogens', 'Noble gases'],
          },
        ],
      },
      {
        name: 'Organic Chemistry',
        topics: [
          {
            name: 'Organic Chemistry',
            subtopics: ['IUPAC nomenclature', 'Functional groups', 'Isomerism', 'Reactions & mechanisms'],
          },
          {
            name: 'Hydrocarbons and Fuels',
            subtopics: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic hydrocarbons', 'Combustion'],
          },
        ],
      },
      {
        name: 'Electrochemistry',
        topics: [
          {
            name: 'Electrochemistry',
            subtopics: ['Electrochemical cells', 'Electrolysis', 'Faraday\'s laws', 'Electrode potentials'],
          },
        ],
      },
    ],
  },

  Physics: {
    icon: '⚛️',
    chapters: [
      {
        name: 'Measurements',
        topics: [
          {
            name: 'Measurement',
            subtopics: ['SI units', 'Significant figures', 'Errors & uncertainties', 'Vernier & screw gauge'],
          },
        ],
      },
      {
        name: 'Kinematics',
        topics: [
          {
            name: 'Kinematics',
            subtopics: ['Linear motion', 'Equations of motion', 'Projectile motion', 'Graphs of motion'],
          },
        ],
      },
      {
        name: 'Dynamics',
        topics: [
          {
            name: 'Dynamics',
            subtopics: ['Newton\'s laws', 'Friction', 'Momentum', 'Centre of mass'],
          },
        ],
      },
      {
        name: 'Work and Energy',
        topics: [
          {
            name: 'Work and Energy',
            subtopics: ['Work-energy theorem', 'Conservation of energy', 'Power', 'Efficiency'],
          },
        ],
      },
      {
        name: 'Oscillations and Waves',
        topics: [
          {
            name: 'Oscillations and Waves',
            subtopics: ['Simple harmonic motion', 'Sound waves', 'Electromagnetic waves', 'Superposition'],
          },
        ],
      },
      {
        name: 'Fluid Dynamics',
        topics: [
          {
            name: 'Fluid Dynamics',
            subtopics: ['Pressure', 'Bernoulli\'s principle', 'Viscosity', 'Surface tension'],
          },
        ],
      },
      {
        name: 'Heat and Thermodynamics',
        topics: [
          {
            name: 'Heat and Thermodynamics',
            subtopics: ['Thermal equilibrium', 'Laws of thermodynamics', 'Ideal gas law', 'Heat transfer'],
          },
        ],
      },
      {
        name: 'Light and Optics',
        topics: [
          {
            name: 'Light and Optics',
            subtopics: ['Reflection', 'Refraction', 'Lenses', 'Diffraction & interference'],
          },
        ],
      },
      {
        name: 'Modern Physics',
        topics: [
          {
            name: 'Modern Physics',
            subtopics: ['Photoelectric effect', 'Atomic models', 'Nuclear physics', 'Radioactivity'],
          },
        ],
      },
      {
        name: 'Electricity and Magnetism',
        topics: [
          {
            name: 'Electricity and Magnetism',
            subtopics: ['Coulomb\'s law', 'Electric circuits', 'Capacitance', 'Electromagnetic induction'],
          },
          {
            name: 'Magnetism',
            subtopics: ['Magnetic fields', 'Force on a current-carrying conductor', 'Electromagnets'],
          },
        ],
      },
    ],
  },

  English: {
    icon: '📖',
    chapters: [
      {
        name: 'Vocabulary',
        topics: [
          {
            name: 'Vocabulary',
            subtopics: ['Synonyms', 'Antonyms', 'Word meanings', 'Context clues'],
          },
        ],
      },
      {
        name: 'Grammar',
        topics: [
          {
            name: 'Grammar',
            subtopics: ['Tenses', 'Subject-verb agreement', 'Articles & determiners', 'Prepositions'],
          },
        ],
      },
      {
        name: 'Sentence Skills',
        topics: [
          {
            name: 'Sentence Completion',
            subtopics: ['Fill in the blanks', 'Choose the correct word/phrase'],
          },
        ],
      },
      {
        name: 'Reading Comprehension',
        topics: [
          {
            name: 'Comprehension',
            subtopics: ['Passage reading', 'Inference', 'Main idea', 'Detail questions'],
          },
        ],
      },
    ],
  },

  // NUMS Paper-I carries a reasoning section, which the first three subjects
  // never covered — this is the taxonomy for it.
  'Logical Reasoning': {
    icon: '🧠',
    chapters: [
      {
        name: 'Verbal Reasoning',
        topics: [
          {
            name: 'Logical Deduction',
            subtopics: ['Syllogisms', 'Valid conclusions', 'Middle-term fallacies'],
          },
          {
            name: 'Cause and Effect',
            subtopics: ['Assumptions', 'Strong vs weak arguments'],
          },
          {
            name: 'Letter Coding',
            subtopics: ['Letter shifts', 'Substitution codes', 'Word patterns'],
          },
        ],
      },
      {
        name: 'Non-Verbal Reasoning',
        topics: [
          {
            name: 'Letter Series',
            subtopics: ['Alphabet sequences', 'Alternating series'],
          },
          {
            name: 'Number Series',
            subtopics: ['Differences', 'Squares and cubes', 'Mixed patterns'],
          },
          {
            name: 'Direction Sense',
            subtopics: ['Displacement', 'Relative directions'],
          },
        ],
      },
      {
        name: 'Analytical Reasoning',
        topics: [
          {
            name: 'Blood Relations',
            subtopics: ['Family trees', 'Relation puzzles'],
          },
          {
            name: 'Analytical Reasoning',
            subtopics: ['Course of action', 'Arrangements', 'Grouping'],
          },
        ],
      },
    ],
  },
}
