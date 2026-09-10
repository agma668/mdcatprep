/**
 * One owner of demo-account identification. The founder-sanctioned demo
 * roster uses the reserved .example email domain everywhere in the app; the
 * suffix and the helper are read from HERE — the SQL like filter in
 * lib/public-stats.ts, the opponent gate in app/actions/duels.ts, and the
 * leaderboard challenge lookup — never from a literal scattered across files.
 */
export const DEMO_EMAIL_SUFFIX = "@cadetprep.example";

export function isDemoEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase().endsWith(DEMO_EMAIL_SUFFIX);
}