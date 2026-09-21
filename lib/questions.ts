/**
 * Canonical question model for every question surface (practice sessions,
 * mock tests, academy drills, the daily quiz). Consumers used to each declare
 * their own copy of this shape — keep it in one place so a schema change is
 * one edit, and so option rows render from a single vocabulary.
 *
 * Required fields mirror the Supabase `questions` table's NOT NULL columns;
 * optional/nullable fields are the columns that can be empty or that bundled
 * questions (lib/resources.ts, which carry a `key` instead of a DB `id`)
 * don't always set.
 */

export type QuizQuestion = {
  /** DB row id — present on questions from the Supabase bank. */
  id?: string;
  /** Stable key — present on bundled questions (lib/resources.ts). */
  key?: string;
  subject: string;
  topic: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: string | null;
  college: string | null;
  /**
   * Past-paper provenance, when the question genuinely came from a real paper.
   * Null for original exam-style questions — a year is never invented, and an
   * absent year is shown as nothing rather than guessed at.
   */
  past_paper_exam?: string | null;
  past_paper_year?: number | null;
  past_paper_section?: string | null;
};

/** Anything question-shaped (optional or null fields are tolerated). */
export type QuestionLike = Partial<{ [K in keyof QuizQuestion]: QuizQuestion[K] | null }>;

/**
 * Adapt any question-shaped object to the canonical shape at a data seam
 * (typed Supabase rows whose local interfaces over-narrow text columns, or
 * bundled objects whose optional fields disagree with the row shape).
 */
export function toQuizQuestion(q: QuestionLike): QuizQuestion {
  return {
    id: typeof q.id === "string" ? q.id : undefined,
    key: typeof q.key === "string" ? q.key : undefined,
    subject: typeof q.subject === "string" ? q.subject : "",
    topic: typeof q.topic === "string" ? q.topic : null,
    question_text: typeof q.question_text === "string" ? q.question_text : "",
    option_a: typeof q.option_a === "string" ? q.option_a : "",
    option_b: typeof q.option_b === "string" ? q.option_b : "",
    option_c: typeof q.option_c === "string" ? q.option_c : null,
    option_d: typeof q.option_d === "string" ? q.option_d : null,
    correct_answer: typeof q.correct_answer === "string" ? q.correct_answer : "",
    explanation: typeof q.explanation === "string" ? q.explanation : null,
    difficulty: typeof q.difficulty === "string" ? q.difficulty : null,
    college: typeof q.college === "string" ? q.college : null,
    past_paper_exam: typeof q.past_paper_exam === "string" ? q.past_paper_exam : null,
    past_paper_year: typeof q.past_paper_year === "number" ? q.past_paper_year : null,
    past_paper_section: typeof q.past_paper_section === "string" ? q.past_paper_section : null,
  };
}

/**
 * "UHS MDCAT 2025 · Code D" for a question tagged to a past paper, or null when
 * the question is original and carries no year. One formatter so every surface
 * phrases provenance the same way.
 */
export function pastPaperTag(q: QuestionLike): string | null {
  if (typeof q.past_paper_exam !== "string" || !q.past_paper_exam) return null
  const year = typeof q.past_paper_year === "number" ? ` ${q.past_paper_year}` : ""
  const section =
    typeof q.past_paper_section === "string" && q.past_paper_section ? ` · ${q.past_paper_section}` : ""
  return `${q.past_paper_exam}${year}${section}`
}

/** Canonical model for questions that always come from the DB bank. */
export type BankQuestion = QuizQuestion & { id: string };

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;
export type OptionLetter = (typeof OPTION_LETTERS)[number];

/** Text of the option a letter points at (null when the option is absent). */
export function optionText(q: QuizQuestion, letter: OptionLetter): string | null {
  switch (letter) {
    case "A":
      return q.option_a;
    case "B":
      return q.option_b;
    case "C":
      return q.option_c;
    case "D":
      return q.option_d;
  }
}

/** Letters that actually have an option on this question (A/B always exist). */
export function availableOptionLetters(q: QuizQuestion): OptionLetter[] {
  return OPTION_LETTERS.filter((l) => optionText(q, l) !== null);
}
