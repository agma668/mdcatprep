# 01 — DESIGN SYSTEM (complete, copy-paste)

Source of truth on the cadet site: `app/globals.css` (~1,775 lines, heavily
commented). This file gives you the complete working system — tokens, elevation,
effects, and the **4-theme colour-wheel engine**. Both sites share the same
lineage: the MED site's globals.css is the older "Instrument" (navy) palette;
the cadet site ships the newer "Parade night" (near-black + brass) default with
three accent-only alternates. You may keep the navy field and still take every
mechanism below — the engine is palette-agnostic.

---

## 1. Design philosophy (read before copying)

- **Concept: "Parade night."** Brass/gold on near-black, with three metals and
  three jobs: STEEL (structure), SIGNAL (action — the only colour that means
  "you can press this"), BRASS (insignia only: crest, logo, the word "free").
- **Elevation, not shadows.** A higher surface is a LIGHTER surface (Apple's
  dark-mode rule). Shadows are ambient only. Surfaces are opaque; translucency
  (`backdrop-filter`) is reserved for the nav layer and **never stacked**.
- **A glow is a claim.** Glows are a closed set: `--glow-signal-*` = "you can
  act here / this is selected", `--glow-beacon` = live data, `--glow-brass` =
  earned (rank 1, week+ streak), `--glow-ok/--glow-danger` = a graded answer.
  Everything else gets `--shadow-md` and hierarchy from size/weight/position.
- **Four signature hues with fixed jobs** (constant across themes):
  emerald = score/accuracy, sky = volume/counts, amber = streaks/heat,
  iris = time/effort. So "green means score" survives any theme switch.
- **Motion tokens, one job each:** `--dur-1` 140ms state flips, `--dur-2` 220ms
  movement, `--dur-3` 340ms entrance, `--dur-4` 560ms orchestration.
- **Concentric radii:** inner radius = outer − padding.
- **Contrast measured:** every text token has its ratio in the comment. Body
  copy is never under 4.5:1. The CTA fill takes dark ink on gold (`--on-cta:
  #14100A`) because white on gold is 2.1:1.

## 2. Tokens (drop into `:root`)

