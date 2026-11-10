"use client";

// FIVE-THEME COLOUR WHEEL — hero appearance control.
//
// Five evenly spaced swatches sit around a quiet ring. The control follows the
// same shared theme catalogue as the nav picker, so adding a palette does not
// create overlapping quadrants or an invalid gradient.

import { useEffect, useState } from "react";
import { THEMES, applyTheme, getTheme, type ThemeId } from "./ThemeProvider";
import { Palette } from "lucide-react";

export function ThemeWheel() {
  const [active, setActive] = useState<ThemeId>("midnight");
  const [hover, setHover] = useState<ThemeId | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = getTheme();
      setActive(THEMES.some((theme) => theme.id === saved) ? saved : "midnight");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const segment = 360 / THEMES.length;
  const stops = THEMES.map((theme, index) => {
    const from = index * segment;
    const to = from + segment;
    return `${theme.dots[1]} ${from}deg ${to}deg`;
  }).join(", ");

  const hovered = THEMES.find((theme) => theme.id === hover) ?? null;
  const selected = THEMES.find((theme) => theme.id === active) ?? THEMES[0];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--steel-400)]">
        <Palette aria-hidden="true" className="h-3.5 w-3.5 text-[var(--signal-300)]" />
        {hovered ? hovered.label : "Appearance"}
        <span className="ml-1 rounded-full border border-[var(--line-2)] bg-[var(--srf-2)] px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-[var(--steel-300)]">
          {selected.label}
        </span>
      </div>

      <div className="relative h-[120px] w-[120px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-80"
          style={{
            background: `conic-gradient(${stops})`,
            mask: "radial-gradient(farthest-side, transparent 79%, #000 81%)",
            WebkitMask: "radial-gradient(farthest-side, transparent 79%, #000 81%)",
          }}
        />

        <div
          role="group"
          aria-label="Choose site appearance"
          className="absolute inset-0"
        >
          {THEMES.map((theme, index) => {
            const angle = -90 + index * segment;
            const radians = (angle * Math.PI) / 180;
            const center = 60;
            const radius = 42;
            const left = center + Math.cos(radians) * radius;
            const top = center + Math.sin(radians) * radius;
            const isActive = active === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                aria-label={`${theme.label} theme`}
                aria-pressed={isActive}
                title={theme.label}
                onMouseEnter={() => setHover(theme.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(theme.id)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  applyTheme(theme.id);
                  setActive(theme.id);
                }}
                className="tap-44 absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-transform duration-200 hover:scale-110 focus-visible:outline-none"
                style={{
                  left,
                  top,
                  borderColor: isActive ? "var(--steel-100)" : "var(--field-1)",
                  background: `linear-gradient(135deg, ${theme.dots[0]}, ${theme.dots[1]})`,
                  boxShadow: isActive ? "0 0 0 3px var(--line-signal), var(--shadow-md)" : "var(--shadow-sm)",
                }}
              >
                <span className="sr-only">{theme.label}</span>
              </button>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line-3)] shadow-[var(--shadow-lg)]"
          style={{
            background: `linear-gradient(135deg, ${selected.dots[0]}, ${selected.dots[1]})`,
          }}
        />
      </div>

      <p className="max-w-[10rem] text-center text-[10px] leading-snug text-[var(--steel-500)]">
        Choose the appearance that feels comfortable for study.
      </p>
    </div>
  );
}
