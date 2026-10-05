// Apex Pakistan — PMA Long Course Initial Test Question Bank
// Verbal Intelligence, Non-Verbal Reasoning (SVG figures), and Academic MCQs.
// All questions are original exam-style writing for Apex Pakistan — no official
// PMA or ISSB paper is reproduced.

// Deterministic figure spec. The question variant renders the incomplete /
// in-progress visual; option figures are derived per letter by `pmaOptionFigure`
// so the page and the bank can never disagree about what an option looks like.
export type PmaFigure =
  | { style: 'matrix-sides'; nextSides?: number }
  | { style: 'dot-progression'; total: number; filled?: number }
  | { style: 'rotation-series'; rotateStepDeg?: number }
  | { style: 'single-mirrored'; mirror?: boolean; rotateDeg?: number; mirrorLine?: boolean }
  | { style: 'sequence-sides'; nextSides?: number };

export type PMAQuestion = {
  key: string;
  category: 'Verbal' | 'Non-Verbal' | 'Academic';
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  figure?: PmaFigure;
};

// For figure questions the option text is unused (options are rendered as SVG);
// each mapping below is the single deterministic expansion of the spec.
export function pmaOptionFigure(spec: PmaFigure): Record<'A' | 'B' | 'C' | 'D', PmaFigure> {
  switch (spec.style) {
    case 'matrix-sides':
      return {
        A: { ...spec, nextSides: 5 },
        B: { ...spec, nextSides: 4 },
        C: { ...spec, nextSides: 3 },
        D: { ...spec, nextSides: 0 },
      };
    case 'sequence-sides':
      return {
        A: { ...spec, nextSides: 6 },
        B: { ...spec, nextSides: 0 },
        C: { ...spec, nextSides: 4 },
        D: { ...spec, nextSides: 3 },
      };
    case 'dot-progression':
      return {
        A: { ...spec, filled: 4 },
        B: { ...spec, filled: 5 },
        C: { ...spec, filled: 6 },
        D: { ...spec, filled: 7 },
      };
    case 'rotation-series':
      // Option variant renders ONE arrow at a fixed absolute angle.
      return {
        A: { ...spec, rotateStepDeg: 135 },
        B: { ...spec, rotateStepDeg: 0 },
        C: { ...spec, rotateStepDeg: 90 },
        D: { ...spec, rotateStepDeg: 270 },
      };
    case 'single-mirrored':
      return {
        A: { ...spec, mirror: true, rotateDeg: 0, mirrorLine: false },
        B: { ...spec, mirror: false, rotateDeg: 0, mirrorLine: false },
        C: { ...spec, mirror: false, rotateDeg: 90, mirrorLine: false },
        D: { ...spec, mirror: false, rotateDeg: 180, mirrorLine: false },
      };
  }
}

