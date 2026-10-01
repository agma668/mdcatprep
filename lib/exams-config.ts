export type ExamCategory = 'mdcat' | 'pma' | 'nust' | 'usat';

export interface ExamConfig {
  id: ExamCategory;
  name: string;
  tagline: string;
  badge: string;
  route: string;
  practiceRoute?: string;
  accentColor: string;
  subjects: { id: string; name: string; count: number }[];
  features: {
    practice: boolean;
    mockTests: boolean;
    notes: boolean;
    flashcards: boolean;
    pastPapers: boolean;
    psychTest?: boolean;
    intelligenceTest?: boolean;
    practiceRoute?: string;
  };
}

export const EXAMS_CONFIG: Record<ExamCategory, ExamConfig> = {
  mdcat: {
    id: 'mdcat',
    name: 'Medical Super-Portal (MDCAT, NUMS & HEC USAT-M)',
    tagline: 'Unified Medical Entrance Preparation (Biology, Chemistry, Physics, Quant & Verbal)',
    badge: 'Medical Flagship',
    route: '/dashboard',
    accentColor: 'from-emerald-500 to-teal-600',
    subjects: [
      { id: 'biology', name: 'Biology (Botany & Zoology)', count: 180 },
      { id: 'chemistry', name: 'Chemistry (Organic, Inorganic, Physical)', count: 180 },
      { id: 'physics', name: 'Physics (Mechanics, Waves, Electromagnetism)', count: 180 },
      { id: 'english', name: 'English Grammar & Vocabulary', count: 160 },
      { id: 'usat-quant', name: 'USAT-M Quantitative & Reasoning', count: 100 },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: true,
      flashcards: true,
      pastPapers: true,
      psychTest: true,
    },
  },
  pma: {
    id: 'pma',
    name: 'PMA Long Course & ISSB',
    tagline: 'Verbal, Non-Verbal & Initial Academic Intelligence Tests',
    badge: 'Military Defence',
    route: '/pma/practice',
    accentColor: 'from-amber-600 to-yellow-700',
    subjects: [
      { id: 'verbal', name: 'Verbal Intelligence', count: 150 },
      { id: 'non-verbal', name: 'Non-Verbal Intelligence', count: 150 },
      { id: 'academic', name: 'Initial Academic (Math, English, GK, Pak Studies)', count: 200 },
      { id: 'issb-psych', name: 'ISSB Psychological Screening', count: 60 },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: true,
      flashcards: false,
      pastPapers: true,
      intelligenceTest: true,
    },
  },
  nust: {
    id: 'nust',
    name: 'NUST (NET) / GIKI / LUMS',
    tagline: 'Engineering & Computing Admissions Masterclass',
    badge: 'Engineering & CS',
    route: '/nust/practice',
    practiceRoute: '/nust/practice',
    accentColor: 'from-blue-600 to-indigo-700',
    subjects: [
      { id: 'net-math', name: 'Advanced Mathematics', count: 220 },
      { id: 'net-physics', name: 'Engineering Physics', count: 180 },
      { id: 'net-chemistry', name: 'Chemistry / Computer Science', count: 160 },
      { id: 'net-english', name: 'English & IQ', count: 120 },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: true,
      flashcards: true,
      pastPapers: true,
      practiceRoute: '/nust/practice',
    },
  },
  usat: {
    id: 'usat',
    name: 'HEC USAT (General / Arts / Commerce)',
    tagline: 'Undergraduate Studies Admission Test (General & Arts)',
    badge: 'HEC Admissions',
    route: '/usat/practice',
    accentColor: 'from-purple-600 to-violet-700',
    subjects: [
      { id: 'quantitative', name: 'Quantitative Reasoning', count: 120 },
      { id: 'verbal-reasoning', name: 'Verbal Reasoning', count: 120 },
      { id: 'essay', name: 'Essay Composition', count: 40 },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: true,
      flashcards: false,
      pastPapers: true,
    },
  },
};
