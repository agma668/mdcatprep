"use client";

import Link from "next/link";
import { Lightbulb, ArrowRight, Clock, Target, BookOpen } from "lucide-react";

interface WeakArea {
  subject: string;
  topic: string;
  accuracy: number;
  questionsAttempted: number;
}

interface StudyPlanProps {
  weakAreas: WeakArea[];
  hasPractice: boolean;
  currentStreak: number;
}

export function StudyPlan({ weakAreas, hasPractice, currentStreak }: StudyPlanProps) {
  if (!hasPractice) {
    return (
      <div className="glass-tile-glow rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Your Study Plan</p>
            <p className="text-xs text-white/50">Personalized recommendations</p>
          </div>
        </div>
        <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-[var(--radius-md)]">
          <p className="text-sm text-white/70 mb-3">
            Start practicing to unlock your personalized study plan. We&apos;ll analyze your weak areas and recommend what to focus on next.
          </p>
          <Link
            href="/dashboard/practice"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary-light)] hover:text-[var(--color-accent-light)] transition-colors"
          >
            Start your first session <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const recommendations = [];

  // Add weak area recommendations
  if (weakAreas.length > 0) {
    const weakest = weakAreas[0];
    recommendations.push({
      icon: <Target className="w-4 h-4" />,
      title: `Focus on ${weakest.subject}`,
      description: `Your ${weakest.topic || weakest.subject} accuracy is ${weakest.accuracy}%. Practice more questions to improve.`,
      href: `/dashboard/practice?subject=${encodeURIComponent(weakest.subject)}`,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
    });
  }

  // Add streak recommendation
  if (currentStreak === 0) {
    recommendations.push({
      icon: <Clock className="w-4 h-4" />,
      title: "Start a new streak",
      description: "Answer at least 5 questions today to begin building your streak.",
      href: "/dashboard/practice",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    });
  } else if (currentStreak >= 3) {
    recommendations.push({
      icon: <Clock className="w-4 h-4" />,
      title: `${currentStreak}-day streak! Keep going`,
      description: "You're on a roll. Don't break the streak — practice today.",
      href: "/dashboard/practice",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    });
  }

  // Add general practice recommendation
  recommendations.push({
    icon: <BookOpen className="w-4 h-4" />,
    title: "Try a timed challenge",
    description: "Set a 15-minute timer and see how many you can get right.",
    href: "/dashboard/practice?time=15",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  });

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-400">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Your Study Plan</p>
          <p className="text-xs text-white/50">
            {recommendations.length} recommendation{recommendations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <Link
            key={i}
            href={rec.href}
            className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rec.bgColor} ${rec.color}`}>
              {rec.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-[var(--color-primary-light)] transition-colors">
                {rec.title}
              </p>
              <p className="text-xs text-white/50 mt-0.5">{rec.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[var(--color-primary)] transition-colors shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