```css
:root {
  /* Field: true near-black — gold needs a neutral ground (a navy field turns
     brass olive). */
  --field-0: #050506; --field-1: #0A0A0A; --field-2: #0E0E10;
  /* Elevation ladder — opaque, lighter = closer */
  --srf-1: #121213; --srf-2: #181819; --srf-3: #1E1E20; --srf-4: #262629;
  /* Steel: structure. Neutral grey, never blue-cast. */
  --steel-100: #F5F5F6; --steel-200: #D8D8DA; --steel-300: #B4B4B7;
  --steel-400: #8E8E92; --steel-500: #6A6A6F; --steel-600: #4C4C51;
  --steel-700: #333338; --steel-800: #202024;
  /* Signal: the only "you can act here" colour — brass ladder. */
  --signal-100: #FBF3DC; --signal-200: #F3E0AE; --signal-300: #E7CD8E;
  --signal-400: #DCBD76; --signal-500: #C9A24B; --signal-600: #D6AC48;
  --signal-700: #A9822C;
  /* Beacon: live data only (pulse dots, "as of" counters). */
  --beacon-300: #F7DE9E; --beacon-400: #EFC666; --beacon-600: #96701C;
  /* Brass: insignia ONLY — crest, compass mark, the word "free". */
  --brass: #C9A24B; --brass-dim: #8F7233; --brass-bright: #F2DC96;
  --champagne: #E7CE96;
  /* Semantic */
  --ok: #34D399; --warn: #FBBF24; --danger: #F87171;
  /* Signature hues with fixed jobs (constant across themes) */
  --hue-emerald: #34D399; --hue-sky: #60A5FA; --hue-amber: #FB923C; --hue-iris: #A78BFA;
  --tint-hue-emerald: rgba(52,211,153,.12); --tint-hue-sky: rgba(96,165,250,.12);
  --tint-hue-amber: rgba(251,146,60,.12);   --tint-hue-iris: rgba(167,139,250,.12);
  --line-hue-emerald: rgba(52,211,153,.28); --line-hue-sky: rgba(96,165,250,.28);
  --line-hue-amber: rgba(251,146,60,.28);   --line-hue-iris: rgba(167,139,250,.28);
  /* WhatsApp brand (its button takes --color-text-inverse, white on green is 2:1) */
  --whatsapp: #25D366; --whatsapp-deep: #1EBE57;
  /* CTA: gold fill carries DARK ink */
  --cta-from: var(--signal-600); --cta-to: var(--signal-700); --on-cta: #14100A;
  /* Hairlines: lit top edge + dark bottom edge = machined panel */
  --line-1: rgba(240,240,242,.07); --line-2: rgba(240,240,242,.11);
  --line-3: rgba(240,240,242,.17); --line-lit: rgba(255,255,255,.07);
  --line-signal: rgba(var(--rgb-signal),.28); --line-beacon: rgba(239,198,102,.28);
  --line-brass: rgba(201,162,75,.3);
  --line-ok: rgba(52,211,153,.3); --line-warn: rgba(251,191,36,.3); --line-danger: rgba(248,113,113,.3);
  /* Tints (pair a tint with its own token as the label colour) */
  --tint-signal: rgba(var(--rgb-signal),.12); --tint-signal-strong: rgba(var(--rgb-signal),.2);
  --tint-beacon: rgba(239,198,102,.12); --tint-brass: rgba(201,162,75,.1);
  --tint-champagne: rgba(231,206,150,.1);
  --tint-ok: rgba(52,211,153,.12); --tint-warn: rgba(251,191,36,.12); --tint-danger: rgba(248,113,113,.12);
  /* Raw channels for canvas/gradient stops */
  --rgb-signal: 231, 205, 142; --rgb-steel: 213, 220, 230;
  /* Shadows: ambient only */
  --shadow-sm: 0 1px 2px rgba(2,5,12,.5); --shadow-md: 0 4px 14px rgba(2,5,12,.45);
  --shadow-lg: 0 14px 38px rgba(2,5,12,.5); --shadow-xl: 0 28px 72px rgba(2,5,12,.58);
  --shadow-card: 0 1px 2px rgba(2,5,12,.5), inset 0 1px 0 var(--line-lit);
  --shadow-cta: 0 6px 22px rgba(var(--rgb-signal),.45);
  /* The closed glow set (see philosophy above) */
  --glow-signal-dot: 0 0 8px rgba(var(--rgb-signal),.75);
  --glow-signal-sm: 0 0 14px rgba(var(--rgb-signal),.35);
  --glow-signal-md: 0 4px 16px rgba(var(--rgb-signal),.3);
  --glow-signal-lg: 0 8px 28px rgba(var(--rgb-signal),.38);
  --glow-beacon: 0 0 16px rgba(239,198,102,.32);
  --glow-brass: 0 0 22px rgba(201,162,75,.16);
  --glow-ok: 0 0 16px rgba(52,211,153,.3); --glow-danger: 0 0 16px rgba(248,113,113,.28);
  /* Nav blur behind a var() so the minifier can't collapse the standard
     property away (this exact bug shipped once — see comment in source). */
  --nav-blur: blur(20px) saturate(160%);
  /* Radii: concentric — inner = outer − padding */
  --r-1: 8px; --r-2: 12px; --r-3: 16px; --r-4: 22px; --r-5: 28px; --r-pill: 999px;
  /* Motion */
  --dur-1: 140ms; --dur-2: 220ms; --dur-3: 340ms; --dur-4: 560ms;
  --ease-out-quart: cubic-bezier(.22,1,.36,1);
  --ease-out-expo: cubic-bezier(.16,1,.3,1);
  --ease-spring: cubic-bezier(.34,1.4,.64,1);
  --ease-in-out: cubic-bezier(.4,0,.2,1);
  /* Compatibility aliases: old token names resolve here, so existing
     components recolour from this one file. New code uses the named tokens. */
  --dark-bg: var(--field-1); --dark-surface: var(--srf-1);
  --color-navy: var(--field-1); --color-navy-mid: var(--srf-2); --color-navy-deep: var(--field-0);
  --color-primary: var(--signal-300); --color-primary-light: var(--signal-200);
  --color-primary-dark: var(--signal-500);
  --color-accent: var(--signal-300); --color-accent-light: var(--signal-200);
  --color-gold: var(--signal-300); --color-gold-light: var(--signal-200);
  --color-surface: var(--srf-1); --color-surface-2: var(--srf-2);
  --color-surface-3: var(--srf-3); --color-surface-4: var(--srf-4);
}
```

## 3. Surfaces & effects (the reusable block)

