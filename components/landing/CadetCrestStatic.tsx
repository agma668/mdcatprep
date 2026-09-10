// Static crest — the shipped SVG patch, unchanged: stitched brass rings, a
// navy field, a gold star flanked by laurel, plus the float and periodic shine
// sweep from globals.css. It has three jobs now: the emblem's first paint in
// the server HTML, the render prefers-reduced-motion users keep, and the
// fail-closed fallback when the live canvas cannot run. Server-safe and zero
// JS; it renders inside the .cadet-crest wrapper that CadetCrest.tsx owns.
// Laurel layout is imported from lib/crest-3d.ts so this SVG and the canvas
// describe one crest instead of two drawings that drift.
import { LAUREL_LEAVES, LAUREL_STEMS, LEAF_RX, LEAF_RY, stemPath } from "@/lib/crest-3d";

export function CadetCrestStatic() {
  return (
    <div className="cadet-crest__float" aria-hidden="true">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crest-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2dc96" />
            <stop offset="0.5" stopColor="#c9a24b" />
            <stop offset="1" stopColor="#8f7233" />
          </linearGradient>
          <radialGradient id="crest-field" cx="0.36" cy="0.3" r="1">
            <stop offset="0" stopColor="#1c2b47" />
            <stop offset="0.65" stopColor="#101a30" />
            <stop offset="1" stopColor="#0a1120" />
          </radialGradient>
          <radialGradient id="crest-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(201,162,75,0.5)" />
            <stop offset="1" stopColor="rgba(201,162,75,0)" />
          </radialGradient>
          <linearGradient id="crest-star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7e6ae" />
            <stop offset="0.55" stopColor="#d9b45c" />
            <stop offset="1" stopColor="#8f7233" />
          </linearGradient>
          <linearGradient id="crest-shine-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id="crest-clip">
            <circle cx="100" cy="100" r="80" />
          </clipPath>
        </defs>
        {/* Stitched outer edge + brass ring. */}
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="rgba(201,162,75,0.55)"
          strokeWidth="2.4"
          strokeDasharray="3.2 4.6"
        />
        <circle cx="100" cy="100" r="89" fill="none" stroke="url(#crest-brass)" strokeWidth="5" />
        <circle cx="100" cy="100" r="83.5" fill="none" stroke="rgba(201,162,75,0.35)" strokeWidth="1" />

        {/* Navy field with warm glow, inner detail ring. */}
        <circle cx="100" cy="100" r="80" fill="url(#crest-field)" />
        <circle cx="100" cy="100" r="80" fill="url(#crest-glow)" />
        <circle
          cx="100"
          cy="100"
          r="66"
          fill="none"
          stroke="rgba(201,162,75,0.28)"
          strokeWidth="1"
          strokeDasharray="1 4"
        />

        {/* Laurel branches — curved stems with leaves along the arc. */}
        <g stroke="url(#crest-brass)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          {LAUREL_STEMS.map((s) => (
            <path key={s.from[0]} d={stemPath(s)} />
          ))}
        </g>
        <g fill="url(#crest-star)">
          {LAUREL_LEAVES.map((l) => (
            <ellipse
              key={`leaf-${l.x}`}
              cx={l.x}
              cy={l.y}
              rx={LEAF_RX}
              ry={LEAF_RY}
              transform={`rotate(${l.rot} ${l.x} ${l.y})`}
            />
          ))}
        </g>

        {/* Five-pointed star. */}
        <polygon
          points="100,60 109.05,87.54 138.04,87.64 114.65,104.76 123.51,132.36 100,115.4 76.49,132.36 85.35,104.76 61.96,87.64 90.95,87.54"
          fill="url(#crest-star)"
        />

        {/* Periodic shine sweep, clipped to the field. */}
        <g clipPath="url(#crest-clip)">
          <rect
            className="cadet-crest__shine"
            x="-140"
            y="-10"
            width="140"
            height="220"
            fill="url(#crest-shine-grad)"
          />
        </g>

      </svg>
    </div>
  );
}
