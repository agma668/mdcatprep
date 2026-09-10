'use client';

/**
 * BrainBookHero — a lightweight, from-scratch hero illustration: an open book
 * with a stylized brain rising from its glow, ringed by faint floating
 * sparkles. Drawn in raw SVG in the brand palette.
 *
 * Copyright-safe (every shape drawn here), zero-lag (one static vector; no
 * raster bytes, no canvas, no rAF). Decorative → aria-hidden. It sits in the
 * hero's right column on lg+ and is hidden with its sibling layers under
 * reduced-motion and <768px.
 *
 * The book is drawn in the lighter steel tones so it reads against the dark
 * field; the brain glows in signal-blue so the motif "knowledge → cadet path"
 * is instantly legible even where it pokes out beneath the mission card.
 */

const SIGNAL = 'var(--signal-400)';
const SIGNAL_SOFT = 'var(--signal-300)';
const SIGNAL_BRIGHT = 'var(--signal-200)';
const STEEL_SOFT = 'var(--steel-200)';
const STEEL_LINE = 'var(--steel-400)';
const CHAMPAGNE = 'var(--champagne)';

export function BrainBookHero() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 240"
      className="brain-book-hero"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* floating sparkles */}
      <g className="brain-book-spark" fill={SIGNAL_SOFT} opacity="0.85">
        <circle cx="46" cy="52" r="2.2" opacity="0.9" />
        <circle cx="268" cy="40" r="2.6" opacity="0.8" />
        <circle cx="292" cy="120" r="1.8" opacity="0.7" />
        <circle cx="28" cy="150" r="1.6" opacity="0.6" />
        <circle cx="256" cy="176" r="2" opacity="0.8" />
      </g>

      {/* glow rising from the open book */}
      <ellipse cx="160" cy="140" rx="66" ry="30" fill={SIGNAL} opacity="0.22" filter="blur(8px)" />

      {/* open book — two bright pages meeting at the spine */}
      <g>
        {/* left page (brighter so it reads on navy) */}
        <path
          d="M160 186
             C 128 178, 96 176, 54 180
             L 54 206
             C 100 202, 130 202, 160 212 Z"
          fill={STEEL_SOFT}
          opacity="0.92"
        />
        {/* right page */}
        <path
          d="M160 186
             C 192 178, 224 176, 266 180
             L 266 206
             C 220 202, 190 202, 160 212 Z"
          fill={STEEL_SOFT}
          opacity="0.92"
        />
        {/* page edge shine (lighter) */}
        <path
          d="M160 186 C 128 178, 96 176, 54 180"
          fill="none"
          stroke={STEEL_LINE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M160 186 C 192 178, 224 176, 266 180"
          fill="none"
          stroke={STEEL_LINE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* spine base */}
        <path d="M157 212 h6 v6 h-6 z" fill={STEEL_LINE} />
      </g>

      {/* brain rising from the book — sits LOW so it peeks below the card */}
      <g>
        {/* left hemisphere */}
        <path
          d="M160 138
             C 150 132, 138 130, 130 136
             C 124 108, 138 92, 160 94
             C 158 112, 152 118, 148 130
             C 152 126, 156 122, 158 116
             L 160 138 Z"
          fill={SIGNAL}
        />
        {/* right hemisphere */}
        <path
          d="M160 138
             C 170 132, 182 130, 190 136
             C 196 108, 182 92, 160 94
             C 162 112, 168 118, 172 130
             C 168 126, 164 122, 162 116
             L 160 138 Z"
          fill={SIGNAL_BRIGHT}
        />
        {/* champagne highlight along the ridge */}
        <path
          d="M160 94 C 158 108, 160 120, 160 138"
          fill="none"
          stroke={CHAMPAGNE}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* lower brain folds */}
        <path
          d="M148 138 C 142 150, 148 158, 158 160"
          fill="none"
          stroke={SIGNAL_SOFT}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M172 138 C 178 150, 172 158, 162 160"
          fill="none"
          stroke={SIGNAL_SOFT}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* glow core behind brain */}
        <circle cx="160" cy="120" r="34" fill={SIGNAL} opacity="0.12" />
      </g>
    </svg>
  );
}