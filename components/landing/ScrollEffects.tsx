'use client';

import { useEffect, useRef } from 'react';

/**
 * The page's one scroll-and-pointer layer. Three jobs:
 *
 * 1. `--rail`, 0 → 1 across the document. Both progress indicators are pure CSS
 *    reading that single number — a ticked rail down the left margin on
 *    desktop, a hairline bar across the top on phones. The previous version
 *    wrote `transform: scaleX()` straight onto the bar element, which beat
 *    `.scroll-progress`'s own `scaleX(var(--rail))` and left `--rail` unset, so
 *    the desktop rail was never rendered or filled at all.
 * 2. `--hero-exit` (0 → 1 across the hero's own height), which `.hero-depth`
 *    reads to give the hero its exit, plus the glow divider's .is-active class
 *    and parallax on the hero's ambient blobs while the hero is on screen.
 *
 * WHERE THESE GET WRITTEN IS A PERFORMANCE DECISION, and the source of the
 * landing page's worst measured cost. These custom properties are unregistered,
 * so they are inherited: writing one on `document.documentElement` invalidates
 * the computed style of the ENTIRE document, and the browser must re-run style
 * resolution for every element that could inherit it. This writer used to set
 * FOUR properties on <html> per scroll frame, two of which (`--section-index`,
 * `--section-progress`) had no consumer at all — a document-wide style recalc,
 * several times a frame, for two numbers nobody read and two that only three
 * small elements read. Measured cost of that: ~6.2 s of style recalculation in
 * an 8 s scroll (58% of main-thread time), 12 fps against a 40 fps floor.
 *
 * So each number is now written onto the smallest subtree that actually reads
 * it — `--rail` onto the two progress elements, `--hero-exit` onto `.hero-depth`
 * itself — and the two dead writes are gone. Never put a per-frame custom
 * property back on <html>.
 * 3. A cursor spotlight and its spark trail, fine pointers only.
 *
 * Frame budget: scroll work is coalesced to one frame per scroll event, and the
 * animation loop only spins while the cursor is moving or sparks are still
 * fading — at rest this component requests no frames at all. The version before
 * this held a 60fps loop open for the lifetime of the page, phones included,
 * where the spotlight and the canvas are `display:none` anyway.
 *
 * Reduced motion keeps the rail — a scroll position is information, not
 * decoration — and drops the parallax, the spotlight and the sparks entirely.
 */

// Enough sparks to read as a trail, few enough to stay cheap. Roughly a second
// and a half of stillness and the trail stops being fed.
const SPARK_CAP = 50;
const IDLE_FRAMES = 90;

// Section selectors for scroll linking
const SECTION_SELECTORS = [
  '[aria-label="Hero"]',
  '#features',
  '#how-it-works',
  '#mcq-demo',
  '#analytics-preview',
  '#exam-countdown',
  '#leaderboard-preview',
  '#why-med',
  '#cadet-colleges',
  '#faq',
  '#register',
  '#cta',
];

