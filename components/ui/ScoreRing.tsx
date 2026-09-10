"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * AnimatedNumber — counts 0 → value with an ease-out curve.
 *
 * The count-up runs in requestAnimationFrame callbacks (never synchronously
 * inside the effect body, per the react-hooks/set-state-in-effect rule), and
 * jumps straight to the final value under `prefers-reduced-motion`. First
 * paint always shows the SSR-safe value, so there is no hydration mismatch.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

/**
 * ScoreRing — an SVG progress ring with a liquid-gold gradient stroke and
 * centered children (score, label, icon). The stroke sweeps in over ~1s from
 * mount; the global prefers-reduced-motion rule collapses the transition, so
 * reduced-motion users simply see the final ring. The gradient id is
 * instance-unique so multiple rings can share the page.
 */
export function ScoreRing({
  value,
  size = 156,
  stroke = 11,
  children,
  className = "",
}: {
  /** 0–100 — the ring's fill fraction. */
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flip inside a rAF so the state change is not synchronous to the effect
    // body; the CSS transition then sweeps the stroke from empty to `value`.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-light)" />
            <stop offset="55%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-primary-dark)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={mounted ? offset : c}
          style={{
            transition:
              "stroke-dashoffset 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
            filter: "drop-shadow(0 0 6px rgba(61, 126, 219, 0.45))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
