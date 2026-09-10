import { type HTMLAttributes, type ReactNode } from "react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  trendLabel?: string;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  trendLabel,
  accentColor = "var(--color-primary)",
  className = "",
  ...props
}: StatCardProps) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor =
    trend === "up"
      ? "text-[var(--color-success)]"
      : trend === "down"
        ? "text-[var(--color-error)]"
        : "text-[var(--color-text-muted)]";

  return (
    <div
      className={[
        "glass-tile-glow border border-white/10",
        "rounded-[var(--radius-lg)] p-5",
        "flex flex-col gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <span
            aria-hidden="true"
            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)]"
            style={{ background: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className="text-3xl font-extrabold leading-none tracking-tight"
          style={{ color: accentColor }}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{subValue}</p>
        )}
      </div>

      {/* Trend */}
      {trend && trendLabel && (
        <p className={`text-xs font-medium ${trendColor} flex items-center gap-1`}>
          <span aria-hidden="true">{trendIcon}</span>
          {trendLabel}
        </p>
      )}
    </div>
  );
}
