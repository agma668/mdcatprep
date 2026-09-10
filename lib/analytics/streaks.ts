import { dayKey, addDays } from "./date-utils";

/** Current + longest practice streaks in days. */
export function computeStreaks(days: string[]): { current: number; longest: number } {
  const set = new Set(days);
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = set.has(dayKey(addDays(new Date(`${d}T00:00:00Z`), -1))) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dayKey(new Date());
  const yesterday = dayKey(addDays(new Date(), -1));
  let cursor = set.has(today) ? today : set.has(yesterday) ? yesterday : null;
  let current = 0;
  while (cursor) {
    current += 1;
    const prev = dayKey(addDays(new Date(`${cursor}T00:00:00Z`), -1));
    cursor = set.has(prev) ? prev : null;
  }
  return { current, longest };
}
