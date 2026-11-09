// The military practice papers — a timed pattern simulation of the PMA Long Course
// initial-test paper and a focused Verbal/Non-Verbal reasoning drill. The latter
// is not a simulation of the ISSB selection process. Both use the bundled PMA bank
// (lib/pma-questions.ts). Lives beside the scholarship and NET
// formats in /dashboard/mock-test so the mock-test surface mirrors the same
// per-test switching the practice chooser already does for the military
// portal: a PMA Long Course student gets the three-section paper, an ISSB
// student gets the intelligence sections only.
//
// Pattern facts, checked on 2026-10-24 (roadmap rule: official or nothing):
//   • joinpakarmy.gov.pk publishes no written-test breakdown at all — no
//     section list, no question counts, no timings, no marking rule.
//   • issb.gov.pk describes the four-day ISSB assessment (psychologists,
//     GTOs, deputy presidents), not a written paper either.
//   • The section NAMES — Verbal Intelligence · Non-Verbal Intelligence ·
//     Academic — are the pattern every preparation source agrees the initial
//     test runs; the academic spread (English, basic Mathematics, Pakistan
//     Studies, Islamic Studies, General Knowledge) matches what the bank
//     actually holds. Coaching sites' question counts (84/64/50 and friends)
//     disagree with each other, so no counts are treated as official.
//
// Therefore this is an ORIGINAL paper-style simulation, the same honesty the
// PMA practice page states out loud: sections named after the widely reported
// pattern, scaled to the bank (41 questions), clocked at OUR OWN pacing —
// never labelled as an official paper. The setup card says all of it.

import { shuffleQuestions } from "./questions-repo";
import { toQuizQuestion, type QuizQuestion } from "./questions";
import {
  PMA_QUESTIONS,
  pmaOptionFigure,
  type PMAQuestion,
  type PmaFigure,
} from "./pma-questions";

/** Which mock the assembly builds. */
export type PmaMockVariant = "pma" | "issb";

/**
 * The paper's section order, as the initial-test pattern is reported. Counts
 * are the bank's own per-category sizes — the paper runs the whole pool,
 * clamped the same way as every mock assembly elsewhere on the surface.
 */
export const PMA_MOCK_SPLIT = [
  { category: "Verbal", count: 20 },
  { category: "Non-Verbal", count: 10 },
  { category: "Academic", count: 11 },
] as const;

/** Sections included in the limited Verbal/Non-Verbal reasoning drill. */
const ISSB_CATEGORIES = ["Verbal", "Non-Verbal"] as const;

/** Our own pacing, in minutes per question — never claimed as official. */
export const PMA_PACING: Record<string, number> = {
  Verbal: 0.75,
  "Non-Verbal": 1,
  Academic: 1,
};

const categoriesFor = (variant: PmaMockVariant): readonly string[] =>
  variant === "pma" ? PMA_MOCK_SPLIT.map((s) => s.category) : ISSB_CATEGORIES;

/** Per-section sizes for a variant, each clamped to what the bank holds. */
export function buildPmaMockSections(
  bank: readonly PMAQuestion[],
  variant: PmaMockVariant = "pma"
): { category: string; count: number }[] {
  return PMA_MOCK_SPLIT.map(({ category, count }) => ({
    category,
    count: Math.min(
      count,
      bank.filter((q) => q.category === category).length
    ),
  })).filter((s) => categoriesFor(variant).includes(s.category));
}

/** Total clock for a variant at our pacing, rounded to the minute. */
export function pmaMockMinutes(
  bank: readonly PMAQuestion[],
  variant: PmaMockVariant = "pma"
): number {
  const total = buildPmaMockSections(bank, variant).reduce(
    (sum, s) => sum + s.count * (PMA_PACING[s.category] ?? 1),
    0
  );
  return Math.round(total);
}

/**
 * Build one practice set: per section, the split's worth of that category's
 * questions from the bank, shuffled within the section. The 'issb' variant is
 * only a legacy internal name for the limited Verbal/Non-Verbal drill; it does
 * not represent the official ISSB selection process. Every run reshuffles.
 */
export function buildPmaMockPaper(
  bank: readonly PMAQuestion[],
  variant: PmaMockVariant = "pma"
): QuizQuestion[] {
  const paper: QuizQuestion[] = [];
  for (const { category, count } of buildPmaMockSections(bank, variant)) {
    const pool = bank.filter((q) => q.category === category);
    const chosen = shuffleQuestions(pool).slice(0, count);
    paper.push(...chosen.map(toQuizAdapted));
  }
  return paper;
}

/**
 * The PMA questions carry a `subject`-shaped `category`, and the
 * non-verbal figures carry EMPTY option text — options are SVG figures
 * derived per letter by `pmaOptionFigure`, never rows of text. The adapter
 * nulls those empty fields so the shared option rows skip them (as they do
 * any absent option), and `pmaFigureOf` hands the player the figure spec.
 */
function toQuizAdapted(q: PMAQuestion): QuizQuestion {
  const adapted = toQuizQuestion({
    key: q.key,
    subject: q.category,
    topic: q.topic,
    question_text: q.question_text,
    option_a: q.option_a || null,
    option_b: q.option_b || null,
    option_c: q.option_c || null,
    option_d: q.option_d || null,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
  });
  return adapted;
}

export type PmaFigurePair = {
  stem: PmaFigure;
  options: Record<"A" | "B" | "C" | "D", PmaFigure>;
};

// Key → figure pair, one map so every paper built here reads the same specs
// the practice page renders — page and mock can never disagree.
const FIGURE_MAP = new Map<string, PmaFigurePair>();
for (const q of PMA_QUESTIONS) {
  if (q.figure) {
    FIGURE_MAP.set(q.key, { stem: q.figure, options: pmaOptionFigure(q.figure) });
  }
}

/** The figure pair for an adapted paper question, or null for text options. */
export function pmaFigureOf(q: QuizQuestion): PmaFigurePair | null {
  return (q.key && FIGURE_MAP.get(q.key)) || null;
}
