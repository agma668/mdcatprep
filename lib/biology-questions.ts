export type ResourceQuestion = {
  key: string
  subject: string
  topic: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  source: string
}

export const BIOLOGY_QUESTIONS: ResourceQuestion[] = [];
