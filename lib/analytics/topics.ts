import type { TopicStrength } from "@/types/analytics";
import { pct } from "./date-utils";
import type { AttemptRow } from "./shared";

/** Classify topics by strength based on accuracy. */
export function classifyTopicStrengths(attempts: AttemptRow[]): TopicStrength[] {
  const byTopic = new Map<string, { subject: string; topic: string; total: number; correct: number }>();
  
  for (const a of attempts) {
    if (!a.topic) continue;
    const key = `${a.subject ?? ""} — ${a.topic}`;
    const row = byTopic.get(key) ?? { subject: a.subject ?? "Uncategorized", topic: a.topic, total: 0, correct: 0 };
    row.total += 1;
    if (a.isCorrect) row.correct += 1;
    byTopic.set(key, row);
  }
  
  const classified: TopicStrength[] = [...byTopic.values()]
    .filter((r) => r.total >= 3)
    .map((r) => {
      const accuracy = pct(r.correct, r.total);
      const classification: TopicStrength["classification"] =
        accuracy >= 80 ? "strong" : accuracy >= 60 ? "moderate" : "weak";
      return { topic: r.topic, subject: r.subject, accuracy, questionsAttempted: r.total, classification };
    })
    .sort((a, b) => b.questionsAttempted - a.questionsAttempted);
  
  return (["weak", "moderate", "strong"] as const)
    .flatMap((c) => classified.filter((t) => t.classification === c).slice(0, 5));
}
