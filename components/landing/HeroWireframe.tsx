'use client';

import {
  Atom,
  BookOpen,
  Brain,
  FlaskConical,
  GraduationCap,
  Sigma,
  type LucideIcon,
} from 'lucide-react';

/**
 * HeroWireframe — a constellation of floating glowing line-icons behind the
 * "preparation plan" card. It replaces the old glossy 3D dodecahedron
 * (GlossyForm), which rendered ~60 faces with per-frame transforms and a
 * style reflow every frame — the paid cost was lag on exactly the component a
 * visitor sees first.
 *
 * What it costs instead: six inline SVG line-icons (lucide) that float off a
 * single CSS keyframe on `translate3d` (compositor-only, no layout) and a
 * punched-in glow via `drop-shadow`. There is no rAF loop, no canvas, no
 * getComputedStyle, and no scroll-driven rotation — so an idle page asks the
 * compositor for nothing beyond the tiny float. Reduced motion and data-saver
 * fall back to the static constellation with no animation. Icons are the real
 * papers' subjects (comprehension, maths, chemistry, IQ, physics, geometry),
 * matching the StudyObjects layer's honesty rule.
 *
 * Rendered `display:none` under `@media (max-width: 767px)` and
 * `prefers-reduced-motion` in globals.css (.hero-wireframe), so a phone never
 * pays for it at all.
 */

const HAIRLINE = 1.4;

const ICONS: {
  key: string;
  Icon: LucideIcon;
  inset: 'left' | 'right';
  x: string;
  y: string;
  size: number;
  rotate: number;
  opacity: number;
  delay: number;
}[] = [
  { key: 'book', Icon: BookOpen, inset: 'left', x: '2%', y: '6%', size: 74, rotate: -12, opacity: 0.32, delay: 0.1 },
  { key: 'sigma', Icon: Sigma, inset: 'left', x: '12%', y: '58%', size: 48, rotate: 9, opacity: 0.24, delay: 0.5 },
  { key: 'flask', Icon: FlaskConical, inset: 'left', x: '6%', y: '86%', size: 44, rotate: -7, opacity: 0.2, delay: 1.1 },
  { key: 'grad', Icon: GraduationCap, inset: 'right', x: '2%', y: '10%', size: 66, rotate: 14, opacity: 0.3, delay: 0.3 },
  { key: 'atom', Icon: Atom, inset: 'right', x: '14%', y: '52%', size: 54, rotate: -6, opacity: 0.26, delay: 0.7 },
  { key: 'brain', Icon: Brain, inset: 'right', x: '6%', y: '84%', size: 46, rotate: 11, opacity: 0.2, delay: 1.4 },
];

export function HeroWireframe() {
  return (
    <div className="hero-wireframe" aria-hidden="true">
      {ICONS.map(({ key, Icon, inset, x, y, size, rotate, opacity, delay }) => (
        <span
          key={key}
          className="hero-wireframe__icon"
          style={
            {
              [inset]: x,
              top: y,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              '--wf-r': `${rotate}deg`,
              '--wf-o': String(opacity),
            } as React.CSSProperties
          }
        >
          <Icon strokeWidth={(24 / size) * HAIRLINE} />
        </span>
      ))}
    </div>
  );
}