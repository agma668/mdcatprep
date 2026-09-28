export type ExamCategory = 'mdcat' | 'pma' | 'nust' | 'usat' | 'mbbs';

export interface ExamConfig {
  id: ExamCategory;
  name: string;
  tagline: string;
  badge: string;
  route: string;
  practiceRoute?: string; // Optional topical drill route (mirrors /usat/practice pattern)
  accentColor: string; // CSS variable or Tailwind color class
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
    name: 'MDCAT & NUMS Prep',
    tagline: 'Pakistan\'s Premier Medical Entrance System',
    badge: 'Medical Flagship',
    route: '/dashboard',
    accentColor: 'from-emerald-500 to-teal-600',
    subjects: [
      { id: 'biology', name: 'Biology', count: 157 },
      { id: 'chemistry', name: 'Chemistry', count: 159 },
      { id: 'physics', name: 'Physics', count: 170 },
      { id: 'english', name: 'English', count: 166 },
      { id: 'logical-reasoning', name: 'Logical Reasoning', count: 8 },
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
    tagline: 'Verbal, Non-Verbal & Academic Intelligence Tests',
    badge: 'Military Defence',
    route: '/pma/dashboard',
    accentColor: 'from-amber-600 to-yellow-700',
    subjects: [
      { id: 'verbal', name: 'Verbal Intelligence', count: 120 },
      { id: 'non-verbal', name: 'Non-Verbal Intelligence', count: 120 },
      { id: 'academic', name: 'Initial Academic (Math/English/GK/Islamiyat)', count: 200 },
      { id: 'issb-psych', name: 'ISSB Psychological Test Prep', count: 50 },
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
    tagline: 'Engineering & Business Admissions Masterclass',
    badge: 'Engineering & CS',
    route: '/nust/dashboard',
    practiceRoute: '/nust/practice',
    accentColor: 'from-blue-600 to-indigo-700',
    subjects: [
      { id: 'net-math', name: 'Mathematics / Quantitative', count: 200 },
      { id: 'net-physics', name: 'Engineering Physics', count: 150 },
      { id: 'net-chemistry', name: 'Engineering Chemistry / ICS', count: 150 },
      { id: 'net-english', name: 'English & Intelligence', count: 100 },
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
    name: 'HEC USAT (M / A / S / CS)',
    tagline: 'Undergraduate Studies Admission Test Prep',
    badge: 'Mandatory HEC',
    route: '/usat/dashboard',
    accentColor: 'from-purple-600 to-violet-700',
    subjects: [
      { id: 'quantitative', name: 'Quantitative Reasoning', count: 100 },
      { id: 'verbal-reasoning', name: 'Verbal Reasoning', count: 100 },
      { id: 'essay-composition', name: 'Essay & Composition', count: 30 },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: true,
      flashcards: false,
      pastPapers: true,
    },
  },
  mbbs: {
    id: 'mbbs',
    name: 'MBBS MedSchool Notes',
    tagline: '1st to Final Year Professional Exam Guides & Anatomy',
    badge: 'Medical Professionals',
    route: '/mbbs/dashboard',
    accentColor: 'from-rose-600 to-pink-700',
    subjects: [
      { id: 'anatomy', name: 'Gross Anatomy & Embryology', count: 80 },
      { id: 'physiology', name: 'Medical Physiology', count: 70 },
      { id: 'biochemistry', name: 'Medical Biochemistry', count: 60 },
      { id: 'pathology', name: 'General & Special Pathology', count: 90 },
      { id: 'pharmacology', name: 'Pharmacology & Therapeutics', count: 80 },
    ],
    features: {
      practice: true,
      mockTests: false,
      notes: true,
      flashcards: true,
      pastPapers: true,
    },
  },
};
