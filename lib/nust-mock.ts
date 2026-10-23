// The NUST NET-Engineering mock paper — a timed simulation assembled from the
// bundled NET bank (lib/nust-questions.ts), so /dashboard/mock-test mirrors
// the same per-test switching the practice chooser already does for the
// engineering portal: a student preparing for NUST NET gets a NET-pattern
// paper, not a PMDC-weighted one.
//
// Pattern facts, verified on NUST's OWN pages on 2026-10-24 (roadmap rule:
// official or nothing):
//   • "There are total 200 MCQs to be attempted in three hours (180 minutes)."
//     — https://nust.edu.pk/faqs/
//   • NET-Engineering subject weighting: Mathematics 50% · Physics 30% ·
//     English 20% —
//     https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings/
//   • "No, there is no negative marking." — NUST FAQs
//   • Chemistry, Computer Science and Intelligence are NOT sections of the
//     official NET-Engineering paper; the coaching-site split that adds them
//     (Chem 15% / IQ 5%) contradicts the official page and is ignored here.
// NUST publishes the weighting as PERCENTAGES, not per-subject MCQ counts, so
// the counts below descend from the official split (50/30/20 of the 200-MCQ
// paper) — nothing is invented.
//
// The bank holds 81 questions (not the paper's 200), so assembly takes UP TO
// each section's official-paper share and clamps a thin subject to a thinner
// section rather than fabricating or padding. The card on the setup page says
// the shortfall out loud. Pacing is preserved at the paper's own rate
// (180 min / 200 MCQs), so the practice always runs at real NET time pressure.

import { shuffleQuestions } from "./questions-repo";
import { toQuizQuestion, type QuizQuestion } from "./questions";
import type { NUSTQuestion } from "./nust-questions";

/** The real NET-Engineering paper, as NUST publishes it. */
export const NET_PAPER = {
  mcqs: 200,
  minutes: 180,
  negativeMarking: false,
} as const;

/** Official subject weighting of NET-Engineering (percent of the 200 MCQs). */
export const NET_WEIGHTING = [
  { subject: "Mathematics", pct: 50 },
  { subject: "Physics", pct: 30 },
  { subject: "English", pct: 20 },
] as const;

/** That weighting as MCQ counts on the full paper: 100 / 60 / 40 = 200. */
export const NET_PAPER_SPLIT = NET_WEIGHTING.map(({ subject, pct }) => ({
  subject,
  count: Math.round((pct / 100) * NET_PAPER.mcqs),
}));

/** One section's worth of the real paper. */
export const netPaperSectionCount = (subject: string): number =>
  NET_PAPER_SPLIT.find((s) => s.subject === subject)?.count ?? 0;

/**
 * The sections our scaled paper actually runs: each official-paper share
 * clamped to what the bank holds for that subject. Chemistry questions exist
 * in the bank for the GIKI/LUMS surfaces, but the official NET-Engineering
 * paper has no Chemistry section, so it is never assembled into this mock.
 */
export function buildNetMockSections(
  bank: readonly NUSTQuestion[]
): { subject: string; count: number }[] {
  return NET_PAPER_SPLIT.map(({ subject, count }) => ({
    subject,
    count: Math.min(
      count,
      bank.filter((q) => q.subject === subject).length
    ),
  }));
}

/**
 * Build one NET-Engineering paper: per section, take the official paper's
 * share of that subject's questions from the bank, shuffled within the
 * section, clamped to the pool. Every run reshuffles, so no two attempts
 * share a sequence.
 */
export function buildNetMockPaper(
  bank: readonly NUSTQuestion[]
): QuizQuestion[] {
  const paper: QuizQuestion[] = [];
  for (const { subject, count } of buildNetMockSections(bank)) {
    const pool = bank.filter((q) => q.subject === subject);
    const chosen = shuffleQuestions(pool).slice(0, count);
    paper.push(...chosen.map((q) => toQuizQuestion(q)));
  }
  return paper;
}

/**
 * Duration for the scaled paper at the real paper's pacing
 * (180 min / 200 MCQs = 0.9 min per question), rounded to the minute.
 */
export function netMockMinutes(bank: readonly NUSTQuestion[]): number {
  const total = buildNetMockSections(bank).reduce((sum, s) => sum + s.count, 0);
  return Math.round((total / NET_PAPER.mcqs) * NET_PAPER.minutes);
}
