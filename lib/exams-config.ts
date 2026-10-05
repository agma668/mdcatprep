export type ExamCategory = 'mdcat' | 'pma' | 'nust' | 'usat';

export interface ExamConfig {
  id: ExamCategory;
  name: string;
  tagline: string;
  badge: string;
  route: string;
  practiceRoute?: string;
  accentColor: string;
  subtests: { id: string; name: string; description: string }[];
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
    name: 'Medical Super-Portal (MDCAT, NUMS, USAT-M, Balochistan & FATA)',
    tagline: 'Unified Medical Entrance Preparation for UHS, NUMS, HEC USAT-M, Balochistan, and FATA Medical Tests',
    badge: 'Medical Flagship',
    route: '/dashboard',
    accentColor: 'from-emerald-500 to-teal-600',
    subtests: [
      { id: 'uhs-mdcat', name: 'UHS MDCAT (Punjab)', description: 'Standard Punjab & Federal medical entrance test pattern.' },
      { id: 'nums-mdcat', name: 'NUMS MDCAT & AMC', description: 'Includes NUMS Paper-II Psychological & Aptitude test.' },
      { id: 'usat-med', name: 'HEC USAT-M (Pre-Medical)', description: 'Mandatory HEC Undergraduate Admission Test for Medical aspirants.' },
      { id: 'balochistan-mdcat', name: 'Balochistan Medical Entry Test', description: 'Tailored specifically for BUMHS / Quetta medical test patterns.' },
      { id: 'fata-medical', name: 'FATA / KPK Medical Entry Test', description: 'Khyber Medical University (KMU) & erstwhile FATA regional quotas.' },
    ],
    subjects: [
      { id: 'biology', name: 'Biology (Botany & Zoology)', count: 220 },
      { id: 'chemistry', name: 'Chemistry (Organic, Inorganic, Physical)', count: 200 },
      { id: 'physics', name: 'Physics (Mechanics, Waves, Electromagnetism)', count: 200 },
      { id: 'english', name: 'English Grammar & Comprehension', count: 180 },
      { id: 'logical-reasoning', name: 'Logical Reasoning & IQ', count: 100 },
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
  nust: {
    id: 'nust',
    name: 'Engineering & Computing (NUST, GIKI, LUMS & USAT-E)',
    tagline: 'Premier Engineering & CS Admissions for NUST NET, GIKI, LUMS, and HEC USAT-E/CS',
    badge: 'Engineering & CS',
    route: '/nust/practice',
    practiceRoute: '/nust/practice',
    accentColor: 'from-blue-600 to-indigo-700',
    subtests: [
      { id: 'nust-net', name: 'NUST NET (Engineering & CS)', description: 'Computer-based test simulation for NUST Islamabad, Risalpur, etc.' },
      { id: 'giki-test', name: 'GIKI Engineering Entrance', description: 'Challenging calculus & advanced physics problem sets.' },
      { id: 'lums-sbasse', name: 'LUMS SBASSE Admission Test', description: 'Quantitative & analytical reasoning for science & engineering.' },
      { id: 'usat-eng', name: 'HEC USAT-E (Pre-Engineering)', description: 'Mandatory HEC test for engineering applicants.' },
    ],
    subjects: [
      { id: 'net-math', name: 'Advanced Mathematics', count: 250 },
      { id: 'net-physics', name: 'Engineering Physics', count: 200 },
      { id: 'net-chemistry', name: 'Chemistry / Computer Science', count: 180 },
      { id: 'net-english', name: 'English & Intelligence', count: 120 },
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
  pma: {
    id: 'pma',
    name: 'PMA Long Course & ISSB Defence Portal',
    tagline: 'Pakistan Military Academy Initial & ISSB Psychological Screening',
    badge: 'Military Defence',
    route: '/pma/practice',
    accentColor: 'from-amber-600 to-yellow-700',
    subtests: [
      { id: 'pma-initial', name: 'PMA Long Course Initial Test', description: 'Verbal, Non-Verbal & Academic computer test simulation.' },
      { id: 'issb-psych', name: 'ISSB Psychological & Officer Matrix', description: 'Word association, sentence completion & picture stories.' },
      { id: 'navy-afns', name: 'Navy & AFNS Nursing Entrance', description: 'Initial intelligence and medical nursing tests.' },
    ],
    subjects: [
      { id: 'verbal', name: 'Verbal Intelligence', count: 180 },
      { id: 'non-verbal', name: 'Non-Verbal Intelligence', count: 180 },
      { id: 'academic', name: 'Initial Academic (Math, English, GK, Islamiyat)', count: 220 },
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
  usat: {
    id: 'usat',
    name: 'HEC USAT General, Arts & Commerce Portal',
    tagline: 'Undergraduate Studies Admission Test for Arts, Humanities & Commerce',
    badge: 'HEC Admissions',
    route: '/usat/practice',
    accentColor: 'from-purple-600 to-violet-700',
    subtests: [
      { id: 'usat-arts', name: 'USAT Arts & Humanities (A)', description: 'Quantitative, Verbal, and Social Sciences reasoning.' },
      { id: 'usat-comm', name: 'USAT Commerce & Business (C)', description: 'Accounting, Economics & Basic Mathematics.' },
    ],
    subjects: [
      { id: 'quantitative', name: 'Quantitative Reasoning', count: 140 },
      { id: 'verbal-reasoning', name: 'Verbal Reasoning', count: 140 },
      { id: 'essay', name: 'Essay Composition & Grammar', count: 50 },
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
