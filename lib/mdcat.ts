// MDCAT bank aggregator for the MED Prep site.
// Combines the four PMDC MDCAT question banks (Biology, Chemistry, Physics,
// English) into a single export served by the practice session, plus a
// canonical subject list for the practice chooser.
//
// Same ResourceQuestion shape as the shared practice UI renders — no schema
// change needed at the data seam. (Inlined here so the bank stays self-contained and independent of unrelated site resources.)

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
  college?: string
  /**
   * Real past paper this question came from, when it came from one.
   *
   * Optional on purpose: the bundled banks are original exam-style writing, so
   * they leave it unset. Set it only for a question genuinely taken from the
   * paper named in lib/past-papers.ts — never as a stylistic flourish.
   */
  pastPaper?: { exam: string; year: number; code?: string }
}
import { BIOLOGY_QUESTIONS } from './biology-questions.ts'
import { CHEMISTRY_QUESTIONS } from './chemistry-questions.ts'
import { PHYSICS_QUESTIONS } from './physics-questions.ts'
import { ENGLISH_QUESTIONS } from './english-questions.ts'
import { PAST_PAPER_BANK } from './past-paper-bank.ts'

export const MDCAT_QUESTIONS: ResourceQuestion[] = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...PAST_PAPER_BANK,
]

/** Canonical MDCAT subject list for the practice chooser and notes pages. */
export const MDCAT_SUBJECTS = [
  { name: 'Biology', icon: '🧬' },
  { name: 'Chemistry', icon: '⚗️' },
  { name: 'Physics', icon: '⚛️' },
  { name: 'English', icon: '📖' },
  { name: 'Logical Reasoning', icon: '🧠' },
] as const

export const MDCAT_SUBJECT_NAMES: readonly string[] = MDCAT_SUBJECTS.map(s => s.name)

/** Counts of the bundled MDCAT bank per subject (for honest chooser cards). */
export const MDCAT_BANK_COUNTS: Record<string, number> = MDCAT_QUESTIONS.reduce(
  (acc, q) => {
    const s = q.subject
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>
)