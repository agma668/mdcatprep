'use client';

import { useEffect, useRef } from 'react';

/**
 * The page's one scroll-and-pointer layer. Three jobs:
 *
 * 1. `--rail` on <html>, 0 → 1 across the document. Both progress indicators
 *    are pure CSS reading that single number — a ticked rail down the left
 *    margin on desktop, a hairline bar across the top on phones. The previous
 *    version wrote `transform: scaleX()` straight onto the bar element, which
 *    beat `.scroll-progress`'s own `scaleX(var(--rail))` and left `--rail`
 *    unset, so the desktop rail was never rendered or filled at all.
 * 2. Parallax on the hero's ambient blobs, only while the hero is on screen.
 *    Now also writes `--section-index` and `--section-progress` for per-section
 *    scroll-linked animations.
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
  '#why-acma',
  '#cadet-colleges',
  '#faq',
  '#register',
  '#cta',
];

export function ScrollEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);
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
    };

    const onFrame = () => {
      queued = false;
      const scrolled = window.scrollY;
      const runway = root.scrollHeight - window.innerHeight;
      const rail = runway > 0 ? Math.min(1, Math.max(0, scrolled / runway)) : 0;
      root.style.setProperty('--rail', rail.toFixed(4));

      // Compute section progress
      const viewportCenter = scrolled + window.innerHeight / 2;
      let currentSection = 0;
      let sectionProgress = 0;

      for (let i = 0; i < sectionBounds.length; i++) {
        const b = sectionBounds[i];
        if (viewportCenter >= b.top && viewportCenter <= b.bottom) {
          currentSection = b.index;
          sectionProgress = (viewportCenter - b.top) / (b.bottom - b.top);
          break;
        } else if (viewportCenter < b.top) {
          // Before first section
          currentSection = Math.max(0, b.index - 1);
          sectionProgress = 0;
          break;
        }
        // After last section
        if (i === sectionBounds.length - 1) {
          currentSection = b.index;
          sectionProgress = 1;
        }
      }

      root.style.setProperty('--section-index', String(currentSection));
      root.style.setProperty('--section-progress', Math.min(1, Math.max(0, sectionProgress)).toFixed(4));

      if (reduced || !heroVisible) return;
      const blobs = parallaxRef.current?.querySelectorAll<HTMLElement>('[data-speed]');
      blobs?.forEach((blob) => {
        const speed = Number.parseFloat(blob.dataset.speed || '0.15');
        blob.style.transform = `translate3d(0, ${(scrolled * speed).toFixed(1)}px, 0)`;
      });
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

    // The parallax is the hero's own atmosphere, so it stops being computed
    // once the hero has scrolled away.
    const heroEl = document.querySelector('[aria-label="Hero"]');
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
      <div className="ascent-rail" aria-hidden="true">
        <div className="ascent-rail__fill" />
        <div className="ascent-rail__bead" />
      </div>
      <div className="scroll-progress" aria-hidden="true" />

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