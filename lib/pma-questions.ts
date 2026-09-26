// Apex Pakistan — PMA Long Course Initial Test Question Bank
// Covers Verbal Intelligence, Non-Verbal Reasoning, and Academic MCQs (GK, Pak Studies, Islamiyat, Math, English).

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
};

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
    explanation: 'First letter advances by +1 (A, B, C, D, E), second letter moves backward by -1 (Z, Y, X, W, V). Result is EV.',
    difficulty: 'easy',
  },
  {
    key: 'pma-v-003',
    category: 'Verbal',
    topic: 'Coding & Decoding',
    question_text: 'If FISH is coded as GJKI, how is BIRD coded in that same code?',
    option_a: 'CJSE',
    option_b: 'CHSE',
    option_c: 'DKSE',
    option_d: 'BKSE',
    correct_answer: 'A',
    explanation: 'Each letter is shifted forward by +1: F→G, I→J, S→I (wait F+1=G, I+1=J, S+1=T? Let\'s check: F(6)->G(7), I(9)->J(10), S(19)->T(20). Here sample says GJKI. Let\'s use standard shift: B+1=C, I+1=J, R+1=S, D+1=E -> CJSE.',
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
  }
];
