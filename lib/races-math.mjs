/**
 * Pure race window/outcome math — runtime-importable (plain ESM, zero
 * imports) so scripts/verify-post-paste.mjs runs the APP'S OWN race scoring
 * against the real tables. lib/races-repo.ts re-exports these through typed
 * facades; this file is the single implementation.
 *
 * Rules (single definition, decided 2026-09-04):
 *  - A race lasts exactly 7 days from creation. Nothing about the outcome is
 *    ever stored — winner is derived at read time.
 *  - metric 'questions': more window questions wins; tie -> higher window
 *    accuracy; still tied -> draw.
 *  - metric 'accuracy': a side needs >= RACE_MIN_ACCURACY_ATTEMPTS window
 *    questions for its accuracy to count; if only one qualifies that side
 *    wins; neither -> draw.
 */
export const RACE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const RACE_MIN_ACCURACY_ATTEMPTS = 20;

/** A race is finished once its 7-day window has passed. */
export function isRaceOver(race, now = Date.now()) {
  return now - new Date(race.created_at).getTime() > RACE_WINDOW_MS;
}

/** Milliseconds left in the race window (negative when past). */
export function raceMsLeft(race, now = Date.now()) {
  return new Date(race.created_at).getTime() + RACE_WINDOW_MS - now;
}

/**
 * The ONE race scoring definition, pure so the inbox, detail surfaces and the
 * verification kit cannot drift. Finished races only: 'questions' compares
 * window questions, then accuracy, then draw; 'accuracy' requires the practice
 * floor on each side before accuracy decides anything (1/1 = 100% must not
 * beat 400/500 = 80%).
 */
export function computeRaceOutcome(race, challenger, opponent, finished) {
  if (!finished) return { finished, challenger, opponent, winner: null };

  const byQuestions = () => {
    if (challenger.questions > opponent.questions) return "challenger";
    if (opponent.questions > challenger.questions) return "opponent";
    const ca = challenger.accuracy ?? 0;
    const oa = opponent.accuracy ?? 0;
    if (ca > oa) return "challenger";
    if (oa > ca) return "opponent";
    return "draw";
  };

  const byAccuracy = () => {
    const cQualifies = challenger.questions >= RACE_MIN_ACCURACY_ATTEMPTS;
    const oQualifies = opponent.questions >= RACE_MIN_ACCURACY_ATTEMPTS;
    if (cQualifies && oQualifies) {
      const ca = challenger.accuracy ?? 0;
      const oa = opponent.accuracy ?? 0;
      if (ca > oa) return "challenger";
      if (oa > ca) return "opponent";
      if (challenger.questions > opponent.questions) return "challenger";
      if (opponent.questions > challenger.questions) return "opponent";
      return "draw";
    }
    if (cQualifies !== oQualifies) return cQualifies ? "challenger" : "opponent";
    return "draw";
  };

  return {
    finished,
    challenger,
    opponent,
    winner: race.metric === "questions" ? byQuestions() : byAccuracy(),
  };
}
