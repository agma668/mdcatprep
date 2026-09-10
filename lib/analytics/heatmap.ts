import type { StudyHeatmapDay } from "@/types/analytics";
import { dayKey, addDays } from "./date-utils";
import type { AttemptRow } from "./shared";

/** Generate a 90-day heatmap of study activity. */
export function generateHeatmap(attempts: AttemptRow[]): StudyHeatmapDay[] {
  const heatmap: StudyHeatmapDay[] = [];
  const heatmapStart = addDays(new Date(), -89);
  const byHeatDay = new Map<string, number>();
  
  for (const a of attempts) {
    if (a.createdAt < heatmapStart) continue;
    const key = dayKey(a.createdAt);
    byHeatDay.set(key, (byHeatDay.get(key) ?? 0) + 1);
  }
  
  for (let i = 0; i < 90; i++) {
    const date = addDays(heatmapStart, i);
    const key = dayKey(date);
    const qs = byHeatDay.get(key) ?? 0;
    const intensity: 0 | 1 | 2 | 3 | 4 = qs === 0 ? 0 : qs < 3 ? 1 : qs < 7 ? 2 : qs < 14 ? 3 : 4;
    heatmap.push({ date: key, minutesStudied: 0, questionsAttempted: qs, intensity });
  }
  
  return heatmap;
}
