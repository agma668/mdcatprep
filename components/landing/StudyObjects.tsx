'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Atom,
  BookOpen,
  Brain,
  Compass,
  FlaskConical,
  Sigma,
  type LucideIcon,
} from 'lucide-react';

/**
 * A watermark of the actual paper, drifting behind the countdown band.
 *
 * Six things that are genuinely on a cadet-college entry test — comprehension,
 * maths, chemistry, geometry, physics and the IQ section — not six decorative
 * shapes. They sit in the outer margins in `--steel-500`, the non-text steel,
 * so they read as engraving on the page rather than as content.
 *
 * The `.study-objects` / `.study-object` CSS this drives already lives in
 * globals.css, including two fail-closed rules: the layer is `display:none`
 * below 768px and `display:none !important` under prefers-reduced-motion. So
 * this file's only job is the drift, and it does no work in either case.
 * Nothing enters the DOM until the band is first scrolled to, which is also
 * what makes the entrance land on arrival instead of playing unseen at load.
 */

// One visual stroke weight across all six regardless of size — the same
// engraved line, enlarged, rather than six different pen thicknesses. lucide
// draws on a 24-unit grid, so the width has to be divided back down.
const HAIRLINE = 1.4;

const OBJECTS: {
  key: string;
  Icon: LucideIcon;
  side: 'left' | 'right';
  inset: string;
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  speed: number;
}[] = [
  { key: 'book', Icon: BookOpen, side: 'left', inset: '3%', top: '10%', size: 88, rotate: -12, opacity: 0.2, speed: 0.06 },
  { key: 'sigma', Icon: Sigma, side: 'left', inset: '10%', top: '46%', size: 56, rotate: 9, opacity: 0.13, speed: -0.045 },
  { key: 'flask', Icon: FlaskConical, side: 'left', inset: '5%', top: '78%', size: 48, rotate: -7, opacity: 0.1, speed: 0.03 },
  { key: 'compass', Icon: Compass, side: 'right', inset: '4%', top: '6%', size: 96, rotate: 14, opacity: 0.18, speed: -0.07 },
  { key: 'atom', Icon: Atom, side: 'right', inset: '11%', top: '40%', size: 64, rotate: -6, opacity: 0.14, speed: 0.05 },
  { key: 'brain', Icon: Brain, side: 'right', inset: '5%', top: '74%', size: 52, rotate: 11, opacity: 0.11, speed: -0.035 },
];

export function StudyObjects() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Both of the CSS opt-outs, checked here too: if the layer is hidden there
    // is nothing to drive, and no reason to hold a scroll listener open.
    if (
      window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let onScreen = false;
    let queued = false;

    const drift = () => {
      queued = false;
      if (!onScreen) return;
      const box = host.getBoundingClientRect();
      // Measured from the band's own centre, so the drift is zero as it passes
      // the middle of the screen and symmetric either side of it.
      const fromCentre = box.top + box.height / 2 - window.innerHeight / 2;
      host.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
        const speed = Number.parseFloat(el.dataset.speed || '0');
        el.style.setProperty('--obj-y', `${(fromCentre * speed).toFixed(1)}px`);
      });
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(drift);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          setArrived(true);
          onScroll();
        }
      },
      { rootMargin: '15% 0px' },
    );
    io.observe(host);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={hostRef} className="study-objects" aria-hidden="true">
      {arrived &&
        OBJECTS.map(({ key, Icon, side, inset, top, size, rotate, opacity, speed }, i) => (
          <span
            key={key}
            data-speed={speed}
            className="study-object"
            style={
              {
                left: side === 'left' ? inset : undefined,
                right: side === 'right' ? inset : undefined,
                top,
                width: size,
                height: size,
                animationDelay: `${i * 90}ms`,
                '--obj-r': `${rotate}deg`,
                '--obj-o': String(opacity),
              } as React.CSSProperties
            }
          >
            <Icon strokeWidth={(24 / size) * HAIRLINE} />
          </span>
        ))}
    </div>
  );
}
