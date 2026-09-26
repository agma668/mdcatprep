# 03 — UI KIT (complete copy-paste components)

All files ship in the cadet repo. Each below is complete — copy into
`components/ui/` (or `components/landing/`) on the MED site.

## 1. `components/ui/Button.tsx`

```tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // The ONE saturated fill on the page: the --cta-from/--cta-to gradient with
  // --on-cta ink (dark on gold palettes, white on deep ones — never hardcode
  // white; white on --signal-600 measures 2.1:1).
  primary:
    "bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] text-[var(--on-cta)] shadow-[var(--shadow-cta),inset_0_1px_0_rgba(255,255,255,0.16)] hover:brightness-110 hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(var(--rgb-signal),0.55),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[0_2px_6px_rgba(var(--rgb-signal),0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
  secondary:
    "bg-[var(--srf-2)] text-[var(--steel-100)] border border-[var(--line-3)] hover:bg-[var(--srf-3)] hover:border-[var(--line-signal)]",
  // Hover inverts the outline button to a solid accent fill so its label takes
  // the CTA ink — not white, which would vanish on gold.
  outline:
    "bg-transparent border-2 border-[var(--signal-400)] text-[var(--signal-300)] hover:bg-[var(--signal-300)] hover:text-[var(--on-cta)] hover:border-[var(--signal-300)]",
  ghost:
    "bg-transparent text-[var(--steel-400)] hover:bg-[var(--srf-2)] hover:text-[var(--steel-100)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-6 text-base rounded-[var(--radius-md)]",
  lg: "h-13 px-8 text-lg rounded-[var(--radius-md)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
          "tap-44 transition-all duration-[var(--transition-fast)] ease-[var(--ease-out-quart)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--signal-300)] focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          // Press feedback answers the tap; stays on under reduced motion.
          "cursor-pointer active:translate-y-0 active:scale-[0.985]",
          variantStyles[variant], sizeStyles[seed(size)], fullWidth ? "w-full" : "", className,
        ].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);
function seed(size: ButtonSize) { return size; }
Button.displayName = "Button";
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
```

(That `seed()` indirection is a transcription artifact — on the MED site just
write `sizeStyles[size]` directly.)

## 2. `components/ui/Badge.tsx`

```tsx
import { type HTMLAttributes } from "react";
type BadgeVariant = "primary" | "accent" | "success" | "warning" | "neutral" | "error" | "glass";
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: BadgeVariant }

// Each variant is a tinted wash of its own token at low alpha with the token
// itself as the label colour — legible on any surface rung, all ≥7:1.
const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[var(--tint-signal)] text-[var(--signal-200)] border border-[var(--line-signal)]",
  accent:  "bg-[var(--tint-champagne)] text-[var(--champagne)] border border-[var(--line-brass)]",
  success: "bg-[var(--tint-ok)] text-[var(--ok)] border border-[var(--line-ok)]",
  warning: "bg-[var(--tint-warn)] text-[var(--warn)] border border-[var(--line-warn)]",
  error:   "bg-[var(--tint-danger)] text-[var(--danger)] border border-[var(--line-danger)]",
  neutral: "bg-[var(--srf-2)] text-[var(--steel-200)] border border-[var(--line-2)]",
  glass:   "bg-[var(--srf-1)] text-[var(--steel-100)] border border-[var(--line-3)]",
};

function Badge({ variant = "neutral", className = "", children, ...props }: BadgeProps) {
  return (
    <span className={[
      "inline-flex items-center gap-1 px-3 py-1 rounded-[var(--r-pill)]",
      // No tracked-out caps — sentence case with a hair of tracking reads as
      // considered; caps on every label is the tell of a template.
      "text-xs font-semibold tracking-[0.01em]",
      variantStyles[variant], className,
    ].filter(Boolean).join(" ")} {...props}>{children}</span>
  );
}
export { Badge };
export type { BadgeProps, BadgeVariant };
```

## 3. `components/ui/Motion.tsx` — Reveal / Stagger / ScaleIn / Float

Complete file ships in the cadet repo (`components/ui/Motion.tsx`). API:

- `usePrefersReducedMotion()` — `useSyncExternalStore`-based; anything that
  moves on its own must check it (carousels, canvas loops, smooth scroll).
