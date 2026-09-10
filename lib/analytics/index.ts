import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  SubjectPerformance,
  AccuracyDataPoint,
  WeeklyProgress,
  TopicStrength,
  StudyHeatmapDay,
  GoalProgress,
  AIInsight,
  RecommendedAction,
  MCQBreakdown,
  AnalyticsSummary,
} from "@/types/analytics";

import { dayKey, pct, DAY_MS } from "./date-utils";
import { computeStreaks } from "./streaks";
import { aggregateBySubject } from "./subjects";
import { computeAccuracyTrend, computeWeeklyProgress } from "./trends";
import { classifyTopicStrengths } from "./topics";
import { generateHeatmap } from "./heatmap";
import { generateInsights, generateRecommendedActions, buildGoalProgress } from "./insights";
import { fetchAttempts, fetchOverviewAttempts, type AttemptRow } from "./fetch-attempts";

import type { TimeSpentData } from "./types";

// Re-export types for downstream consumers
export type { TimeSpentData } from "./types";

export interface StudentAnalytics {
  summary: AnalyticsSummary;
  subjectPerformance: SubjectPerformance[];
  accuracyTrend: AccuracyDataPoint[];
  weeklyProgress: WeeklyProgress[];
  topicStrengths: TopicStrength[];
  heatmap: StudyHeatmapDay[];
  goal: GoalProgress | null;
  insights: AIInsight[];
  recommendedActions: RecommendedAction[];
  mcqBreakdown: MCQBreakdown[];
  timeSpent: TimeSpentData;
}

/** Compute time spent metrics from attempts. */
function computeTimeSpent(attempts: AttemptRow[]): TimeSpentData {
  let totalSeconds = 0;
  let weeklySeconds = 0;
  const bySubject = new Map<string, number>();

  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;

  for (const a of attempts) {
    if (a.timeSpentSeconds === null) continue;
    
    totalSeconds += a.timeSpentSeconds;
    
    if (a.createdAt.getTime() >= weekAgo) {
      weeklySeconds += a.timeSpentSeconds;
    }

    const subject = a.subject ?? "Uncategorized";
    bySubject.set(subject, (bySubject.get(subject) ?? 0) + a.timeSpentSeconds);
  }

  return {
    totalMinutes: Math.round(totalSeconds / 60),
    weeklyMinutes: Math.round(weeklySeconds / 60),
    weeklyGoalMinutes: 0,
    subjects: [...bySubject.entries()]
      .map(([subject, seconds]) => ({ subject, minutes: Math.round(seconds / 60) }))
      .sort((a, b) => b.minutes - a.minutes),
  };
}

/** Compute average time per question per subject. */
function computeAvgTimePerQuestion(attempts: AttemptRow[]): Map<string, number> {
  const bySubject = new Map<string, { total: number; count: number }>();

  for (const a of attempts) {
    if (a.timeSpentSeconds === null) continue;
    const subject = a.subject ?? "Uncategorized";
    const stats = bySubject.get(subject) ?? { total: 0, count: 0 };
    stats.total += a.timeSpentSeconds;
    stats.count += 1;
    bySubject.set(subject, stats);
  }

  const result = new Map<string, number>();
  for (const [subject, stats] of bySubject) {
    result.set(subject, Math.round(stats.total / stats.count));
  }
  return result;
}

/** Main orchestrator: fetches data and computes all analytics. */
export async function getStudentAnalytics(): Promise<StudentAnalytics | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const attempts = await fetchAttempts(user.id);

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("exam_target")
    .eq("id", user.id)
    .single();

  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect).length;
  const days = [...new Set(attempts.map((a) => dayKey(a.createdAt)))].sort();
  const { current, longest } = computeStreaks(days);
  // Count of questions answered on the current (UTC) day — feeds the
  // dashboard Daily Goal ring. UTC day keys match the streak/heatmap
  // semantics used everywhere else in analytics.
  const todayKey = dayKey(new Date());
  const answeredToday = attempts.filter((a) => dayKey(a.createdAt) === todayKey).length;

  const { subjectPerformance, mcqBreakdown } = aggregateBySubject(attempts);
  const accuracyTrend = computeAccuracyTrend(attempts);
  const weeklyProgress = computeWeeklyProgress(attempts);
  const topicStrengths = classifyTopicStrengths(attempts);
  const heatmap = generateHeatmap(attempts);
  const goal = buildGoalProgress(profile?.exam_target ?? null, subjectPerformance);
  const insights = generateInsights(total, subjectPerformance, current, days);
  const recommendedActions = generateRecommendedActions(topicStrengths);
  const timeSpent = computeTimeSpent(attempts);

  // Update MCQ breakdown with average time per question
  const avgTimeMap = computeAvgTimePerQuestion(attempts);
  for (const item of mcqBreakdown) {
    const avgTime = avgTimeMap.get(item.subject);
    if (avgTime !== undefined) {
      item.avgTimePerQuestion = avgTime;
    }
  }

  // Update subject performance with time spent
  const timeBySubject = new Map(timeSpent.subjects.map(s => [s.subject, s.minutes]));
  for (const item of subjectPerformance) {
    const minutes = timeBySubject.get(item.subject);
    if (minutes !== undefined) {
      item.timeSpentMinutes = minutes;
    }
  }

  const summary: AnalyticsSummary = {
    totalStudyMinutes: timeSpent.totalMinutes,
    totalQuestionsAttempted: total,
    questionsAnsweredToday: answeredToday,
    overallAccuracy: pct(correct, total),
    currentStreak: current,
    longestStreak: longest,
    weeklyGoalMinutes: 0,
    weeklyActualMinutes: timeSpent.weeklyMinutes,
    rank: 0,
    totalUsers: 0,
  };

  return {
    summary,
    subjectPerformance,
    accuracyTrend,
    weeklyProgress,
    topicStrengths,
    heatmap,
    goal,
    insights,
    recommendedActions,
    mcqBreakdown,
    timeSpent,
  };
}

/**
 * Lightweight dashboard overview: summary + subject performance only.
 *
 * The dashboard renders nothing else from the full analytics suite (trends,
 * heatmap, topics, insights, time spent), but used to pay for all of it — the
 * full orchestrator fetches every attempt with topic + time_spent columns on
 * each dashboard load. This path fetches a minimal projection and computes
 * just what the overview cards need, so dashboard SSR stays fast as attempt
 * history grows.
 */
export async function getStudentOverview(): Promise<{
  summary: AnalyticsSummary;
  subjectPerformance: SubjectPerformance[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const attempts = await fetchOverviewAttempts(user.id);

  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect).length;
  const days = [...new Set(attempts.map((a) => dayKey(a.createdAt)))].sort();
  const { current, longest } = computeStreaks(days);
  const todayKey = dayKey(new Date());
  const answeredToday = attempts.filter((a) => dayKey(a.createdAt) === todayKey).length;
  const { subjectPerformance } = aggregateBySubject(attempts);

  const summary: AnalyticsSummary = {
    totalStudyMinutes: 0,
    totalQuestionsAttempted: total,
    questionsAnsweredToday: answeredToday,
    overallAccuracy: pct(correct, total),
    currentStreak: current,
    longestStreak: longest,
    weeklyGoalMinutes: 0,
    weeklyActualMinutes: 0,
    rank: 0,
    totalUsers: 0,
  };

  return { summary, subjectPerformance };
}
