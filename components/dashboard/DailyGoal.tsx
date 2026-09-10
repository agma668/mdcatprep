"use client";

import { useState, useEffect } from "react";
import { Target, Flame, ChevronUp, ChevronDown } from "lucide-react";

const GOALS = [
  { questions: 5, label: "Quick", description: "5 questions" },
  { questions: 10, label: "Standard", description: "10 questions" },
  { questions: 20, label: "Power", description: "20 questions" },
  { questions: 30, label: "Beast", description: "30 questions" },
];

interface DailyGoalProps {
  questionsAnsweredToday: number;
  currentStreak: number;
}

export function DailyGoal({ questionsAnsweredToday, currentStreak }: DailyGoalProps) {
  const [dailyGoal, setDailyGoal] = useState(10);
  const [expanded, setExpanded] = useState(false);

  // Load saved goal from localStorage. The restore is deferred into a
  // requestAnimationFrame callback (never synchronous to the effect body) so
  // the react-hooks/set-state-in-effect rule stays satisfied.
  useEffect(() => {
    const saved = localStorage.getItem("acma-daily-goal");
    if (!saved) return;
    const parsed = parseInt(saved, 10);
    if (GOALS.some(g => g.questions === parsed)) {
      const id = requestAnimationFrame(() => setDailyGoal(parsed));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const saveGoal = (questions: number) => {
    setDailyGoal(questions);
    localStorage.setItem("acma-daily-goal", questions.toString());
    setExpanded(false);
  };

  const progress = Math.min(questionsAnsweredToday / dailyGoal, 1);
  const percentage = Math.round(progress * 100);
  const goalMet = questionsAnsweredToday >= dailyGoal;

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] p-5">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] bg-transparent p-0 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Two states, two meanings, and neither of them is brass. Done is
              --ok, the same green a correct answer gets, because that is what
              it is; in progress is --beacon, the token reserved for a number
              still moving. Brass stays on the podium and the week-long streak,
              which is the only reason it still means anything when it shows
              up. */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            goalMet
              ? "bg-[var(--tint-ok)] text-[var(--ok)] shadow-[var(--glow-ok)]"
              : "bg-[var(--tint-beacon)] text-[var(--beacon-400)]"
          }`}>
            {goalMet ? (
              <Flame className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {goalMet ? "Goal Complete! 🔥" : "Daily Goal"}
            </p>
            <p className="text-xs text-white/50">
              {questionsAnsweredToday}/{dailyGoal} questions today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-extrabold tabular-nums ${goalMet ? "text-[var(--ok)]" : "text-[var(--beacon-300)]"}`}>
            {percentage}%
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/50" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            goalMet
              ? "bg-[var(--ok)] shadow-[var(--glow-ok)]"
              : "bg-[linear-gradient(90deg,var(--beacon-600),var(--beacon-400))]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Expanded goal selector */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
            Set your daily goal
          </p>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal.questions}
                onClick={() => saveGoal(goal.questions)}
                className={`p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer ${
                  dailyGoal === goal.questions
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <p className={`text-sm font-bold ${
                  dailyGoal === goal.questions ? "text-[var(--color-primary-light)]" : "text-white"
                }`}>
                  {goal.label}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Streak encouragement */}
      {currentStreak > 0 && !goalMet && (
        <p className="mt-2 text-xs text-white/40 flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-400" />
          {currentStreak} day streak — keep it going!
        </p>
      )}
    </div>
  );
}