- `<Reveal direction="up|down|left|right|none" delay={0} duration={350} distance={12} threshold={0.15} once>` —
  fade+slide on viewport entry, pure CSS transitions, `will-change` dropped
  once arrived (leaving it set holds a compositor layer for every block).
- `<Stagger stagger={30}>` — increasing per-child delays; children get wrapper
  divs, so grid classes go on a per-item `<Reveal className="col-span-2">`,
  not on the Stagger child.
- `<ScaleIn>` — pop-in for stat counters/icons. `<Float speed={3}>` — gentle
  infinite float for decorative elements, paused under reduced motion.

Key correctness detail: **under reduced motion, render children visible
immediately and skip the IntersectionObserver entirely** — the animation path
never runs, not just "ends at full opacity".

## 4. `components/landing/Magnetic.tsx`

```tsx
"use client";
// Magnetic hover: the child gently follows the cursor (motion-primitives
// style), springing back on leave. Desktop fine-pointer only by nature.
import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Magnetic({ children, strength = 0.22, className }: {
  children: ReactNode; strength?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.35 });
  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onPointerMove={handleMove} onPointerLeave={reset}
      style={{ x: sx, y: sy }} className={className}>{children}</motion.div>
  );
}
```

## 5. `components/TrackedLink.tsx` — the click-tracking Link

```tsx
"use client";
import Link from "next/link";
import { trackEvent } from "@/lib/telemetry";

/** A Link that reports its own clicks as a `cta_click` telemetry event
 *  (destination + optional label — no PII). Works from server components (it
 *  IS the client boundary). Fire-and-forget: navigation is never delayed. */
export function TrackedLink({ to, label, className, children, prefetch, onClick, ...rest }: {
  to: string; label?: string; className?: string;
  children: React.ReactNode; prefetch?: boolean; onClick?: () => void;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children" | "prefetch" | "onClick">) {
  return (
    <Link href={to} prefetch={prefetch} className={className}
      onClick={() => { trackEvent("cta_click", { to, ...(label ? { label } : {}) }); onClick?.(); }}
      {...rest}>
      {children}
    </Link>
  );
}
```

Adoption rule: swapping `<Link>` → `<TrackedLink to=… label="surface_name">`
on any CTA gives it analytics for free. Use dotted lowercase labels
(`hero_primary`, `navbar_desktop`, `notes-kohat-master`) so the admin
"Click events" bar list reads cleanly.

## 6. `components/landing/CompassLogo.tsx` — the brand mark

```tsx
// Compass-rose insignia. Pure static SVG, server-safe. One-shot CSS draw-in
// (stroke dashoffset + needle pop, class .compass-logo in globals.css); the
// global reduced-motion rule collapses it to the finished frame.
const TICKS = [0, 90, 180, 270];
export function CompassLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true"
      className="compass-logo text-[var(--brass)]">
      <circle cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={1.75} pathLength={1} />
      {TICKS.map((deg) => (
        <line key={deg} x1={24} y1={5.5} x2={24} y2={10} stroke="currentColor"
          strokeWidth={1.75} pathLength={1} transform={`rotate(${deg} 24 24)`} />
      ))}
      <path d="M24 13.5 L27.4 24 L24 34.5 L20.6 24 Z" fill="currentColor" />
    </svg>
  );
}
```

It paints in `currentColor` and sets its own colour from `--brass` on the
`<svg>`, so surrounding text colour can never bleed into the insignia. MED can
keep the compass or swap the needle path for a caduceus — keep the
token-driven colouring and the draw-in pattern either way.

## 7. Smaller primitives worth copying

- `components/ui/QuizOptions.tsx` — the MCQ option rows: letters A–D, selected
  chip gets `--glow-signal-sm` + signal tint, correct/incorrect get
  `--glow-ok`/`--glow-danger` only (a graded answer, nothing else).
- `components/ui/WhatsAppIcon.tsx` — brand-accurate glyph used on all
  WhatsApp surfaces; fills take `--whatsapp` with dark-inverse ink.
- `components/shared/StatsAsOf.tsx` — the "as of HH:MM UTC" freshness stamp
  that accompanies every live number.
- `lib/fmt.ts` — `fmtInt` (locale grouping), `fmtUTCDate`, `fmtUTCTime`.
