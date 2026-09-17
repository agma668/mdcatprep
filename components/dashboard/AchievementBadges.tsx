"use client";

import { useState } from "react";
import { Trophy, Star, Zap, Target, Flame, Award, Lock, Share2 } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  color: string;
  glowColor: string;
}

const BADGES: Omit<Badge, "current">[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Answer your first question",
    icon: <Star className="w-5 h-5" />,
    requirement: 1,
    color: "text-yellow-400",
    glowColor: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    id: "ten-questions",
    name: "Getting Started",
    description: "Answer 10 questions",
    icon: <Target className="w-5 h-5" />,
    requirement: 10,
    color: "text-blue-400",
    glowColor: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "fifty-questions",
    name: "Half Century",
    description: "Answer 50 questions",
    icon: <Zap className="w-5 h-5" />,
    requirement: 50,
    color: "text-purple-400",
    glowColor: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "hundred-questions",
    name: "Century",
    description: "Answer 100 questions",
    icon: <Trophy className="w-5 h-5" />,
    requirement: 100,
    color: "text-amber-400",
    glowColor: "from-amber-500/20 to-amber-500/5",
  },
  {
    id: "streak-3",
    name: "On Fire",
    description: "3-day streak",
    icon: <Flame className="w-5 h-5" />,
    requirement: 3,
    color: "text-orange-400",
    glowColor: "from-orange-500/20 to-orange-500/5",
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "7-day streak",
    icon: <Flame className="w-5 h-5" />,
    requirement: 7,
    color: "text-red-400",
    glowColor: "from-red-500/20 to-red-500/5",
  },
  {
    id: "accuracy-80",
    name: "Sharpshooter",
    description: "80% accuracy on 20+ questions",
    icon: <Award className="w-5 h-5" />,
    requirement: 80,
    color: "text-emerald-400",
    glowColor: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    id: "five-hundred",
    name: "Master Prep",
    description: "Answer 500 questions",
    icon: <Trophy className="w-5 h-5" />,
    requirement: 500,
    color: "text-[var(--color-primary-light)]",
    glowColor: "from-[var(--color-primary)]/20 to-[var(--color-primary)]/5",
  },
  {
    id: "community-builder",
    name: "Community Builder",
    description: "Share the platform with a friend",
    icon: <Share2 className="w-5 h-5" />,
    requirement: 1,
    color: "text-[var(--whatsapp)]",
    glowColor: "from-[var(--whatsapp)]/20 to-[var(--whatsapp)]/5",
  },
];

interface AchievementBadgesProps {
  questionsAnswered: number;
  currentStreak: number;
  accuracy: number;
}

export function AchievementBadges({
  questionsAnswered,
  currentStreak,
  accuracy,
}: AchievementBadgesProps) {
  const [showAll, setShowAll] = useState(false);

  const getProgress = (badge: Omit<Badge, "current">): number => {
    switch (badge.id) {
      case "streak-3":
      case "streak-7":
        return currentStreak;
      case "accuracy-80":
        return questionsAnswered >= 20 ? accuracy : 0;
      case "community-builder":
        return typeof window !== "undefined"
          ? Number(localStorage.getItem("acma-share-count") || "0")
          : 0;
      default:
        return questionsAnswered;
    }
  };

  const badges: Badge[] = BADGES.map((b) => ({
    ...b,
    current: getProgress(b),
  }));

  const earned = badges.filter((b) => b.current >= b.requirement);
  const inProgress = badges.filter(
    (b) => b.current < b.requirement && b.current > 0
  );
  const displayBadges = showAll ? badges : [...earned, ...inProgress].slice(0, 4);

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
          Achievements
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {earned.length}/{badges.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {displayBadges.map((badge) => {
          const isEarned = badge.current >= badge.requirement;
          const progress = Math.min(badge.current / badge.requirement, 1);

          return (
            <div
              key={badge.id}
              className={`relative rounded-[var(--radius-md)] p-3 text-center transition-all ${
                isEarned
                  ? `bg-gradient-to-br ${badge.glowColor} border border-white/10`
                  : "bg-white/[0.03] border border-white/[0.06] opacity-60"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                  isEarned ? badge.color : "text-white/40"
                }`}
              >
                {isEarned ? badge.icon : <Lock className="w-5 h-5" />}
              </div>
              <p
                className={`text-xs font-bold ${
                  isEarned ? "text-white" : "text-white/40"
                }`}
              >
                {badge.name}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {badge.description}
              </p>
              {!isEarned && badge.current > 0 && (
                <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {badges.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors cursor-pointer"
        >
          {showAll ? "Show less" : `View all ${badges.length} achievements`}
        </button>
      )}
    </div>
  );
}
