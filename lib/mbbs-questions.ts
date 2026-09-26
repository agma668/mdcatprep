// Apex Pakistan — MBBS Professional Examinations & Clinical Sciences Question Bank
// High-yield clinical and basic science MCQs for 1st to final-year medical students.

export type MBBSQuestion = {
  key: string;
  subject: 'Anatomy' | 'Physiology' | 'Biochemistry' | 'Pathology' | 'Pharmacology';
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'medium' | 'hard';
  source: string;
};

export const MBBS_CLINICAL_BANK: MBBSQuestion[] = [
  // --- ANATOMY ---
  {
    key: 'mbbs-anat-001',
    subject: 'Anatomy',
    topic: 'Neuroanatomy',
    question_text: 'Damage to the recurrent laryngeal nerve during thyroidectomy typically results in which clinical sign?',
    option_a: 'Inability to close the eye (Bell\'s palsy)',
    option_b: 'Hoarseness of voice / paralyzed vocal cord',
    option_c: 'Loss of tongue sensation on anterior 2/3',
    option_d: 'Inability to shrug the shoulder',
    correct_answer: 'B',
    explanation: 'The recurrent laryngeal nerve innervates all intrinsic muscles of the larynx except the cricothyroid. Injury leads to vocal cord paralysis and hoarseness.',
    difficulty: 'hard',
    source: 'MBBS Professional Exam Bank',
  },
  {
    key: 'mbbs-anat-002',
    subject: 'Anatomy',
    topic: 'Upper Limb',
    question_text: 'Which nerve is most commonly injured in mid-shaft fractures of the humerus?',
    option_a: 'Median nerve',
    option_b: 'Ulnar nerve',
    option_c: 'Radial nerve',
    option_d: 'Musculocutaneous nerve',
    correct_answer: 'C',
    explanation: 'The radial nerve travels in the radial groove along the posterior shaft of the humerus, making it vulnerable to mid-shaft humerus fractures (presenting with wrist drop).',
    difficulty: 'medium',
    source: 'MBBS Professional Exam Bank',
  },

  // --- PHYSIOLOGY ---
  {
    key: 'mbbs-phys-001',
    subject: 'Physiology',
    topic: 'Cardiovascular System',
    question_text: 'During which phase of the cardiac cycle does the maximal ventricular pressure occur?',
    option_a: 'Isovolumetric contraction',
    option_b: 'Rapid ejection phase',
    option_c: 'Isovolumetric relaxation',
    option_d: 'Atrial systole',
    correct_answer: 'B',
    explanation: 'Peak ventricular pressure is achieved during the rapid ejection phase of ventricular systole as blood is actively pumped into the aorta/pulmonary artery.',
    difficulty: 'medium',
    source: 'MBBS Professional Exam Bank',
  },

  // --- BIOCHEMISTRY ---
  {
    key: 'mbbs-biochem-001',
    subject: 'Biochemistry',
    topic: 'Metabolism',
    question_text: 'A deficiency in vitamin B1 (Thiamine) leads to which classic neurological and cardiovascular disorder?',
    option_a: 'Scurvy',
    option_b: 'Pellagra',
    option_c: 'Beriberi',
    option_d: 'Rickets',
    correct_answer: 'C',
    explanation: 'Thiamine (Vitamin B1) deficiency causes beriberi (affecting peripheral nerves and cardiovascular system) and Wernicke-Korsakoff syndrome in chronic alcoholics.',
    difficulty: 'medium',
    source: 'MBBS Professional Exam Bank',
  },

  // --- PATHOLOGY ---
  {
    key: 'mbbs-path-001',
    subject: 'Pathology',
    topic: 'General Pathology',
    question_text: 'Which type of necrosis is classically associated with ischemic infarction in the brain?',
    option_a: 'Coagulative necrosis',
    option_b: 'Liquefactive necrosis',
    option_c: 'Caseous necrosis',
    option_d: 'Fat necrosis',
    correct_answer: 'B',
    explanation: 'Brain infarcts undergo liquefactive necrosis due to high lipid and enzyme content and lack of substantial fibrous structural proteins.',
    difficulty: 'medium',
    source: 'MBBS Professional Exam Bank',
  }
];