```css
/* Canvas: the landing stack — field light, survey grid, then content. */
.landing-canvas { position: relative; isolation: isolate; background-color: var(--field-1); overflow-x: clip; }
.landing-canvas::before { /* one light source, high-left, static */
  content: ""; position: absolute; inset: 0 0 auto 0; height: 190vh; pointer-events: none; z-index: -1;
  background:
    radial-gradient(90rem 52rem at 22% -8%, rgba(var(--rgb-signal),.18), transparent 62%),
    radial-gradient(60rem 40rem at 88% 6%, rgba(239,198,102,.08), transparent 60%),
    radial-gradient(70rem 46rem at 50% 78%, rgba(4,4,5,.85), transparent 70%);
}
.landing-canvas::after { /* survey grid, fades before footer */
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: -1; opacity: .5;
  background-image: linear-gradient(to right, var(--line-1) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--line-1) 1px, transparent 1px);
  background-size: 88px 88px;
  mask-image: linear-gradient(to bottom, #000 0, #000 62%, transparent 96%);
}
/* Name canvas children explicitly — a blanket `.landing-canvas > *` rule once
   rewrote position:fixed to relative and pushed the page down 100vh. */
.landing-canvas > main, .landing-canvas > footer { position: relative; z-index: 1; }

/* Opaque surface ladder — nothing here uses backdrop-filter */
.surface, .card-base, .glass-tile {
  background-color: var(--srf-1);
  background-image: linear-gradient(180deg, rgba(255,255,255,.035), transparent 42%);
  border: 1px solid var(--line-2); border-radius: var(--r-3);
  box-shadow: var(--shadow-md), inset 0 1px 0 var(--line-lit);
}
.surface-raised, .glass-tile-elevated {
  background-color: var(--srf-2);
  border: 1px solid var(--line-3); border-radius: var(--r-4);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.09);
}
/* The app-wide card: dashboard, admin, practice, notes all inherit this. */
.glass-tile-glow {
  background-color: var(--srf-1);
  background-image: linear-gradient(180deg, rgba(255,255,255,.035), transparent 42%);
  border: 1px solid var(--line-2); border-radius: var(--r-3);
  box-shadow: var(--shadow-md), inset 0 1px 0 var(--line-lit);
  transition: transform var(--dur-2) var(--ease-out-quart), box-shadow var(--dur-2) var(--ease-out-quart),
              border-color var(--dur-2) var(--ease-out-quart), background-color var(--dur-2) var(--ease-out-quart);
}
.glass-tile-glow:hover {
  transform: translateY(-2px); background-color: var(--srf-2); border-color: var(--line-3);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.09);
}
/* Specular highlight that tracks the pointer (JS sets --tile-glow-x/y). */
.glass-shine { position: relative; overflow: hidden; }
.glass-shine::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0;
  transition: opacity var(--dur-2) var(--ease-out-quart);
  background: radial-gradient(22rem 16rem at var(--tile-glow-x,50%) var(--tile-glow-y,0%),
    rgba(var(--rgb-signal),.16), rgba(var(--rgb-signal),.05) 42%, transparent 72%);
}
.glass-shine:hover::before { opacity: 1; }
/* Single light pass on hover — never a looping shimmer. */
.card-sheen { position: relative; overflow: hidden; }
.card-sheen::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-120%);
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.06) 48%, transparent 62%);
  transition: transform .7s var(--ease-out-quart);
}
.card-sheen:hover::after { transform: translateX(120%); }

/* Nav material: the ONE translucent layer. Opaque fallback for browsers
   without backdrop-filter and for prefers-reduced-transparency. */
.nav-material {
  background: var(--nav-blur) rgba(10,10,10,.72);
  border-bottom: 1px solid var(--line-2);
  box-shadow: 0 8px 32px rgba(2,5,12,.45);
}
@supports not (backdrop-filter: blur(1px)) {
  .nav-material { background: rgba(10,10,10,.92); }
}

/* Hero aurora: three soft blobs that drift only with scroll/pointer writers,
   never an infinite CSS loop. */
.hero-aurora { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.hero-blob { position: absolute; border-radius: 50%; filter: blur(74px); mix-blend-mode: screen; will-change: transform; }
.hero-blob-1 { width: 52vw; height: 52vw; min-width: 460px; left: -12%; top: -24%;
  background: radial-gradient(circle at 38% 38%, rgba(var(--rgb-signal),.38) 0%, rgba(var(--rgb-signal),.18) 46%, transparent 72%); }
.hero-blob-2 { width: 44vw; height: 44vw; min-width: 420px; right: -14%; top: -8%;
  background: radial-gradient(circle at 60% 40%, rgba(231,206,150,.30) 0%, rgba(var(--rgb-signal),.18) 48%, transparent 78%); }
.hero-blob-3 { width: 40vw; height: 40vw; min-width: 360px; left: 20%; bottom: -30%;
  background: radial-gradient(circle at 50% 50%, rgba(247,236,205,.14) 0%, rgba(var(--rgb-signal),.09) 44%, transparent 70%); }

/* Film grain: static SVG turbulence, cheap and universal. */
.film-grain { position: absolute; inset: 0; pointer-events: none; opacity: .045;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px; }

/* Gradient type */
.text-gradient {
  background: linear-gradient(120deg, var(--signal-200), var(--signal-400) 55%, var(--brass));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
/* Section seam — hairline brightening to centre */
.section-glow-divider { position: relative; }
.section-glow-divider::before {
  content: ""; position: absolute; top: 0; left: 50%; translate: -50% 0;
  width: min(1100px, 92%); height: 1px; pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--line-3) 22%, var(--line-signal) 50%, var(--line-3) 78%, transparent);
}
/* 44px hit area without changing layout */
.tap-44 { position: relative; }
.tap-44::after { content: ""; position: absolute; inset: -6px; }

/* GLOBAL reduced-motion kill switch: durations AND delays. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 4. The 4-theme colour-wheel engine (complete)

Four palettes: **Midnight Gold** (default = `:root`), **Forest**, **Wine**,
**Iris**. Each alternate overrides ONLY the accent tokens (accent-only swaps —
the field, surfaces, and text stay the same calm dark), so every component that
reads a token recolours automatically.

### 4a. `components/ThemeProvider.tsx` — copy verbatim, rename storage key

```tsx
"use client";
// Theme engine: applies a data-theme attribute on <html> (midnight | emerald |
// crimson | violet). All recolouring happens in CSS via [data-theme] blocks;
// this component only sets the attribute, persists it, and avoids a flash of
// the wrong theme (FOUC) via the inline <head> script in layout.tsx.
import { useEffect, useState, type ReactNode } from "react";

