import { Brain, Dumbbell, TrendingUp, TriangleAlert } from "lucide-react";
import type { TopicStrength } from "@/types/analytics";

const CLASSIFICATION_CONFIG = {
  strong: {
    label: "Strong Topics",
    icon: Dumbbell,
    color: "var(--color-success)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  },
  moderate: {
    label: "Moderate Topics",
    icon: TrendingUp,
    color: "var(--color-warning)",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  },
  weak: {
    label: "Weak Topics — Priority",
    icon: TriangleAlert,
    color: "var(--color-error)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    badge: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  },
} as const;

function TopicRow({ topic }: { topic: TopicStrength }) {
  const cfg = CLASSIFICATION_CONFIG[topic.classification];
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {topic.topic}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {topic.questionsAttempted} questions
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Mini bar */}
        <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full"
            style={{ width: `${topic.accuracy}%`, backgroundColor: cfg.color }}
          />
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-[var(--radius-full)] ${cfg.badge}`}
        >
          {topic.accuracy}%
        </span>
      </div>
    </div>
  );
}

export function TopicStrengthPanel({ topics }: { topics: TopicStrength[] }) {
  const strong = topics.filter((t) => t.classification === "strong");
  const moderate = topics.filter((t) => t.classification === "moderate");
  const weak = topics.filter((t) => t.classification === "weak");

  const sections = [
    { key: "weak" as const, topics: weak },
    { key: "moderate" as const, topics: moderate },
    { key: "strong" as const, topics: strong },
  ];

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="topic-strength-title"
    >
      <h2
        id="topic-strength-title"
        className="text-base font-bold text-[var(--color-text-primary)] mb-1"
      >
        Strong vs Weak Topics
      </h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Based on your practice history
      </p>

      {topics.length === 0 ? (
        <div className="py-10 text-center">
          <Brain
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No topic data yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Answer a few questions in the same topic and we&apos;ll show your strongest and weakest areas here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map(({ key, topics: sectionTopics }) => {
            const cfg = CLASSIFICATION_CONFIG[key];
            const Icon = cfg.icon;
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <h3 className="text-sm font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ({sectionTopics.length})
                  </span>
                </div>
                <div role="list" aria-label={cfg.label}>
                  {sectionTopics.map((t) => (
                    <div key={t.topic} role="listitem">
                      <TopicRow topic={t} />
                    </div>
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
