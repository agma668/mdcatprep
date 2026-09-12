"use client";

// FOUR-THEME COLOUR WHEEL — hero centerpiece control.
//
// A ring split into four coloured quadrants, one per theme. Click a quadrant
// to switch the whole site to that palette (persisted in localStorage, applied
// live via data-theme — no reload). Hover gently lifts the quadrant and shows
// its name; the active quadrant carries a lit outer ring.
//
// The quadrants use conic-gradient over a single rounded-full disc and a mask
// (hole-punch) to make the ring, so there is zero raster work and the wheel
// stays crisp at any size. Pure CSS, no canvas.

import { useEffect, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme, type ThemeId } from "./ThemeProvider";
import { Palette } from "lucide-react";

const STORAGE_KEY = "med-prep-theme";

export function ThemeWheel() {
  const [active, setActive] = useState<ThemeId>("midnight");
  const [hover, setHover] = useState<ThemeId | null>(null);

  // Read stored theme on mount (the inline head script already set data-theme,
  // so this just syncs state; FOUC was already prevented).
  useEffect(() => {
    let t = "midnight";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) t = saved;
    } catch {
      /* ignore */
    }
    const id = (t as ThemeId) in THEMES.map((x) => x.id) ? (t as ThemeId) : "midnight";
    setActive(id);
  }, []);

  // Build the conic gradient from the four themes' signal colours.
  const seg = 90; // deg per quadrant
  const stops = THEMES.map((t, i) => {
    const from = i * seg;
    const to = from + seg;
    // quadrant fill: a rich radial from the theme's field toward its signal,
    // so each quarter reads as that theme's atmosphere.
    const c1 = t.dots[1]; // signal
    const c2 = t.dots[0]; // field
    return `${c1} ${from}deg, ${c2} ${from + 8}deg ${to}deg, ${c1} ${to}deg`;
  }).join(", ");

  const hovered = THEMES.find((t) => t.id === hover) ?? null;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* label */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--steel-400)]">
        <Palette aria-hidden="true" className="h-3.5 w-3.5 text-[var(--signal-300)]" />
        {hovered ? hovered.label : "Theme"}
        {active && (
          <span className="ml-1 rounded-full border border-[var(--line-2)] bg-[var(--srf-2)] px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-[var(--steel-300)]">
            {THEMES.find((t) => t.id === active)?.label}
          </span>
        )}
      </div>

      {/* the wheel */}
      <div className="relative h-28 w-28">
        {/* outer glow ring when a theme is active */}
        <div
          className="absolute -inset-1 rounded-full opacity-70 blur-sm transition-all duration-700"
          style={{
            background: `conic-gradient(${
              THEMES.map((t, i) => `${active === t.id ? `${t.dots[1]} ${i * 90}deg ${i * 90 + 90}deg` : "transparent"}`).join(", ")
            })`,
          }}
        />
        {/* four-quadrant ring */}
        <div
          role="group"
          aria-label="Choose site colour theme"
          className="relative h-28 w-28 cursor-pointer rounded-full transition-transform duration-300 hover:scale-[1.04]"
          style={{
            background: `conic-gradient(${stops})`,
            mask: "radial-gradient(farthest-side, transparent 86%, #000 87%)",
            WebkitMask: "radial-gradient(farthest-side, transparent 86%, #000 87%)",
          }}
        >
          {/* quadrant hit areas */}
          {THEMES.map((t, i) => {
            // position each quadrant's invisible button over its quarter
            const half = i < 2 ? 0 : 1; // top half = 0,1 / bottom half = 2,3
            const horiz = i % 2; // left=0, right=1
            return (
              <button
                key={t.id}
                type="button"
                aria-label={`${t.label} theme`}
                aria-pressed={active === t.id}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  applyTheme(t.id);
                  setActive(t.id);
                }}
                className="absolute h-1/2 w-1/2 transition-transform duration-200 hover:scale-110 focus-visible:outline-none"
                style={{
                  top: half === 0 ? 0 : "50%",
                  left: horiz === 0 ? 0 : "50%",
                  borderRadius:
                    half === 0 ? (horiz === 0 ? "100% 0 0 0" : "0 100% 0 0") : horiz === 0 ? "0 0 0 100%" : "0 0 100% 0",
                }}
              />
            );
          })}
          {/* centre hub — dot showing active theme */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line-3)] bg-[var(--field-0)] shadow-[var(--shadow-lg)]"
            style={{
              borderColor: "var(--line-signal)",
            }}
          >
            <div
              className="absolute inset-2.5 rounded-full"
              style={{
                background: `conic-gradient(${THEMES.map((t2) => `${t2.dots[1]} 0deg 90deg`).join(", ")})`,
              }}
            />
          </div>
        </div>
      </div>

      <p className="max-w-[10rem] text-center text-[10px] leading-snug text-[var(--steel-500)]">
        Pick your growth atmosphere — same content, your colours.
      </p>
    </div>
  );
}