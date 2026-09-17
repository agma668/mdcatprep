import type { Metadata } from "next";
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";

import { Clock, Flame, NotebookPen, Target, Trophy } from "lucide-react";
import { getStudentAnalytics } from "@/lib/analytics/index";
import { getStudentProfile } from "@/lib/student";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/analytics/StatCard";
import { SubjectPerformanceChart } from "@/components/analytics/SubjectPerformanceChart";
import { AccuracyTrendChart } from "@/components/analytics/AccuracyTrendChart";
import { WeeklyProgressChart } from "@/components/analytics/WeeklyProgressChart";
import { MCQBreakdownChart } from "@/components/analytics/MCQBreakdownChart";
import { TopicStrengthPanel } from "@/components/analytics/TopicStrengthPanel";
import { StudyHeatmap } from "@/components/analytics/StudyHeatmap";
import { AIInsightsPanel } from "@/components/analytics/AIInsightsPanel";
import { RecommendedActions } from "@/components/analytics/RecommendedActions";
import { GoalProgressPanel } from "@/components/analytics/GoalProgress";
import { TimeSpentPanel } from "@/components/analytics/TimeSpentPanel";
import { ExportReportButton } from "@/components/analytics/ExportReportButton";

export const metadata: Metadata = { title: "Analytics" };

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage() {
  const [{ profile }, analytics] = await Promise.all([
    getStudentProfile(),
    getStudentAnalytics(),
  ]);

  const s = analytics?.summary;
  const hasPractice = (s?.totalQuestionsAttempted ?? 0) > 0;
  // Unique days with at least one practice attempt (last 90 days).
  const daysStudied = analytics?.heatmap.filter((d) => d.questionsAttempted > 0).length ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* ── Page header ─────────────────────────────────────── */}
      <PageHeader
        eyebrow="Track your progress"
        title="Performance Analytics"
        description={`${profile?.exam_target || "Student"} · Updated just now`}
        actions={<ExportReportButton />}
      />

      {/* ── KPI stat row ─────────────────────────────────────── */}
      <section aria-label="Key performance indicators" className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Overall Accuracy"
            value={hasPractice ? `${s!.overallAccuracy}%` : "—"}
            icon={<Target className="w-4 h-4" />}
            accentColor="var(--color-primary)"
          />
          <StatCard
            label="Total Questions"
            value={s ? fmtInt(s.totalQuestionsAttempted) : "—"}
            icon={<NotebookPen className="w-4 h-4" />}
            accentColor="var(--color-primary)"
          />
          <StatCard
            label="Study Streak"
            value={s && s.currentStreak > 0 ? `${s.currentStreak}d` : "—"}
            subValue={s && s.longestStreak > 0 ? `Best: ${s.longestStreak} days` : undefined}
            icon={<Flame className="w-4 h-4" />}
            accentColor="#ea580c"
          />
          <StatCard
            label="Days Studied"
            value={daysStudied > 0 ? String(daysStudied) : "—"}
            subValue="active practice days (90d)"
            icon={<Trophy className="w-4 h-4" />}
            accentColor="var(--color-accent)"
          />
          <StatCard
            label="Study Time"
            value={analytics?.timeSpent && analytics.timeSpent.totalMinutes > 0
              ? `${Math.floor(analytics.timeSpent.totalMinutes / 60)}h ${analytics.timeSpent.totalMinutes % 60}m`
              : "—"}
            subValue={analytics?.timeSpent && analytics.timeSpent.totalMinutes > 0
              ? `${analytics.timeSpent.weeklyMinutes}m this week`
              : "Start timed practice to track"}
            icon={<Clock className="w-4 h-4" />}
            accentColor="var(--color-primary)"
          />
        </div>
      </section>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 — Charts (spans 2 cols on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <AccuracyTrendChart data={analytics?.accuracyTrend ?? []} />

          <WeeklyProgressChart data={analytics?.weeklyProgress ?? []} />

          <MCQBreakdownChart data={analytics?.mcqBreakdown ?? []} />

          <StudyHeatmap days={analytics?.heatmap ?? []} />

        </div>

        {/* Column 2 — Panels (1 col on lg) */}
        <div className="flex flex-col gap-6">

          <GoalProgressPanel goal={analytics?.goal ?? null} />

          <TimeSpentPanel timeSpent={analytics?.timeSpent ?? { totalMinutes: 0, weeklyMinutes: 0, weeklyGoalMinutes: 0, subjects: [] }} />

          <SubjectPerformanceChart data={analytics?.subjectPerformance ?? []} />

        </div>
      </div>

      {/* ── Bottom row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        <div className="lg:col-span-1">
          <AIInsightsPanel insights={analytics?.insights ?? []} />
        </div>

        <div className="lg:col-span-1">
          <TopicStrengthPanel topics={analytics?.topicStrengths ?? []} />
        </div>

        <div className="lg:col-span-1">
          <RecommendedActions actions={analytics?.recommendedActions ?? []} />
        </div>

      </div>
    </div>
  );
}
