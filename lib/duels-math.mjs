/**
 * Pure duel scoring math — runtime-importable (plain ESM, zero imports) so
 * scripts/verify-post-paste.mjs runs the APP'S OWN scoring definitions
 * against the real tables after the migration is applied. lib/duels-repo.ts
 * re-exports these through typed facades; this file is the single
 * implementation, never a second definition to drift.
 */
export const DUEL_QUESTION_COUNT = 10;
export const DUEL_TTL_MS = 48 * 60 * 60 * 1000;

/** A duel is expired when it is still pending 48h after creation. */
export function isDuelExpired(duel, now = Date.now()) {
  return duel.status === "pending" && now - new Date(duel.created_at).getTime() > DUEL_TTL_MS;
}

/** Milliseconds left before a pending duel expires (negative when past due). */
export function duelMsLeft(duel, now = Date.now()) {
  return new Date(duel.created_at).getTime() + DUEL_TTL_MS - now;
}

/**
 * The one scoring definition: score (correct count), tie -> total time spent
 * answering (seconds), still tied -> draw; when the challenge lapsed with
 * exactly one side finished, that side wins by forfeit. Pure — takes the rows
 * and returns the result, so the play page, inbox, and verification kit
 * cannot drift. (Forfeit derives from the duel's own expiry — an optional
 * `now` is accepted for deterministic callers/tests.)
 */
export function computeDuelResult(duel, answers, now = Date.now()) {
  const byStudent = (studentId) => {
    const mine = answers.filter((a) => a.student_id === studentId);
    return {
      studentId,
      score: mine.filter((a) => a.is_correct).length,
      timeSeconds: mine.reduce((sum, a) => sum + (a.time_spent_seconds ?? 0), 0),
      answeredCount: mine.length,
    };
  };

  const challenger = byStudent(duel.challenger_id);
  const opponent = byStudent(duel.opponent_id);
  const challengerDone = challenger.answeredCount >= DUEL_QUESTION_COUNT;
  const opponentDone = opponent.answeredCount >= DUEL_QUESTION_COUNT;
  const bothDone = challengerDone && opponentDone;
  // Forfeit: the challenge lapsed while exactly one side had finished all 10.
  const forfeit =
    !bothDone && isDuelExpired(duel, now) && challengerDone !== opponentDone;

  let winner = null;
  if (bothDone) {
    if (challenger.score > opponent.score) winner = "challenger";
    else if (opponent.score > challenger.score) winner = "opponent";
    else if (challenger.timeSeconds < opponent.timeSeconds) winner = "challenger";
    else if (opponent.timeSeconds < challenger.timeSeconds) winner = "opponent";
    else winner = "draw";
  } else if (forfeit) {
    winner = challengerDone ? "challenger" : "opponent";
  }

  return {
    challenger,
    opponent,
    complete: bothDone || forfeit,
    forfeit,
    winner,
  };
}

/** A duel has a terminal result when completed head-to-head OR lapsed with
 *  exactly one side finished (forfeit). Gates rematch and the inbox's "is this
 *  over?" decision so a forfeit duel reads as done though its stored status
 *  is still 'pending'. */
export function duelHasResult(duel, now = Date.now()) {
  if (duel.status === "completed") return true;
  if (!isDuelExpired(duel, now)) return false;
  return !!duel.challenger_finished_at !== !!duel.opponent_finished_at;
}
