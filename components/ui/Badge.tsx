import { type HTMLAttributes } from "react";

type BadgeVariant = "primary" | "accent" | "success" | "warning" | "neutral" | "error" | "glass";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

// Every variant used to be a light-theme chip (#e6f0ea, #fef3dc, #dcfce7…) —
// cream rectangles on a near-black page. Each is now a tinted wash of its own
// token at low alpha with the token itself as the label colour, which keeps the
// chip legible (all ≥7:1 on --field-1) and lets it sit on any surface rung.
const variantStyles: Record<BadgeVariant, string> = {
  primary:
    "bg-[var(--tint-signal)] text-[var(--signal-200)] border border-[var(--line-signal)]",
  // Warm chips are the one place brass survives in the interface: champagne
  // reads as a citation, not as a button.
  accent:
    "bg-[var(--tint-champagne)] text-[var(--champagne)] border border-[var(--line-brass)]",
  success:
    "bg-[var(--tint-ok)] text-[var(--ok)] border border-[var(--line-ok)]",
  warning:
    "bg-[var(--tint-warn)] text-[var(--warn)] border border-[var(--line-warn)]",
  error:
    "bg-[var(--tint-danger)] text-[var(--danger)] border border-[var(--line-danger)]",
  neutral:
    "bg-[var(--srf-2)] text-[var(--steel-200)] border border-[var(--line-2)]",
  glass:
    "bg-[var(--srf-1)] text-[var(--steel-100)] border border-[var(--line-3)]",
};

function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-3 py-1 rounded-[var(--radius-full)]",
        // No uppercase. Tracked-out caps on every label is the tell of a
        // template; sentence case with a hair of tracking reads as considered.
        "text-xs font-semibold tracking-[0.01em]",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
