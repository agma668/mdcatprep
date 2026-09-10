import Link from "next/link";
import { Dumbbell, Lightbulb, Target, TriangleAlert, Trophy } from "lucide-react";
import type { AIInsight } from "@/types/analytics";

// Four insight types, four colours — and here the hue is genuinely carrying
// information rather than telling four identical cards apart, so it stays. What
// changed is where the colours come from: the four rows used to inline six raw
// rgba() triplets between them, including rgba(201,168,76) — the pre-signal
// gold, which is not a brand colour any more. Each row now names a token, and
// the mapping is the token's own meaning:
//   strength       -> --ok       the same green a correct answer gets
//   weakness       -> --danger   the same red a wrong one gets
//   recommendation -> --signal   "you can act on this", which is the whole
//                                point of a recommendation
//   milestone      -> --brass    insignia. A milestone is earned, and the icon
//                                is already a trophy.
// The card also prints its type as words, so none of this rests on colour.
const TYPE_CONFIG = {
  strength:       { icon: Dumbbell,      color: "var(--ok)",         bg: "var(--tint-ok)",     border: "rgba(52,211,153,0.25)" },
  weakness:       { icon: TriangleAlert, color: "var(--danger)",     bg: "var(--tint-danger)", border: "rgba(248,113,113,0.25)" },
  recommendation: { icon: Target,        color: "var(--signal-300)", bg: "var(--tint-signal)", border: "var(--line-signal)" },
  milestone:      { icon: Trophy,        color: "var(--brass)",      bg: "var(--tint-brass)",  border: "var(--line-brass)" },
} as const;

const PRIORITY_LABEL: Record<AIInsight["priority"], string> = {
  high: "High Priority",
  medium: "Medium",
  low: "Low",
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const cfg = TYPE_CONFIG[insight.type];
  const Icon = cfg.icon;

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 flex gap-3"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      role="article"
      aria-label={insight.title}
    >
      <Icon
        aria-hidden="true"
        className="w-5 h-5 shrink-0 mt-0.5"
        style={{ color: cfg.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold" style={{ color: cfg.color }}>
            {insight.title}
          </h3>
          {insight.priority === "high" && (
            <span className="text-[10px] font-bold bg-[var(--color-error)] text-white px-2 py-0.5 rounded-[var(--radius-full)] shrink-0">
              {PRIORITY_LABEL[insight.priority]}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2">
          {insight.body}
        </p>
        {insight.actionLabel &&
          (insight.actionHref ? (
            <Link
              href={insight.actionHref}
              className="inline-block text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-sm)] border transition-colors"
              style={{
                color: cfg.color,
                borderColor: cfg.border,
                background: "rgba(255,255,255,0.06)",
              }}
              aria-label={insight.actionLabel}
            >
              {insight.actionLabel} →
            </Link>
          ) : (
            <span
              className="inline-block text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-sm)] border"
              style={{
                color: cfg.color,
                borderColor: cfg.border,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {insight.actionLabel}
            </span>
          ))}
      </div>
    </div>
  );
}

export function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  // Sort: high priority first
  const sorted = [...insights].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="ai-insights-title"
    >
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
        <h2
          id="ai-insights-title"
          className="text-base font-bold text-[var(--color-text-primary)]"
        >
          Insights
        </h2>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Recommendations based on your performance patterns
      </p>

      {sorted.length === 0 ? (
        <div className="py-10 text-center">
          <Lightbulb
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Insights appear once you practice
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            Answer a few MCQs and this panel will show your strengths, weak areas, and what to do next.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
