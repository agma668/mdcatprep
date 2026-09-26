// Apex Pakistan — NUST (NET) / GIKI / LUMS Engineering & Computer Science Question Bank
// High-yield mathematics, physics, chemistry, and intelligence test questions matching entry test difficulty.

export type NUSTQuestion = {
  key: string;
  subject: 'Mathematics' | 'Physics' | 'Chemistry' | 'English';
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
};

export const NUST_NET_BANK: NUSTQuestion[] = [
  // --- MATHEMATICS ---
  {
    key: 'nust-m-001',
    subject: 'Mathematics',
    topic: 'Calculus & Limits',
    question_text: 'Evaluate the limit: lim(x→0) [sin(3x) / x]',
    option_a: '0',
    option_b: '1',
    option_c: '3',
    option_d: '9',
    correct_answer: 'C',
    explanation: 'Using L\'Hôpital\'s Rule or standard limit formula lim(x→0) sin(kx)/x = k. Here k = 3.',
    difficulty: 'easy',
    source: 'NUST NET Past Pattern',
  },
  {
    key: 'nust-m-002',
    subject: 'Mathematics',
    topic: 'Matrices & Determinants',
    question_text: 'If A is a square matrix of order 3 such that |A| = 5, what is the value of |2A|?',
    option_a: '10',
    option_b: '20',
    option_c: '40',
    option_d: '50',
    correct_answer: 'C',
    explanation: 'For an n×n matrix, |kA| = k^n * |A|. Here k = 2 and n = 3, so |2A| = 2³ * 5 = 8 * 5 = 40.',
    difficulty: 'medium',
    source: 'NUST NET Past Pattern',
  },
  {
    key: 'nust-m-003',
    subject: 'Mathematics',
    topic: 'Integration',
    question_text: 'Evaluate the definite integral: ∫(from 0 to π/2) cos(x) dx',
    option_a: '0',
    option_b: '1',
    option_c: '-1',
    option_d: 'π/2',
    correct_answer: 'B',
    explanation: 'Integral of cos(x) is sin(x). sin(π/2) - sin(0) = 1 - 0 = 1.',
    difficulty: 'easy',
    source: 'NUST NET Past Pattern',
  },

  // --- PHYSICS ---
  {
    key: 'nust-p-001',
    subject: 'Physics',
    topic: 'Vectors & Equilibrium',
    question_text: 'What is the angle between two vectors A and B if their scalar product is equal to the magnitude of their vector product?',
    option_a: '0°',
    option_b: '30°',
    option_c: '45°',
    option_d: '90°',
    correct_answer: 'C',
    explanation: 'A·B = |A × B| => AB cosθ = AB sinθ => tanθ = 1 => θ = 45° (π/4).',
    difficulty: 'medium',
    source: 'NUST NET Past Pattern',
  },
  {
    key: 'nust-p-002',
    subject: 'Physics',
    topic: 'Rotational Dynamics',
    question_text: 'The angular momentum of a system of particles is conserved if the external _______ acting on the system is zero.',
    option_a: 'Force',
    option_b: 'Torque',
    option_c: 'Momentum',
    option_d: 'Energy',
    correct_answer: 'B',
    explanation: 'By the law of conservation of angular momentum, if net external torque is zero, angular momentum remains constant.',
    difficulty: 'easy',
    source: 'NUST NET Past Pattern',
  },

  // --- CHEMISTRY ---
  {
    key: 'nust-c-001',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    question_text: 'Which molecule has a tetrahedral geometry and sp³ hybridization?',
    option_a: 'BF3',
    option_b: 'H2O',
    option_c: 'CH4',
    option_d: 'CO2',
    correct_answer: 'C',
    explanation: 'Methane (CH4) has 4 bond pairs and 0 lone pairs around carbon, giving sp³ hybridization and regular tetrahedral geometry (109.5°).',
    difficulty: 'easy',
    source: 'NUST NET Past Pattern',
  },

  // --- ENGLISH ---
  {
    key: 'nust-e-001',
    subject: 'English',
    topic: 'Sentence Correction',
    question_text: 'Choose the grammatically correct sentence:',
    option_a: 'Each of the boys have completed their assignment.',
    option_b: 'Each of the boys has completed his assignment.',
    option_c: 'Each of the boys have completed his assignment.',
    option_d: 'Each of the boys has completed their assignment.',
    correct_answer: 'B',
    explanation: '"Each" is singular and takes a singular verb ("has") and singular masculine/neutral pronoun ("his").',
    difficulty: 'medium',
    source: 'NUST NET Past Pattern',
  }
];