export function ScrollEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  // `--rail` is written on these two elements rather than on <html>; see the
  // frame-budget note above for why that distinction is the whole fix.
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const teardown: Array<() => void> = [];

    // ── 1 + 2. Scroll: rail progress, section progress, then hero parallax ──────────────────
    let queued = false;
    let heroVisible = true;
    let sections: HTMLElement[] = [];
    let sectionBounds: Array<{ top: number; bottom: number; index: number }> = [];
    // Measured on resize, not per frame: reading offsetHeight inside the frame
    // callback would force a layout on every scroll event.
    let heroEl: HTMLElement | null = null;
    let heroHeight = 1;
    // The single element that reads --hero-exit, resolved once rather than
    // per frame.
    let heroDepthEl: HTMLElement | null = null;
    // The last section whose glow was written, so the class toggle runs when
    // the section changes rather than sixty times a second.
    let lastGlow = -1;
    // Geometry cached by measureSections: the scroll runway and the parallax
    // elements. See the note there for why neither may be read per frame.
    let runway = 1;
    let blobs: HTMLElement[] = [];

    const measureSections = () => {
      sections = SECTION_SELECTORS.map(sel => document.querySelector(sel)).filter((el): el is HTMLElement => !!el);
      sectionBounds = sections.map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          index,
        };
      });
      heroEl = document.querySelector('[aria-label="Hero"]');
      heroHeight = heroEl?.offsetHeight || 1;
      heroDepthEl = document.querySelector('.hero-depth');
      // The scroll runway and the three parallax blobs are measured HERE, with
      // the rest of the geometry, instead of inside the frame callback. Reading
      // `scrollHeight` per frame is a forced synchronous layout: the previous
      // frame has just written inline styles, so the layout is dirty and the
      // read has to resolve the whole document before the browser will answer.
      // `querySelectorAll` on every frame is the same mistake in miniature.
      // A ResizeObserver keeps both honest as the page's height changes.
      runway = Math.max(1, root.scrollHeight - window.innerHeight);
      blobs = Array.from(parallaxRef.current?.querySelectorAll<HTMLElement>('[data-speed]') ?? []);
    };

    const onFrame = () => {
      queued = false;
      const scrolled = window.scrollY;
      // Cached runway, not `root.scrollHeight` — see measureSections.
      const rail = runway > 0 ? Math.min(1, Math.max(0, scrolled / runway)) : 0;
      // Written onto the two elements whose rules read it, NOT onto <html>:
      // a root write here invalidates the whole document's style each frame.
      const railText = rail.toFixed(4);
      railRef.current?.style.setProperty('--rail', railText);
      progressRef.current?.style.setProperty('--rail', railText);

      // Compute section progress
      const viewportCenter = scrolled + window.innerHeight / 2;
      let currentSection = 0;

      for (let i = 0; i < sectionBounds.length; i++) {
        const b = sectionBounds[i];
        if (viewportCenter >= b.top && viewportCenter <= b.bottom) {
          currentSection = b.index;
          break;
        } else if (viewportCenter < b.top) {
          // Before first section
          currentSection = Math.max(0, b.index - 1);
          break;
        }
        // After last section
        if (i === sectionBounds.length - 1) {
          currentSection = b.index;
        }
      }

      // `--section-index` and `--section-progress` used to be written here every
      // frame. Both were dead — no rule in globals.css (or anywhere else) ever
      // read them — so they were costing a full-document style invalidation per
      // scroll frame to publish two numbers nothing consumed. Only the class
      // toggle below genuinely needed `currentSection`.

      // The one consumer of --section-index that cannot read it from CSS: a
      // class toggle on the section carrying .section-glow-divider. It lives
      // beside the number it depends on and only fires on a section change.
      if (currentSection !== lastGlow) {
        lastGlow = currentSection;
        sections.forEach((el, i) => {
          if (el.classList.contains('section-glow-divider')) {
            el.classList.toggle('is-active', i === currentSection);
          }
        });
      }

      // Hero exit, for the .hero-depth rule: 0 at rest, 1 as the hero's last
      // pixel leaves. Published by this writer, so the exit costs no extra
      // listener or loop — and skipped under reduced motion, where the rule
      // would be an identity anyway.
      if (!reduced && heroVisible && heroEl) {
        const exit = Math.min(1, Math.max(0, scrolled / heroHeight));
        // Scoped to the one rule that reads it (.hero-depth), not <html>.
        heroDepthEl?.style.setProperty('--hero-exit', exit.toFixed(4));
      }

      if (reduced || !heroVisible) return;
      for (const blob of blobs) {
        const speed = Number.parseFloat(blob.dataset.speed || '0.15');
        blob.style.transform = `translate3d(0, ${(scrolled * speed).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(onFrame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      measureSections();
      onScroll();
    }, { passive: true });
    teardown.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });

    // Initial measure
    measureSections();
    onFrame();

    // The runway is cached, so it has to be re-measured when the document's
    // height changes under it — a late image, a font swap, a section that
    // expands. Without this the rail would stop being proportional to the page,
    // which is the exact failure this file's history warns about.
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        measureSections();
        onScroll();
      });
      // `body`, not `documentElement`: the root element's observed box tracks
      // the viewport, while the body is what actually grows with the content.
      ro.observe(document.body);
      teardown.push(() => ro.disconnect());
    }

    // The parallax is the hero's own atmosphere, so it stops being computed
    // once the hero has scrolled away.
    if (heroEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(heroEl);
      teardown.push(() => io.disconnect());
    }

    // ── 3. Pointer: spotlight + spark trail ────────────────────────────────
    const spotlight = spotlightRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!reduced && finePointer && spotlight && canvas && ctx) {
      // Backing store capped at 1.5×: a decorative trail is not worth asking a
      // 3× display to fill nine times the pixels.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let vw = window.innerWidth;
      let vh = window.innerHeight;

      const sizeCanvas = () => {
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        // CSS holds the element at viewport size (inset-0), so this one
        // transform lets everything below draw in plain CSS pixels.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas, { passive: true });
      teardown.push(() => window.removeEventListener('resize', sizeCanvas));

      // A canvas fillStyle cannot resolve var(), so the colour is read once
      // from the token's raw channels instead of being written out here.
      const sparkRgb =
        getComputedStyle(root).getPropertyValue('--rgb-steel').trim() || '198, 210, 228';

      type Spark = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        age: number;
        span: number;
        size: number;
      };
      const sparks: Spark[] = [];
      const target = { x: -200, y: -200 };
      const eye = { x: -200, y: -200 };
      let idle = IDLE_FRAMES + 1;
      let primed = false;
      let raf = 0;

      const tick = () => {
        raf = 0;
        eye.x += (target.x - eye.x) * 0.2;
        eye.y += (target.y - eye.y) * 0.2;
        spotlight.style.setProperty('--sx', `${eye.x.toFixed(1)}px`);
        spotlight.style.setProperty('--sy', `${eye.y.toFixed(1)}px`);

        if (idle <= IDLE_FRAMES && sparks.length < SPARK_CAP && Math.random() > 0.35) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.3 + Math.random() * 0.8;
          sparks.push({
            x: eye.x,
            y: eye.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            age: 0,
            span: 30 + Math.random() * 25,
            size: 0.5 + Math.random() * 1.2,
          });
        }

        ctx.clearRect(0, 0, vw, vh);
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.01; // a little gravity, so the trail settles downward
          s.age++;
          if (s.age >= s.span) {
            sparks.splice(i, 1);
            continue;
          }
          const t = s.age / s.span;
          const alpha = (t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7) * 0.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * (1 - t * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sparkRgb}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        idle++;
        // Cursor at rest and the last spark gone: stop asking for frames.
        if (idle > IDLE_FRAMES && sparks.length === 0) return;
        raf = requestAnimationFrame(tick);
      };

      const onMouse = (event: MouseEvent) => {
        target.x = event.clientX;
        target.y = event.clientY;
        // Snap on the first move, so the trail doesn't come flying in from the
        // corner the lerp happened to start at.
        if (!primed) {
          eye.x = target.x;
          eye.y = target.y;
          primed = true;
        }
        idle = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      window.addEventListener('mousemove', onMouse, { passive: true });
      teardown.push(() => {
        window.removeEventListener('mousemove', onMouse);
        if (raf) cancelAnimationFrame(raf);
      });
    }

    return () => teardown.forEach((off) => off());
  }, []);

  return (
    <>
      {/* One number, two instruments: a ticked ascent rail in the left margin
          on desktop, a hairline bar across the top on phones. Both are CSS-only
          and read --rail off <html>; the media queries in globals.css decide
          which of the two is showing. */}
      <div ref={railRef} className="ascent-rail" aria-hidden="true">
        <div className="ascent-rail__fill" />
        <div className="ascent-rail__bead" />
      </div>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />

      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
        style={{ '--sx': '-200px', '--sy': '-200px' } as React.CSSProperties}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(150px circle at var(--sx) var(--sy), rgba(var(--rgb-signal), 0.09), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80px circle at var(--sx) var(--sy), rgba(var(--rgb-steel), 0.05), transparent 40%)',
          }}
        />
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[6] hidden md:block"
      />

      {/* Hero atmosphere. The wide one is centred with a negative margin rather
          than -translate-x-1/2: the parallax writes `transform` on each of
          these every frame, and an inline transform silently cancels the
          utility — which is why that blob used to jump left on first scroll. */}
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          data-speed="0.15"
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(var(--rgb-signal), 0.07), transparent 60%)',
          }}
        />
        <div
          data-speed="0.25"
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(var(--rgb-steel), 0.045), transparent 55%)',
          }}
        />
        <div
          data-speed="0.1"
          className="absolute top-1/3 left-1/2 -ml-[300px] h-[400px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(var(--rgb-signal), 0.04), transparent 50%)',
          }}
        />
      </div>
    </>
  );
}