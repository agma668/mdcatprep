/**
 * Data access + result computation for week-long analytics races — the single
 * owner of the races table's read shape and the winner policy, mirroring how
 * `lib/duels-repo.ts` owns duels and `lib/questions-repo.ts` owns questions.
 *
 * Ownership split:
 *  - THIS module: canonical row shape, fetch helpers, the 7-day window math,
 *    the window-aggregate queries (service client — participants never read
 *    each other's attempt rows through RLS; the action aggregates server-side
 *    exactly like the leaderboard does), and the pure winner computation.
 *  - `app/actions/races.ts`: server actions that validate intent (who may be
 *    raced, on which metric) and route through the session client for the
 *    races rows themselves so RLS gates "participants only".
 *  - UI surfaces (inbox card, leaderboard affordance): thin renders.
 *
 * Rules (single definition, decided 2026-09-04):
 *  - A race lasts exactly 7 days from creation. Nothing about the outcome is
 *    ever stored — winner is derived at read time from real question_attempts
 *    rows whose created_at falls inside the window. No cron, no status column,
 *    no snapshot to drift or game.
 *  - metric 'questions': more questions answered in the window wins. Tie ->
 *    higher window accuracy (same ordering as the leaderboard), still tied ->
 *    draw.
 *  - metric 'accuracy': a side must have answered >= RACE_MIN_ACCURACY_ATTEMPTS
 *    questions in the window for its accuracy to count at all (1/1 = 100% must
 *    not beat 400/500 = 80%). If both qualify: higher accuracy wins; equal
 *    accuracy -> more questions; still tied -> draw. If only one qualifies,
 *    that side wins (the other never met the practice minimum). If neither
 *    qualifies, the race is a draw — "not enough practice to compare".
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeRaceOutcome as computeRaceOutcomeCore,
  isRaceOver as isRaceOverCore,
  raceMsLeft as raceMsLeftCore,
  RACE_WINDOW_MS,
} from "./races-math.mjs";

export { RACE_MIN_ACCURACY_ATTEMPTS, RACE_WINDOW_MS } from "./races-math.mjs";

export type RaceMetric = "questions" | "accuracy";

/** Raw row shape of public.races. */
export interface RaceRow {
  id: string;
  challenger_id: string;
  opponent_id: string;
  metric: RaceMetric;
  created_at: string;
}

export const RACE_ROW_COLUMNS = "id, challenger_id, opponent_id, metric, created_at";

export const RACE_METRICS: readonly RaceMetric[] = ["questions", "accuracy"];

export function isRaceMetric(value: string | null | undefined): value is RaceMetric {
  return value === "questions" || value === "accuracy";
}

/** A race is finished once its 7-day window has passed. */
export function isRaceOver(
  race: Pick<RaceRow, "created_at">,
  now: number = Date.now()
): boolean {
  return isRaceOverCore(race, now);
}

/** Milliseconds left in the race window (negative when past). */
export function raceMsLeft(
  race: Pick<RaceRow, "created_at">,
  now: number = Date.now()
): number {
  return raceMsLeftCore(race, now);
}

/** Fetch one race row by id (null when missing). */
export async function fetchRaceById(
  db: SupabaseClient,
  raceId: string
): Promise<RaceRow | null> {
  const { data, error } = await db
    .from("races")
    .select(RACE_ROW_COLUMNS)
    .eq("id", raceId)
    .maybeSingle();
  if (error) {
    console.error("fetchRaceById:", error.message);
    return null;
  }
  return data as RaceRow | null;
}

export interface RaceWindowStats {
  questions: number;
  correct: number;
  /** 0-100 integer accuracy; null when the side answered nothing. */
  accuracy: number | null;
}

/**
 * Aggregate one participant's real attempts inside the race window. Runs with
 * the SERVICE client (server-side only, like the leaderboard) because students
 * cannot read each other's attempt rows through RLS — the two aggregate
 * numbers per side are all a race needs and all it ever exposes.
 */
export async function fetchWindowStats(
  db: SupabaseClient,
  race: Pick<RaceRow, "created_at">,
  studentId: string
): Promise<RaceWindowStats> {
  const start = new Date(race.created_at).toISOString();
  const end = new Date(new Date(race.created_at).getTime() + RACE_WINDOW_MS).toISOString();
  const [totalRes, correctRes] = await Promise.all([
    db
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .gte("created_at", start)
      .lt("created_at", end),
    db
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("is_correct", true)
      .gte("created_at", start)
      .lt("created_at", end),
  ]);
  const questions = totalRes.count ?? 0;
  const correct = correctRes.count ?? 0;
  if (totalRes.error) console.error("fetchWindowStats:", totalRes.error.message);
  return {
    questions,
    correct,
    accuracy: questions > 0 ? Math.round((100 * correct) / questions) : null,
  };
}

export type RaceWinner = "challenger" | "opponent" | "draw" | null;

export interface RaceOutcome {
  finished: boolean;
  challenger: RaceWindowStats;
  opponent: RaceWindowStats;
  /** null while live. */
  winner: RaceWinner;
}

/**
 * The ONE scoring definition, pure so the inbox, any detail surface and tests
 * cannot drift. Finished races only: 'questions' compares window questions,
 * then accuracy, then draw; 'accuracy' requires the practice floor on each
 * side before accuracy decides anything (see file header).
 */
export function computeRaceOutcome(
  race: Pick<RaceRow, "metric">,
  challenger: RaceWindowStats,
  opponent: RaceWindowStats,
  finished: boolean
): RaceOutcome {
  return computeRaceOutcomeCore(race, challenger, opponent, finished) as RaceOutcome;
}
