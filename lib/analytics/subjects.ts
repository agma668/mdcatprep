import type { SubjectPerformance, MCQBreakdown } from "@/types/analytics";
import { pct, DAY_MS } from "./date-utils";
import type { AttemptRow } from "./shared";

interface SubjectAccumulator {
  total: number;
  correct: number;
  last7: number;
  last7Correct: number;
  prev7: number;
  prev7Correct: number;
}

/** Aggregate attempts by subject with weekly trend data. */
export function aggregateBySubject(attempts: AttemptRow[]): {
  subjectPerformance: SubjectPerformance[];
  mcqBreakdown: MCQBreakdown[];
  bySubject: Map<string, SubjectAccumulator>;
} {
  const bySubject = new Map<string, SubjectAccumulator>();

  for (const a of attempts) {
    const key = a.subject ?? "Uncategorized";
    const row = bySubject.get(key) ?? {
      total: 0,
      correct: 0,
      last7: 0,
      last7Correct: 0,
      prev7: 0,
      prev7Correct: 0,
    };
    row.total += 1;
    if (a.isCorrect) row.correct += 1;
    const ageDays = Math.floor((Date.now() - a.createdAt.getTime()) / DAY_MS);
    if (ageDays < 7) {
      row.last7 += 1;
      if (a.isCorrect) row.last7Correct += 1;
    } else if (ageDays < 14) {
      row.prev7 += 1;
      if (a.isCorrect) row.prev7Correct += 1;
    }
    bySubject.set(key, row);
  }

  const subjectPerformance: SubjectPerformance[] = [...bySubject.entries()]
    .map(([subject, r]) => {
      const lastAcc = pct(r.last7Correct, r.last7);
      const prevAcc = pct(r.prev7Correct, r.prev7);
      const trendDelta = r.last7 >= 3 && r.prev7 >= 3 ? lastAcc - prevAcc : 0;
      const trend: "up" | "down" | "stable" =
        trendDelta >= 5 ? "up" : trendDelta <= -5 ? "down" : "stable";
      return {
        subject,
        totalQuestions: r.total,
        correct: r.correct,
        accuracy: pct(r.correct, r.total),
        timeSpentMinutes: 0,
        trend,
        trendDelta: Math.abs(trendDelta),
      };
    })
    .sort((a, b) => b.totalQuestions - a.totalQuestions);

  const mcqBreakdown: MCQBreakdown[] = [...bySubject.entries()].map(([subject, r]) => ({
    subject,
    correct: r.correct,
    incorrect: r.total - r.correct,
    skipped: 0,
    totalAttempted: r.total,
    avgTimePerQuestion: 0,
  }));

  return { subjectPerformance, mcqBreakdown, bySubject };
}
