export type ExamCategory = 'mdcat' | 'pma' | 'nust' | 'usat';

/**
 * Which practice bank a portal actually serves. The portal pages read the real
 * size of that bank from lib/stats.ts (server-only) — the count is NEVER
 * written down here. This module is imported by client components, so it must
 * stay pure data: no bank imports, no derived numbers.
 */
export type ExamBank = 'mdcat' | 'nust' | 'pma' | 'usat';

export interface ExamConfig {
  id: ExamCategory;
  name: string;
  tagline: string;
  badge: string;
  route: string;
  practiceRoute?: string;
  accentColor: string;
  /** The real bank behind this portal's practice sessions. */
  bank: ExamBank;
  subtests: { id: string; name: string; description: string }[];
  /** Syllabus modules of the portal. No counts here — the bank is the truth. */
  subjects: { id: string; name: string }[];
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
    tagline: 'Unified medical entrance preparation for PMDC MDCAT, NUMS, HEC USAT-M, Balochistan and FATA tests — the deepest bank on the platform',
    badge: 'Medical Flagship',
    route: '/dashboard',
    practiceRoute: '/dashboard/practice',
    accentColor: 'from-emerald-500 to-teal-600',
    bank: 'mdcat',
    subtests: [
      { id: 'uhs-mdcat', name: 'UHS MDCAT (Punjab)', description: 'The standard PMDC MDCAT pattern used by Punjab and federal boards.' },
      { id: 'nums-mdcat', name: 'NUMS MDCAT & AMC', description: 'NUMS runs the PMDC core; its Paper-II aptitude test is separate.' },
      { id: 'usat-med', name: 'HEC USAT-M (Pre-Medical)', description: 'The HEC undergraduate test for pre-medical applicants.' },
      { id: 'balochistan-mdcat', name: 'Balochistan Medical Entry Test', description: 'BUMHS / Quetta sitting of the same PMDC science core.' },
      { id: 'fata-medical', name: 'FATA / KPK Medical Entry Test', description: 'KMU CAT and the erstwhile FATA regional quotas.' },
    ],
    subjects: [
      { id: 'biology', name: 'Biology (Botany & Zoology)' },
      { id: 'chemistry', name: 'Chemistry (Organic, Inorganic, Physical)' },
      { id: 'physics', name: 'Physics (Mechanics, Waves, Electromagnetism)' },
      { id: 'english', name: 'English Grammar & Comprehension' },
      { id: 'logical-reasoning', name: 'Logical Reasoning & IQ' },
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
    tagline: 'Engineering & CS admissions practice for NUST NET, GIKI, LUMS SBASSE and HEC USAT-E — a young bank, growing',
    badge: 'Engineering & CS',
    route: '/nust/practice',
    practiceRoute: '/nust/practice',
    accentColor: 'from-blue-600 to-indigo-700',
    bank: 'nust',
    subtests: [
      { id: 'nust-net', name: 'NUST NET (Engineering & CS)', description: 'Maths, physics, chemistry and English on the NET pattern.' },
      { id: 'giki-test', name: 'GIKI Engineering Entrance', description: 'Calculus-heavy maths and advanced physics reasoning.' },
      { id: 'lums-sbasse', name: 'LUMS SBASSE Admission Test', description: 'Quantitative and analytical reasoning for science & engineering.' },
      { id: 'usat-eng', name: 'HEC USAT-E (Pre-Engineering)', description: 'The HEC test for pre-engineering applicants.' },
    ],
    subjects: [
      { id: 'net-math', name: 'Advanced Mathematics' },
      { id: 'net-physics', name: 'Engineering Physics' },
      { id: 'net-chemistry', name: 'Chemistry / Computer Science' },
      { id: 'net-english', name: 'English & Intelligence' },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: false,
      flashcards: false,
      pastPapers: false,
      practiceRoute: '/nust/practice',
    },
  },
  pma: {
    id: 'pma',
    name: 'PMA Long Course & ISSB Defence Portal',
    tagline: 'Pakistan Military Academy initial test and ISSB screening — verbal, non-verbal and academic practice with real figure questions',
    badge: 'Military Defence',
    route: '/pma/practice',
    accentColor: 'from-amber-600 to-yellow-700',
    bank: 'pma',
    subtests: [
      { id: 'pma-initial', name: 'PMA Long Course Initial Test', description: 'Verbal, non-verbal and academic computer-based test.' },
      { id: 'issb-psych', name: 'ISSB Psychological & Officer Matrix', description: 'Word association, sentence completion & picture stories.' },
      { id: 'navy-afns', name: 'Navy & AFNS Nursing Entrance', description: 'Initial intelligence and medical nursing tests.' },
    ],
    subjects: [
      { id: 'verbal', name: 'Verbal Intelligence' },
      { id: 'non-verbal', name: 'Non-Verbal Intelligence' },
      { id: 'academic', name: 'Initial Academic (Math, English, GK, Islamiyat)' },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: false,
      flashcards: false,
      pastPapers: false,
      intelligenceTest: true,
    },
  },
  usat: {
    id: 'usat',
    name: 'HEC USAT General, Arts & Commerce Portal',
    tagline: 'HEC Undergraduate Studies Admission Test practice — quantitative, verbal and the pre-medical/pre-engineering science sections',
    badge: 'HEC Admissions',
    route: '/usat/practice',
    accentColor: 'from-purple-600 to-violet-700',
    bank: 'usat',
    subtests: [
      { id: 'usat-arts', name: 'USAT Arts & Humanities (A)', description: 'Quantitative, verbal and social-sciences reasoning.' },
      { id: 'usat-comm', name: 'USAT Commerce & Business (C)', description: 'Accounting, economics and basic mathematics.' },
    ],
    subjects: [
      { id: 'quantitative', name: 'Quantitative Reasoning' },
      { id: 'verbal-reasoning', name: 'Verbal Reasoning' },
      { id: 'science', name: 'Science Sections (Bio / Chem / Phys)' },
    ],
    features: {
      practice: true,
      mockTests: true,
      notes: false,
      flashcards: false,
      pastPapers: false,
    },
  },
};
