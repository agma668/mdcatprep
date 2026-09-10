"use client";

/**
 * Cheap scroll-progress reader for the landing page's animation loops.
 *
 * The crest and glossy-form canvases used to poll `getComputedStyle(html)`
 * for `--rail` every animation frame (60×/s) purely to learn how far the page
 * had scrolled — and that getter forces a synchronous style/layout
 * recalculation every call, which is precisely the reflow cost that makes a
 * busy scroll feel stuck.
 *
 * This instead reads `window.scrollY` (free — no layout) against a runway
 * cached at most twice a second, so the loops ask for nothing per frame.
 * `ScrollEffects` still drives `--rail` for the CSS-only progress bars; these
 * are two readers of the same truth, and this one is the no-reflow path.
 */

let runway = -1;
let lastMeasure = 0;

/** 0 → 1 progress of the whole document's scroll, no forcing of layout. */
export function pageScrollProgress(): number {
  const now = performance.now();
  if (runway < 0 || now - lastMeasure > 500) {
    lastMeasure = now;
    const doc = document.documentElement;
    runway = Math.max(1, doc.scrollHeight - window.innerHeight);
  }
  const scrolled = Math.min(Math.max(0, window.scrollY), runway);
  return scrolled / runway;
}