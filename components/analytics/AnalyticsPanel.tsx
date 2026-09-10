import { type ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface AnalyticsPanelProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  hasData: boolean;
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function AnalyticsPanel({
  title,
  subtitle,
  icon: Icon,
  iconColor = "var(--color-accent)",
  emptyIcon: EmptyIcon,
  emptyTitle = "No data yet",
  emptyDescription,
  hasData,
  children,
  headerExtra,
}: AnalyticsPanelProps) {
  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]"
      role="region"
      aria-labelledby={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && (
              <Icon
                className="w-4 h-4"
                style={{ color: iconColor }}
                aria-hidden="true"
              />
            )}
            <h2
              id={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-base font-bold text-[var(--color-text-primary)]"
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
        {headerExtra}
      </div>

      {!hasData ? (
        <div className="py-10 text-center">
          {EmptyIcon && (
            <EmptyIcon
              className="w-8 h-8 mx-auto mb-2 block text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {emptyTitle}
          </p>
          {emptyDescription && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
              {emptyDescription}
            </p>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
