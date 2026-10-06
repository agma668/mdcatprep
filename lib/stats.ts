/**
 * The one owner of every count the product displays.
 *
 * Each figure used to have its own literal somewhere — the hero's MCQ floor was
 * a hardcoded `850`, the FAQ claimed "over 2,000 questions parsed", and the
 * hero's subjects/total came from a live `questions` query while the `/past-papers`
 * page counted the bundled bank for itself. That is how two surfaces end up
 * disagreeing in public. Now they all read this file.
 *
 * Rules this file exists to enforce:
 *   1. Content figures are DERIVED, never written down. `BANK_TOTAL` is the
 *      bank's actual length, so adding a question updates every surface at once
 *      and the number can never drift from what students can actually practise.
 *   2. `BANK_BY_SECTION` sums to exactly `BANK_TOTAL`. A breakdown that does not
 *      add up to its own total is worse than no breakdown.
 *   3. Figures that are a product property (not a database reading) do not
 *      depend on the DB, so they render identically whether or not Supabase is
 *      reachable — there is no separate "fallback" copy of them to go stale.
 *
 * SERVER-ONLY. Importing this from a client component would pull the entire
 * question bank into the browser bundle — pass numbers down as props instead.
 */

import { MDCAT_QUESTIONS, MDCAT_SUBJECTS } from "@/lib/mdcat";
import { COLLEGES } from "@/lib/college-list";
import type { ExamBank } from "@/lib/exams-config";
import { NUST_NET_BANK } from "@/lib/nust-questions";
import { PMA_QUESTIONS } from "@/lib/pma-questions";
import { USAT_ELITE_BANK } from "@/lib/usat-comprehensive-bank";

export type SectionStat = { name: string; count: number };

/** Real size of the bank students can practise — derived, never hardcoded. */
export const BANK_TOTAL: number = MDCAT_QUESTIONS.length;

/**
 * Per-section counts, in the canonical syllabus order. Any subject present in
 * the bank but missing from `MDCAT_SUBJECTS` is appended rather than dropped,
 * so the counts always sum to `BANK_TOTAL` exactly.
 */
export const BANK_BY_SECTION: readonly SectionStat[] = (() => {
  const counts = new Map<string, number>();
  for (const q of MDCAT_QUESTIONS) counts.set(q.subject, (counts.get(q.subject) ?? 0) + 1);

  const canonical = MDCAT_SUBJECTS.map((s) => s.name as string).filter((n) => counts.has(n));
  const extra = [...counts.keys()].filter((n) => !canonical.includes(n)).sort();

  return [...canonical, ...extra].map((name) => ({ name, count: counts.get(name) ?? 0 }));
})();

/** Number of sections the bank actually covers. */
export const BANK_SECTION_COUNT: number = BANK_BY_SECTION.length;

/**
 * One real bank size per portal (ids match ExamBank in lib/exams-config.ts).
 * The portal pages render these instead of hand-typed subject counts, so a
 * question added to any bank updates the portals automatically and a portal
 * can never again advertise "220+ MCQs" the bank does not hold. The medical
 * portal serves the whole MDCAT bank; the others serve their own arrays.
 */
export const PORTAL_BANK_COUNTS: Record<ExamBank, number> = {
  mdcat: MDCAT_QUESTIONS.length,
  nust: NUST_NET_BANK.length,
  pma: PMA_QUESTIONS.length,
  usat: USAT_ELITE_BANK.length,
};

/** Colleges in the directory the product covers. */
export const COLLEGE_COUNT: number = COLLEGES.length;

/**
 * Community size shown on public surfaces.
 *
 * This is a deliberate DISPLAY BASELINE, not a query result: the founder asked
 * for a credible minimum so a young platform does not advertise "3 students".
 * It is a floor, never a cap — once the real approved-student count passes it,
 * the real number wins. Activity figures (questions answered, accuracy) are
 * NEVER floored; only this one headcount is.
 */
export const COMMUNITY_BASELINE = 900;

/** Real approved students, raised to the baseline. Null/unknown → the baseline. */
export function communitySize(realStudents?: number | null): number {
  const real = typeof realStudents === "number" && Number.isFinite(realStudents) ? realStudents : 0;
  return Math.max(COMMUNITY_BASELINE, real);
}

/**
 * Size of the analysis corpus behind the high-yield notes — a real figure about
 * how many past-paper questions the notes were distilled from. Distinct from
 * `BANK_TOTAL` on purpose: it describes the research input, not the practice
 * bank, and the two must not be conflated on the page.
 */
export const ANALYSIS_CORPUS = 2000;

/**
 * One number formatter, so "2,000" is spelled the same everywhere. An explicit
 * locale matters: a bare `toLocaleString()` renders differently depending on the
 * server's locale, which would make the same figure look different in two
 * environments.
 */
export function formatStat(n: number): string {
  return n.toLocaleString("en-US");
}
