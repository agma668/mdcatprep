'use client';

import { useEffect } from 'react';

/**
 * Momentum scrolling, landing page only.
 *
 * Gated four ways before a single byte is fetched: a fine pointer on a ≥1024px
 * viewport (a touchscreen already has momentum scrolling and does not need 5 kB
 * to get it), no prefers-reduced-motion, and no Save-Data. The import lives
 * inside the effect, so on a phone the module is never requested.
 *
 * The scroll mapping stays 1:1. This eases the travel between two positions; it
 * does not take the scroll over, pin sections to it, or change where anything
 * lands. Anchor links go through Lenis's own `anchors` option, so `#features`
 * still arrives exactly where the markup says.
 *
 * Lenis's built-in rAF runs for the lifetime of the page. This drives it by
 * hand instead and lets it stop once scrolling settles, so an idle tab asks for
 * no frames — the same rule ScrollEffects follows. Anything that throws here
 * leaves native scrolling exactly as it was.
 */

// Frames to keep spinning after Lenis reports it has settled. Long enough for a
// programmatic scrollTo to be picked up on the frame after the click that
// triggered it, short enough to be invisible.
const GRACE = 12;

// = `html { scroll-padding-top: 5.5rem }` in globals.css, in pixels.
const NAV_CLEARANCE = 88;

export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Someone on a metered connection asked for fewer bytes. This is 5 kB of
    // feel — it should be the first thing to go.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;

    let disposed = false;
    let dispose: (() => void) | undefined;

    import('lenis')
      .then(({ default: Lenis }) => {
        if (disposed) return;

        const lenis = new Lenis({
          duration: 0.9,
          // Cubic ease-out: quick to answer the wheel, slow to come to rest.
          easing: (t) => 1 - Math.pow(1 - t, 3),
          autoRaf: false,
          // Lenis reads offsetTop and knows nothing about scroll-padding-top,
          // so the sticky bar's clearance has to be handed to it explicitly.
          // Keep this in step with `html { scroll-padding-top }` in globals.css.
          anchors: { offset: -NAV_CLEARANCE },
        });

        let raf = 0;
        let grace = 0;

        const frame = (time: number) => {
          raf = 0;
          lenis.raf(time);
          grace = lenis.isScrolling ? GRACE : grace - 1;
          if (grace > 0) raf = requestAnimationFrame(frame);
        };

        const wake = () => {
          grace = GRACE;
          if (!raf) raf = requestAnimationFrame(frame);
        };

        // Wheel and touch arrive as virtual-scroll; native scroll covers a
        // scrollbar drag; keydown and click cover keyboard scrolling and the
        // anchor jumps Lenis performs itself.
        const offVirtual = lenis.on('virtual-scroll', wake);
        window.addEventListener('scroll', wake, { passive: true });
        window.addEventListener('keydown', wake, { passive: true });
        document.addEventListener('click', wake, { passive: true });

        dispose = () => {
          offVirtual();
          window.removeEventListener('scroll', wake);
          window.removeEventListener('keydown', wake);
          document.removeEventListener('click', wake);
          if (raf) cancelAnimationFrame(raf);
          lenis.destroy();
        };
      })
      .catch(() => {
        // Native scroll is the fallback, and it is already running.
      });

    return () => {
      disposed = true;
      dispose?.();
    };
  }, []);

  return null;
}