export type ThemeId = "midnight" | "emerald" | "crimson" | "violet";

export const THEMES: { id: ThemeId; label: string; dots: [string, string, string] }[] = [
  { id: "midnight", label: "Midnight Gold", dots: ["#0A0A0A", "#C9A24B", "#F3E0AE"] },
  { id: "emerald",  label: "Forest",        dots: ["#0A0A0A", "#3FAE8B", "#C9A24B"] },
  { id: "crimson",  label: "Wine",          dots: ["#0A0A0A", "#BC5267", "#D9AE54"] },
  { id: "violet",   label: "Iris",          dots: ["#0A0A0A", "#7260C0", "#C9A24B"] },
];

const STORAGE_KEY = "cadet-prep-theme"; // ← rename for MED, e.g. "med-prep-theme"

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "midnight";
  return (window.__SITE_THEME__ as ThemeId) || "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode */ }
  }, [theme]);
  useEffect(() => { window.__SITE_THEME__ = theme; }, [theme]);
  return <>{children}</>;
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  window.__SITE_THEME__ = theme;
}
export function getTheme(): ThemeId {
  return (window.__SITE_THEME__ as ThemeId) || "midnight";
}
declare global { interface Window { __SITE_THEME__?: ThemeId } }
```

### 4b. FOUC-prevention script — put in `app/layout.tsx` `<head>`

```tsx
<script dangerouslySetInnerHTML={{ __html:
  `(function(){try{var t=localStorage.getItem("med-prep-theme");var valid={midnight:1,emerald:1,crimson:1,violet:1};if(t&&valid[t]){document.documentElement.dataset.theme=t;window.__SITE_THEME__=t;}}catch(e){}})();`
}} />
```

### 4c. `components/ThemeSwitcher.tsx` — nav dots (complete, ships in the kit)

The full component is in the cadet repo at `components/ThemeSwitcher.tsx` and is
self-contained: a 36px trigger dot showing the active theme's signal colour, a
popover `role="menu"` of three-dot swatches with labels, outside-click and
Escape to close, `aria-checked` state. Copy it as-is; only rename the storage
key import path if you renamed it.

### 4d. `components/ThemeWheel.tsx` — the hero colour wheel (complete)

A ring split into four quadrants over a conic-gradient disc, hole-punched with a
CSS mask (zero raster work, crisp at any size). Click a quadrant to switch the
whole site's palette; the active quadrant carries a lit outer ring; the centre
hub shows the active colour. Full code ships in the cadet repo
(`components/ThemeWheel.tsx`) and is drop-in. Render it in the hero's right
column and next to `ThemeSwitcher` in the nav.

### 4e. Theme palette blocks — add to the end of globals.css

Each block overrides only accent tokens; `::selection` recolours per theme.
Copy the three `[data-theme="emerald|crimson|violet"]` blocks from the cadet
`app/globals.css` (lines ~1568–1740) — they are complete, contrast-checked, and
include `--on-cta: #FFFFFF` (the deep palettes' 600/700 fills are dark enough
for white ink; only gold needs dark ink).

## 5. Typography & fonts

```tsx
// app/layout.tsx — next/font self-hosts everything (zero third-party origins)
import { Inter, Sora } from "next/font/google";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Display face: Sora's flat-sided bowls and squared terminals read as
// "engineered" rather than friendly — the register this brand wants.
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
// <html className={`${inter.variable} ${sora.variable}`}>
```

No font preconnects are needed: self-hosted fonts mean no DNS+TLS round trips
to fonts.googleapis/gstatic on cold mobile loads. Utility labels use
`.label { font-size: .8125rem; font-weight: 600; letter-spacing: .005em; color: var(--steel-400); }`
— sentence case, no tracked-out caps (that's the tell of a template).
