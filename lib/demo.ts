/**
 * Legacy synthetic-account marker. Keep this exclusion so any previously
 * created test profiles never inflate real-student statistics. Apex no longer
 * schedules synthetic activity or uses these accounts as social proof.
 * The suffix is centralised here for public-stats and opponent filters; do not
 * create new production accounts with this marker.
 */
export const DEMO_EMAIL_SUFFIX = "@cadetprep.example";

export function isDemoEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase().endsWith(DEMO_EMAIL_SUFFIX);
}