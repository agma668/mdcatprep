// ─── Core metric types ────────────────────────────────────────

export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correct: number;
  accuracy: number; // 0–100
  timeSpentMinutes: number;
  trend: "up" | "down" | "stable";
  trendDelta: number; // percentage points change vs last week
}

export interface AccuracyDataPoint {
  date: string; // ISO date string "YYYY-MM-DD"
  accuracy: number; // 0–100
  questionsAttempted: number;
}

export interface WeeklyProgress {
  week: string; // e.g. "Week 1", "Week 2"
  startDate: string;
  questionsAttempted: number;
  correctAnswers: number;
  studyMinutes: number;
  mockTestScore: number | null; // null if no mock taken that week
}

export interface TopicStrength {
  topic: string;
  subject: string;
  accuracy: number; // 0–100
  questionsAttempted: number;
  classification: "strong" | "moderate" | "weak";
}

export interface StudyHeatmapDay {
  date: string; // "YYYY-MM-DD"
  minutesStudied: number;
  questionsAttempted: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 4=max
}

export interface GoalProgress {
  id: string;
  title: string;
  targetCollege: string;
  targetDate: string;
  overallProgress: number; // 0–100
  subjectGoals: {
    subject: string;
    target: number; // accuracy %
    current: number;
    achieved: boolean;
  }[];
}

export interface AIInsight {
  id: string;
  type: "strength" | "weakness" | "recommendation" | "milestone";
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  priority: "high" | "medium" | "low";
}

export interface RecommendedAction {
  id: string;
  subject: string;
  topic: string;
  reason: string;
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  type: "practice" | "revision" | "mock";
}

export interface MCQBreakdown {
  subject: string;
  correct: number;
  incorrect: number;
  skipped: number;
  totalAttempted: number;
  avgTimePerQuestion: number; // seconds
}

// ─── Dashboard summary ────────────────────────────────────────

export interface AnalyticsSummary {
  totalStudyMinutes: number;
  totalQuestionsAttempted: number;
  questionsAnsweredToday: number;
  overallAccuracy: number;
  currentStreak: number; // days
  longestStreak: number;
  weeklyGoalMinutes: number;
  weeklyActualMinutes: number;
  rank: number; // among all users
  totalUsers: number;
}