export const PMA_QUESTIONS: PMAQuestion[] = [
  // --- VERBAL INTELLIGENCE ---
  {
    key: 'pma-v-001',
    category: 'Verbal',
    topic: 'Number Series',
    question_text: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
    option_a: '38',
    option_b: '40',
    option_c: '42',
    option_d: '46',
    correct_answer: 'C',
    explanation: 'Differences increase by 2 each time: +4, +6, +8, +10, so next is +12. 30 + 12 = 42.',
    difficulty: 'easy',
  },
  {
    key: 'pma-v-002',
    category: 'Verbal',
    topic: 'Alphabetical Series',
    question_text: 'Find the missing letters in the series: AZ, BY, CX, DW, ?',
    option_a: 'EV',
    option_b: 'EU',
    option_c: 'FX',
    option_d: 'FU',
    correct_answer: 'A',
    explanation: 'First letter advances by +1 (A, B, C, D, E), second letter moves backward by −1 (Z, Y, X, W, V). Result is EV.',
    difficulty: 'easy',
  },
  {
    key: 'pma-v-003',
    category: 'Verbal',
    topic: 'Coding & Decoding',
    question_text: 'If FISH is coded as HKVJ, how is BIRD coded in that same code?',
    option_a: 'DKTF',
    option_b: 'CJSE',
    option_c: 'DJTF',
    option_d: 'EKUG',
    correct_answer: 'A',
    explanation: 'Each letter shifts forward by 2: F→H, I→K, S→V, H→J. Applying the same shift to BIRD: B→D, I→K, R→T, D→F, giving DKTF.',
    difficulty: 'medium',
  },
  {
    key: 'pma-v-004',
    category: 'Verbal',
    topic: 'Analogies',
    question_text: 'SOLDIER : ARMY ::',
    option_a: 'Player : Team',
    option_b: 'Singer : Stage',
    option_c: 'Book : Library',
    option_d: 'Tree : Forest',
    correct_answer: 'A',
    explanation: 'A soldier is a member of an army. A player is a member of a sports team.',
    difficulty: 'easy',
  },
  {
    key: 'pma-v-005',
    category: 'Verbal',
    topic: 'Blood Relations',
    question_text: 'Pointing to a photograph, Ali said, "He is the son of the only daughter of my grandfather." How is the person in the photograph related to Ali?',
    option_a: 'Uncle',
    option_b: 'Brother',
    option_c: 'Cousin',
    option_d: 'Father',
    correct_answer: 'B',
    explanation: 'Only daughter of grandfather = mother or aunt. Son of mother = brother (or self). Since Ali says "the son", it refers to his brother.',
    difficulty: 'medium',
  },

  // --- NON-VERBAL INTELLIGENCE (SVG figures — original figures, drawn in components/pma/PmaFigure.tsx) ---
  {
    key: 'pma-nv-001',
    category: 'Non-Verbal',
    topic: 'Matrix Reasoning',
    question_text: 'In this 2×2 matrix, the shape in each row gains one side from left to right. Which option completes the matrix at the bottom-right?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: 'Top row: triangle (3 sides) → square (4 sides). The bottom row must follow the same rule: square (4 sides) → pentagon (5 sides), which is option A. B repeats the square, C drops back to a triangle, and D replaces it with a circle.',
    difficulty: 'medium',
    figure: { style: 'matrix-sides' },
  },
  {
    key: 'pma-nv-002',
    category: 'Non-Verbal',
    topic: 'Series Completion',
    question_text: 'Each frame in the series removes one filled dot. What does the next frame look like?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'B',
    explanation: 'The frame shows 8 dots with 6 filled. Removing one filled dot per step means the next frame has exactly 5 filled dots: option B. A removes two, C repeats the current frame unchanged, and D adds one.',
    difficulty: 'easy',
    figure: { style: 'dot-progression', total: 8, filled: 6 },
  },
  {
    key: 'pma-nv-003',
    category: 'Non-Verbal',
    topic: 'Series by Rotation',
    question_text: 'The arrow rotates 45° clockwise in each frame. Which option is the next frame in the series?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: 'The frames show the arrow at 0°, 45° and 90°. Continuing the 45° clockwise turn puts the next arrow at 135°: option A. B returns to 0°, C repeats 90°, and D points at 270°.',
    difficulty: 'medium',
    figure: { style: 'rotation-series' },
  },
  {
    key: 'pma-nv-004',
    category: 'Non-Verbal',
    topic: 'Mirror Images',
    question_text: 'Select the mirror image of this flag when the mirror is placed on the dashed line.',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: 'A vertical mirror flips left and right, so the pennant moves from the right of the pole to the left while staying at the top: option A. B is the original, unmirrored flag, C is rotated 90°, and D is rotated 180° — rotation is not reflection.',
    difficulty: 'medium',
    figure: { style: 'single-mirrored', mirrorLine: true },
  },
  {
    key: 'pma-nv-005',
    category: 'Non-Verbal',
    topic: 'Polygon Series',
    question_text: 'Each shape in the series gains one side. Which shape comes next?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: 'The series runs 3 → 4 → 5 sides, so the next shape has 6 sides: the hexagon in option A. B is a circle, C a square, and D a triangle.',
    difficulty: 'easy',
    figure: { style: 'sequence-sides' },
  },

  // --- ACADEMIC SECTION ---
  {
    key: 'pma-a-001',
    category: 'Academic',
    topic: 'Pakistan Studies',
    question_text: 'When was the Objectives Resolution passed by the Constituent Assembly of Pakistan?',
    option_a: '12 March 1949',
    option_b: '14 August 1947',
    option_c: '23 March 1956',
    option_d: '11 October 1950',
    correct_answer: 'A',
    explanation: 'The Objectives Resolution was passed on 12 March 1949 under the leadership of Liaquat Ali Khan.',
    difficulty: 'medium',
  },
  {
    key: 'pma-a-002',
    category: 'Academic',
    topic: 'Islamic Studies',
    question_text: 'How many Ghazwat (battles in which the Holy Prophet ﷺ directly participated) were fought?',
    option_a: '19',
    option_b: '27',
    option_c: '31',
    option_d: '12',
    correct_answer: 'B',
    explanation: 'A total of 27 Ghazwat were fought under the direct leadership of Prophet Muhammad (ﷺ).',
    difficulty: 'easy',
  },
  {
    key: 'pma-a-003',
    category: 'Academic',
    topic: 'General Knowledge',
    question_text: 'What is the longest glacier in Pakistan outside the polar regions?',
    option_a: 'Batura Glacier',
    option_b: 'Baltoro Glacier',
    option_c: 'Siachen Glacier',
    option_d: 'Hispar Glacier',
    correct_answer: 'C',
    explanation: 'Siachen Glacier is the longest glacier in the Karakoram and second-longest in world\'s non-polar areas (approx 76 km).',
    difficulty: 'easy',
  },
  {
    key: 'pma-a-004',
    category: 'Academic',
    topic: 'Basic Mathematics',
    question_text: 'What is the angle of a semi-circle?',
    option_a: '90°',
    option_b: '180°',
    option_c: '270°',
    option_d: '360°',
    correct_answer: 'B',
    explanation: 'A full circle is 360°, therefore a semi-circle measures 180° (a straight angle).',
    difficulty: 'easy',
  },
  {
    key: 'pma-a-005',
    category: 'Academic',
    topic: 'English Grammar',
    question_text: 'Choose the correct passive voice: "The chef cooked a delicious meal."',
    option_a: 'A delicious meal was cooked by the chef.',
    option_b: 'A delicious meal is cooked by the chef.',
    option_c: 'A delicious meal has been cooked by the chef.',
    option_d: 'The chef was cooking a delicious meal.',
    correct_answer: 'A',
    explanation: 'Simple past tense active ("cooked") becomes "was/were + past participle" in passive ("was cooked").',
    difficulty: 'easy',
  },
];
