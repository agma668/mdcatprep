/**
 * Data access + result computation for student duels — the single owner of
 * the duels tables' read shape and the scoring policy, mirroring how
 * `lib/questions-repo.ts` owns the question bank.
 *
 * Ownership split:
 *  - THIS module: canonical row shapes, fetch helpers (any client — callers
 *    pass the session client so RLS gates reads/writes, or the service client
 *    for profile lookups), the 48h expiry, and the pure winner computation.
 *  - `app/actions/duels.ts`: the server actions that validate intent (who may
 *    challenge whom, what may be submitted) and route answers through the
 *    shared `recordAttempt` path.
 *  - UI surfaces (inbox card, challenge affordance, play page): thin renders
 *    over the actions — planned, not built in this pass.
 *
 * The result is never stored: winner = more correct answers, tie -> lower
 * total time spent, still tied -> draw. All derived from duel_answers at read
 * time, so there is exactly one source of truth and no snapshot to drift.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { toQuizQuestion, type QuestionLike, type QuizQuestion } from "./questions";
import { QUESTION_ROW_COLUMNS } from "./questions-repo";
import {
  computeDuelResult as computeDuelResultCore,
  duelHasResult as duelHasResultCore,
  duelMsLeft as duelMsLeftCore,
  isDuelExpired as isDuelExpiredCore,
} from "./duels-math.mjs";

/** How many questions a duel is drawn with. Mirrors the migration's check
 *  constraint — a duel can only be created with a set of this exact size. */
export { DUEL_QUESTION_COUNT, DUEL_TTL_MS } from "./duels-math.mjs";

export type DuelStatus = "pending" | "completed";

/** Raw row shape of public.duels. */
export interface DuelRow {
  id: string;
  challenger_id: string;
  opponent_id: string;
  subject: string;
  question_ids: string[];
  status: DuelStatus;
  challenger_finished_at: string | null;
  opponent_finished_at: string | null;
  created_at: string;
}

/** Raw row shape of public.duel_answers. */
export interface DuelAnswerRow {
  id: string;
  duel_id: string;
  student_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_spent_seconds: number | null;
  created_at: string;
}

export const DUEL_ROW_COLUMNS =
  "id, challenger_id, opponent_id, subject, question_ids, status, challenger_finished_at, opponent_finished_at, created_at";

export const DUEL_ANSWER_ROW_COLUMNS =
  "id, duel_id, student_id, question_id, selected_answer, is_correct, time_spent_seconds, created_at";

/** Fetch a duel row by id (null when missing). */
export async function fetchDuelById(
  db: SupabaseClient,
  duelId: string
): Promise<DuelRow | null> {
  const { data, error } = await db.from("duels").select(DUEL_ROW_COLUMNS).eq("id", duelId).maybeSingle();
  if (error) {
    console.error("fetchDuelById:", error.message);
    return null;
  }
  return data as DuelRow | null;
}

/** Fetch every answer row for a duel. */
export async function fetchDuelAnswers(
  db: SupabaseClient,
  duelId: string
): Promise<DuelAnswerRow[]> {
  const { data, error } = await db
    .from("duel_answers")
    .select(DUEL_ANSWER_ROW_COLUMNS)
    .eq("duel_id", duelId);
  if (error) {
    console.error("fetchDuelAnswers:", error.message);
    return [];
  }
  return (data ?? []) as DuelAnswerRow[];
}

/** Fetch the frozen question set by id (published rows only). */
export async function fetchQuestionsByIds(
  db: SupabaseClient,
  ids: string[]
): Promise<QuizQuestion[]> {
  if (ids.length === 0) return [];
  const { data, error } = await db
    .from("questions")
    .select(QUESTION_ROW_COLUMNS)
    .in("id", ids)
    .eq("status", "published");
  if (error) {
    console.error("fetchQuestionsByIds:", error.message);
    return [];
  }
  return (data ?? []).map((row) => toQuizQuestion(row as QuestionLike));
}

/** A duel is expired when it is still pending 48h after creation. */
export function isDuelExpired(
  duel: Pick<DuelRow, "status" | "created_at">,
  now: number = Date.now()
): boolean {
  return isDuelExpiredCore(duel, now);
}

/** Milliseconds left before a pending duel expires (negative when past due). */
export function duelMsLeft(
  duel: Pick<DuelRow, "created_at">,
  now: number = Date.now()
): number {
  return duelMsLeftCore(duel, now);
}

export interface DuelPlayerResult {
  studentId: string;
  /** Correct answers out of the set size. */
  score: number;
  /** Total time spent answering, in seconds (0 when unanswered). */
  timeSeconds: number;
  answeredCount: number;
}

export type DuelWinner = "challenger" | "opponent" | "draw" | null;

export interface DuelResult {
  challenger: DuelPlayerResult;
  opponent: DuelPlayerResult;
  /** A terminal result exists: both players finished their 10, OR the duel is
   *  a forfeit (see below). Until then the duel is live/waiting. */
  complete: boolean;
  /** True when this result is a FORFEIT: one side finished all 10 and the
   *  other lapsed past the 48h expiry — the finisher wins. The lapsed side's
   *  numbers show what they actually answered. Derived at read time; nothing
   *  is written and the stored status stays 'pending' (the trigger requires
   *  both finish timestamps for a stored 'completed'). */
  forfeit: boolean;
  /** null until complete. */
  winner: DuelWinner;
}

/**
 * The one scoring definition: score (correct count), tie -> total time spent
 * answering (seconds), still tied -> draw; when the challenge lapsed with
 * exactly one side finished, that side wins by forfeit. Pure — takes the rows
 * and returns the result, so the play page, inbox, and any future surfaces
 * cannot drift. (Forfeit derives from the duel's own expiry — an optional
 * `now` is accepted for deterministic callers/tests.)
 */
export function computeDuelResult(
  duel: Pick<DuelRow, "challenger_id" | "opponent_id" | "status" | "created_at">,
  answers: DuelAnswerRow[],
  now: number = Date.now()
): DuelResult {
  return computeDuelResultCore(duel, answers, now) as DuelResult;
}

/**
 * A duel has a terminal result when it completed head-to-head OR it lapsed
 * with exactly one side finished (forfeit — the finisher wins by default).
 * Gates rematch and the inbox's "is this over?" decision so a forfeit duel is
 * treated as done even though its stored status is still 'pending'.
 */
export function duelHasResult(duel: DuelRow, now: number = Date.now()): boolean {
  return duelHasResultCore(duel, now);
}
