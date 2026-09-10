import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  padded?: boolean;
  variant?: "surface" | "glass";
}

// Two rungs of one elevation ladder, both opaque. In dark UI, height reads as a
// *lighter* surface rather than a heavier shadow, and an opaque card also drops
// one backdrop-filter pass per instance — which is what made the old
// translucent tiles crawl on cheap Androids.
//
// These are arbitrary-value utilities rather than the .surface / .surface-raised
// classes in globals.css on purpose: those classes sit outside Tailwind's
// layers, so unlayered CSS would beat any override a caller passes in
// className. Utilities here keep `bordered`, `padded` and className working.
const variantStyles = {
  surface:
    "bg-[var(--srf-1)] border-[var(--line-2)] shadow-[var(--shadow-md),inset_0_1px_0_var(--line-lit)]",
  // "glass" keeps its name (it is used in a lot of places) but it is no longer
  // a translucent tile — it is the raised rung. The old value was
  // `bg-white/[0.06]/[0.07]`, an invalid double opacity modifier that Tailwind
  // dropped, so every glass card was rendering with no background at all.
  glass:
    "bg-[var(--srf-2)] border-[var(--line-3)] shadow-[var(--shadow-lg),inset_0_1px_0_rgba(255,255,255,0.09)]",
} as const;

function Card({
  hoverable = false,
  bordered = true,
  padded = true,
  variant = "surface",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-lg)]",
        variantStyles[variant],
        bordered ? "border" : "",
        padded ? "p-6" : "",
        hoverable ? "card-hover cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardBodyProps = HTMLAttributes<HTMLDivElement>;
function CardBody({ className = "", children, ...props }: CardBodyProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody };
export type { CardProps };
