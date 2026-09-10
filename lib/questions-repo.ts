/**
 * Data access for the published question bank. Every surface used to hand-roll
 * the same select over the `questions` table (the column list drifted across
 * eight call sites) and re-implemented the `status = 'published'` gate plus a
 * per-subject quota/fill loop (mock-test assembly, diagnostic quiz). This
 * module is the single owner of that read shape and those assembly policies:
 *
 *   - add a column here and every reader speaks the new schema;
 *   - change the publish gate here and every reader respects it;
 *   - the quota + fill + shuffle composition lives here, not in page files.
 *
 * Model types live in `lib/questions.ts` (pure shape + option helpers); this
 * module owns only *fetching and assembly* and stays free of rendering
 * concerns. Answer recording stays in the server actions — data in, data out.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { toQuizQuestion, type QuestionLike, type QuizQuestion } from "./questions";

/**
 * Canonical column list for reading a question row. Includes every field any
 * surface renders or records (topic, explanation, difficulty, college) so all
 * readers speak one schema.
 */
export const QUESTION_ROW_COLUMNS =
  "id, subject, topic, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, college";

/** Shape of the raw row returned by question queries. */
export type QuestionRow = {
  id: string | null;
  subject: string | null;
  topic: string | null;
  question_text: string | null;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  explanation: string | null;
  difficulty: string | null;
  college: string | null;
};

/**
 * Fetch published question rows, newest first, with an optional subject
 * filter. Accepts either the RLS session client (server components) or the
 * service client — callers pass whichever they already hold.
 */
export async function fetchPublishedQuestions(
  db: SupabaseClient,
  options: { subject?: string; limit?: number } = {}
): Promise<QuizQuestion[]> {
  let query = db
    .from("questions")
    .select(QUESTION_ROW_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (options.subject) query = query.eq("subject", options.subject);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("fetchPublishedQuestions:", error.message);
    return [];
  }
  return (data ?? []).map((row) => toQuizQuestion(row as QuestionLike));
}

/**
 * Top up `picked` from the general published pool until it holds `target`
 * distinct questions. Used by the quota assembly paths when a subject pool is
 * thinner than the session wants.
 */
export async function fillQuestions(
  db: SupabaseClient,
  picked: QuizQuestion[],
  target: number,
  fillLimit = 150
): Promise<QuizQuestion[]> {
  if (picked.length >= target) return picked;
  const have = new Set(picked.map((q) => q.id).filter((id): id is string => !!id));
  const filler = await fetchPublishedQuestions(db, { limit: fillLimit });
  const out: QuizQuestion[] = [...picked];
  for (const q of filler) {
    if (out.length >= target) break;
    if (q.id && have.has(q.id)) continue;
    out.push(q);
    if (q.id) have.add(q.id);
  }
  return out;
}

/**
 * Fetch a balanced spread: `perSubject` published rows from each subject,
 * topped up from the general pool when a subject is thin (a `null` subject in
 * the list means "any subject"). The diagnostic quiz and mock-test assembly
 * used to re-implement this loop independently.
 */
export async function fetchSubjectQuota(
  db: SupabaseClient,
  subjects: (string | null)[],
  perSubject: number,
  fillLimit = 150
): Promise<QuizQuestion[]> {
  const perSubjectSets = await Promise.all(
    subjects.map((subject) =>
      fetchPublishedQuestions(db, subject ? { subject, limit: perSubject } : { limit: perSubject })
    )
  );
  const combined: QuizQuestion[] = [];
  for (const set of perSubjectSets) combined.push(...set);
  return fillQuestions(db, combined, subjects.length * perSubject, fillLimit);
}

/** Shuffle a question set (Fisher–Yates); returns a new array. */
export function shuffleQuestions<T>(questions: T[]): T[] {
  const arr = [...questions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
