import type { AIInsight, RecommendedAction, SubjectPerformance, TopicStrength, GoalProgress } from "@/types/analytics";
import { DAY_MS } from "./date-utils";

/** Generate AI insights from subject performance and streak data. */
export function generateInsights(
  totalAttempts: number,
  subjectPerformance: SubjectPerformance[],
  currentStreak: number,
  days: string[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (totalAttempts === 0) {
    insights.push({
      id: "ins-empty",
      type: "recommendation",
      title: "Start practicing to unlock insights",
      body: "Answer a few MCQs and your analytics will show your strengths, weaknesses, and recommended next steps.",
      priority: "medium",
    });
  } else {
    const ranked = [...subjectPerformance].sort((a, b) => b.accuracy - a.accuracy);
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];
    
    if (best && best.totalQuestions >= 5) {
      insights.push({
        id: "ins-strength",
        type: "strength",
        title: `${best.subject} is your strongest subject`,
        body: `${best.accuracy}% accuracy across ${best.totalQuestions} questions. Keep this up with light weekly revision.`,
        priority: "low",
      });
    }
    
    if (worst && worst.totalQuestions >= 5 && worst.accuracy < 80) {
      insights.push({
        id: "ins-weakness",
        type: "weakness",
        title: `${worst.subject} needs attention`,
        body: `Your ${worst.subject} accuracy is ${worst.accuracy}%. A focused practice session will help.`,
        actionLabel: `Practice ${worst.subject}`,
        actionHref: `/dashboard/practice?subject=${encodeURIComponent(worst.subject)}`,
        priority: "high",
      });
    }
    
    if (currentStreak >= 3) {
      insights.push({
        id: "ins-streak",
        type: "milestone",
        title: `${currentStreak}-day practice streak 🔥`,
        body: `You've practiced ${currentStreak} days in a row. Consistency beats intensity — keep it going.`,
        priority: "medium",
      });
    }
    
    const lastPracticeAge = days.length > 0
      ? Math.floor((Date.now() - new Date(`${days[days.length - 1]}T00:00:00Z`).getTime()) / DAY_MS)
      : Infinity;
    
    if (lastPracticeAge >= 7) {
      insights.push({
        id: "ins-restart",
        type: "recommendation",
        title: "Practice again this week",
        body: "It's been a while since your last practice session. Even 10 questions will keep your momentum.",
        actionLabel: "Start practicing",
        actionHref: "/dashboard/practice",
        priority: "high",
      });
    }
  }
  
  return insights;
}

/** Generate recommended actions from weak topics. */
export function generateRecommendedActions(weakTopics: TopicStrength[]): RecommendedAction[] {
  return weakTopics
    .filter((t) => t.classification === "weak")
    .slice(0, 5)
    .map((t, i) => ({
      id: `act-${i}`,
      subject: t.subject,
      topic: t.topic,
      reason: `Accuracy ${t.accuracy}% across ${t.questionsAttempted} questions — priority area`,
      estimatedMinutes: 20,
      difficulty: t.accuracy < 50 ? "hard" : "medium",
      type: "practice" as const,
    }));
}

/** Build goal progress from subject performance and exam target. */
export function buildGoalProgress(
  examTarget: string | null,
  subjectPerformance: SubjectPerformance[]
): GoalProgress | null {
  const target = examTarget?.trim();
  if (!target) return null;
  
  const subjectGoals = subjectPerformance.map((s) => ({
    subject: s.subject,
    target: 80,
    current: s.accuracy,
    achieved: s.accuracy >= 80,
  }));
  
  const avg = subjectGoals.length > 0
    ? Math.round(subjectGoals.reduce((sum, g) => sum + g.current, 0) / subjectGoals.length)
    : 0;
  
  return {
    id: "goal-exam-target",
    title: "Exam Target",
    targetCollege: target,
    targetDate: "",
    overallProgress: avg,
    subjectGoals,
  };
}
