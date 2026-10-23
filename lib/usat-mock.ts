// The HEC USAT-M mock paper — the timed 100-MCQ / 100-minute simulation of the
// Balochistan / ex-FATA scholarship variant, assembled from the bundled USAT
// bank (lib/usat-comprehensive-bank.ts). Lives beside the MDCAT-weighted mock
// formats in /dashboard/mock-test so the mock-test surface mirrors the same
// per-test bank switching the practice chooser already does: a USAT student
// gets their own paper, not the PMDC one.
//
// The split below is NOT a bank statistic — it is the official paper's own
// Content-Weightages (documented in docs/HEC-USAT-M-ANALYSIS.md and already
// named on the USAT practice panel), so writing it down is honest. The bank's
// per-subject sizes are never written here; assembly takes up to `count` per
// subject from whatever the bank actually holds, so a thin subject yields a
// thinner section rather than a fabricated one.

import { shuffleQuestions } from "./questions-repo";
import { toQuizQuestion, type QuizQuestion } from "./questions";
import type { USATEliteQuestion } from "./usat-comprehensive-bank";

/**
 * Official section split of the scholarship-variant paper: Verbal 26 ·
 * Quantitative 32 · Physics 11 · Chemistry 11 · Biology 20 = 100 MCQs, in the
 * paper's own section order.
 */
export const USAT_MOCK_SPLIT = [
  { subject: "Verbal", count: 26 },
  { subject: "Quantitative", count: 32 },
  { subject: "Physics", count: 11 },
  { subject: "Chemistry", count: 11 },
  { subject: "Biology", count: 20 },
] as const;

export const USAT_MOCK_TOTAL: number = USAT_MOCK_SPLIT.reduce(
  (sum, s) => sum + s.count,
  0
);

export const USAT_MOCK_MINUTES = 100;

/**
 * Build one USAT-M paper: per section, take the split's worth of that
 * subject's questions from the bank, shuffled within the section. Sections
 * keep the real paper's order. Every run shuffles again, so a student can
 * never memorise the sequence between attempts.
 */
export function buildUsatMockPaper(
  bank: readonly USATEliteQuestion[]
): QuizQuestion[] {
  const paper: QuizQuestion[] = [];
  for (const { subject, count } of USAT_MOCK_SPLIT) {
    const pool = bank.filter((q) => q.subject === subject);
    const chosen = shuffleQuestions(pool).slice(0, Math.min(count, pool.length));
    paper.push(...chosen.map((q) => toQuizQuestion(q)));
  }
  return paper;
}
