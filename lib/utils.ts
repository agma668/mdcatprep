// Shared utilities used across the codebase.
// Date helpers live here so both lib/analytics and lib/leaderboard share them.
// String helpers live here so all server actions share them.

export const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, n: number): Date {
  return new Date(utcMidnight(d).getTime() + n * DAY_MS);
}

/** ISO-8601 week number (1–53) for a UTC date. */
export function isoWeek(d: Date): number {
  const date = utcMidnight(d);
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round((diff / DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

export function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function weekStart(d: Date): Date {
  const date = utcMidnight(d);
  const dayNum = (date.getUTCDay() + 6) % 7;
  return addDays(date, -dayNum);
}

/**
 * Trim, limit length, and return empty string for non-string inputs.
 * Used by server actions to sanitize form data.
 */
export function cleanString(value: FormDataEntryValue | null, maxLen = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLen) : "";
}
