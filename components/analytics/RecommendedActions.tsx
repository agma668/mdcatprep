import Link from "next/link";
import { Clock, NotebookPen, RotateCcw, Target } from "lucide-react";
import type { RecommendedAction } from "@/types/analytics";

const TYPE_CONFIG = {
  practice: { icon: NotebookPen, label: "Practice",  color: "var(--color-primary)" },
  revision: { icon: RotateCcw,   label: "Revision",  color: "var(--color-accent)"  },
  mock:     { icon: Target,      label: "Mock Test", color: "var(--color-error)"   },
} as const;

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  medium: { label: "Medium", bg: "rgba(245,158,11,0.12)", text: "#fbbf24"              },
  hard:   { label: "Hard",   bg: "rgba(239,68,68,0.12)", text: "#fb7185"   },
} as const;

function ActionRow({
  action,
  index,
}: {
  action: RecommendedAction;
  index: number;
}) {
  const typeCfg = TYPE_CONFIG[action.type];
  const diffCfg = DIFFICULTY_CONFIG[action.difficulty];
  const TypeIcon = typeCfg.icon;
  const practiceHref = `/dashboard/practice?subject=${encodeURIComponent(action.subject)}`;

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-white/15 hover:shadow-[var(--shadow-sm)] transition-all"
      role="listitem"
    >
      {/* Number */}
      <span
        aria-hidden="true"
        className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: typeCfg.color }}
      >
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <TypeIcon className="w-4 h-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {action.topic}
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          {action.reason}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-full)]"
            style={{ backgroundColor: diffCfg.bg, color: diffCfg.text }}
          >
            {diffCfg.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {action.estimatedMinutes >= 60
              ? `${action.estimatedMinutes / 60}h`
              : `${action.estimatedMinutes}m`}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            · {action.subject}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={practiceHref}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white/[0.04] hover:bg-white/[0.06] text-[var(--color-text-primary)] transition-colors"
        aria-label={`Start ${action.topic}`}
      >
        Start
      </Link>
    </div>
  );
}

export function RecommendedActions({ actions }: { actions: RecommendedAction[] }) {
  return (
    <div
      className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6"
      role="region"
      aria-labelledby="recommended-actions-title"
    >
      <h2
        id="recommended-actions-title"
        className="text-base font-bold text-[var(--color-text-primary)] mb-1"
      >
        Recommended Next Actions
      </h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Prioritised study tasks based on your weak areas
      </p>

      {actions.length === 0 ? (
        <div className="py-10 text-center">
          <Target
            className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No recommended actions yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
            As you practice, weak topics will be prioritised here so you know exactly what to work on next.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3" role="list" aria-label="Recommended study actions">
          {actions.map((action, i) => (
            <ActionRow key={action.id} action={action} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
