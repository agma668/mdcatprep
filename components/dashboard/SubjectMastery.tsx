"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Star } from "lucide-react";

interface SubjectData {
  subject: string;
  questionsAttempted: number;
  accuracy: number;
  icon: string;
}

interface SubjectMasteryProps {
  subjects: SubjectData[];
}

const MASTERY_LEVELS = [
  { min: 0, max: 20, label: "Beginner", color: "text-white/40", bg: "bg-white/10", stars: 0 },
  { min: 20, max: 40, label: "Learning", color: "text-blue-400", bg: "bg-blue-500/15", stars: 1 },
  { min: 40, max: 60, label: "Practicing", color: "text-purple-400", bg: "bg-purple-500/15", stars: 2 },
  { min: 60, max: 80, label: "Proficient", color: "text-amber-400", bg: "bg-amber-500/15", stars: 3 },
  { min: 80, max: 95, label: "Advanced", color: "text-emerald-400", bg: "bg-emerald-500/15", stars: 4 },
  { min: 95, max: 101, label: "Master", color: "text-[var(--color-primary-light)]", bg: "bg-[var(--color-primary)]/15", stars: 5 },
];

function getMastery(accuracy: number) {
  return MASTERY_LEVELS.find(l => accuracy >= l.min && accuracy < l.max) ?? MASTERY_LEVELS[0];
}

export function SubjectMastery({ subjects }: SubjectMasteryProps) {
  const [expanded, setExpanded] = useState(true);

  if (subjects.length === 0) return null;

  const totalAttempted = subjects.reduce((s, sub) => s + sub.questionsAttempted, 0);

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] p-5">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/15 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Subject Mastery</p>
            <p className="text-xs text-white/50">
              {subjects.length} subjects · {totalAttempted} questions total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {subjects.map((subject) => {
            const mastery = getMastery(subject.accuracy);
            return (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{subject.icon}</span>
                    <span className="text-sm font-semibold text-white">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${mastery.color}`}>
                      {mastery.label}
                    </span>
                    <span className="text-xs text-white/40">
                      {subject.questionsAttempted}q · {subject.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      subject.accuracy >= 80
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : subject.accuracy >= 60
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : subject.accuracy >= 40
                            ? "bg-gradient-to-r from-purple-500 to-purple-400"
                            : "bg-gradient-to-r from-white/30 to-white/20"
                    }`}
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < mastery.stars ? mastery.color : "text-white/10"
                      }`}
                      fill={i < mastery.stars ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
