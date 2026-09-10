import type { AccuracyDataPoint, WeeklyProgress } from "@/types/analytics";
import { dayKey, addDays, weekStart, pct, DAY_MS } from "./date-utils";
import type { AttemptRow } from "./shared";

/** 30-day accuracy trend (only days with practice). */
export function computeAccuracyTrend(attempts: AttemptRow[]): AccuracyDataPoint[] {
  const cutoff = addDays(new Date(), -29);
  const byDay = new Map<string, { total: number; correct: number }>();
  
  for (const a of attempts) {
    if (a.createdAt < cutoff) continue;
    const key = dayKey(a.createdAt);
    const row = byDay.get(key) ?? { total: 0, correct: 0 };
    row.total += 1;
    if (a.isCorrect) row.correct += 1;
    byDay.set(key, row);
  }
  
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, r]) => ({ date, accuracy: pct(r.correct, r.total), questionsAttempted: r.total }));
}

/** Weekly progress for last 8 ISO weeks. */
export function computeWeeklyProgress(attempts: AttemptRow[]): WeeklyProgress[] {
  const thisWeekStart = weekStart(new Date());
  const weeks: { start: Date; total: number; correct: number }[] = [];
  
  for (let i = 7; i >= 0; i--) {
    const start = addDays(thisWeekStart, -7 * i);
    weeks.push({ start, total: 0, correct: 0 });
  }
  
  for (const a of attempts) {
    const ws = weekStart(a.createdAt);
    const idx = Math.round((ws.getTime() - thisWeekStart.getTime()) / (7 * DAY_MS));
    const week = weeks[7 - idx];
    if (week) {
      week.total += 1;
      if (a.isCorrect) week.correct += 1;
    }
  }
  
  return weeks.map((w, i) => ({
    week: `Wk ${i + 1}`,
    startDate: dayKey(w.start),
    questionsAttempted: w.total,
    correctAnswers: w.correct,
    studyMinutes: 0,
    mockTestScore: null,
  }));
}
