"use client";

import { useEffect, useRef } from "react";
import {
  CREST_VIEWBOX,
  LAUREL_LEAVES,
  LAUREL_STEMS,
  LEAF_RX,
  LEAF_RY,
  projectMotes,
  projectStar,
  type Mote,
  type StarView,
  generateMatcap,
} from "@/lib/crest-3d";
import { CadetCrestStatic } from "./CadetCrestStatic";
import { pageScrollProgress } from "@/lib/scroll-progress";

/** A 3x backing store on a low-end phone buys nothing but dropped frames. */
const DPR_CAP = 1.5;
/** Idle motion is a slow compound sway, not a full spin: the star stays a
 *  legible star instead of passing through an edge-on sliver every few
 *  seconds. A tap adds one real revolution on top (see onSalute).
 *  Scroll progress modulates the amplitude. */
const SWAY = (t: number, scrollProgress: number) =>
  (0.42 + scrollProgress * 0.25) * Math.sin(t * 0.28) + (0.12 + scrollProgress * 0.08) * Math.sin(t * 0.63);
const SWAY_PITCH = (t: number, scrollProgress: number) =>
  (0.1 + scrollProgress * 0.06) * Math.sin(t * 0.37 + 1.1);
/** In viewBox units: matches the static polygon's 40px outer radius. */
const STAR_R = 40;
const FIELD_R = 80;
const CENTER = CREST_VIEWBOX / 2;
const TAU = Math.PI * 2;
/** Shine sweep timing, matching the .cadet-crest__shine keyframes. */
const SHINE_CYCLE = 6.5;
const SHINE_SWEEP = 2.2;

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/** Mote trail for salute effect. */
interface MoteTrail {
  x: number;
  y: number;
  size: number;
  alpha: number;
  age: number;
}

function ring(g: CanvasRenderingContext2D, r: number) {
  g.beginPath();
  g.arc(CENTER, CENTER, r, 0, TAU);
  g.stroke();
}

function disc(g: CanvasRenderingContext2D, r: number, fill: string | CanvasGradient) {
  g.beginPath();
  g.arc(CENTER, CENTER, r, 0, TAU);
  g.fillStyle = fill;
  g.fill();
}

/**
 * Rings, field, glow and laurel never move, so they are painted once into an
 * offscreen canvas and blitted each frame. Drawn in the shipped 200x200
 * viewBox coordinates, so these numbers are the SVG's numbers.
 */
function paintBackdrop(g: CanvasRenderingContext2D) {
  const brass = g.createLinearGradient(4, 4, 196, 196);
  brass.addColorStop(0, "#f2dc96");
  brass.addColorStop(0.5, "#c9a24b");
  brass.addColorStop(1, "#8f7233");

  g.save();
  g.setLineDash([3.2, 4.6]);
  g.lineWidth = 2.4;
  g.strokeStyle = "rgba(201,162,75,0.55)";
  ring(g, 96);
  g.restore();

  g.lineWidth = 5;
  g.strokeStyle = brass;
  ring(g, 89);
  g.lineWidth = 1;
  g.strokeStyle = "rgba(201,162,75,0.35)";
  ring(g, 83.5);

  const field = g.createRadialGradient(77.6, 68, 0, 77.6, 68, CREST_VIEWBOX * 0.8);
  field.addColorStop(0, "#1c2b47");
  field.addColorStop(0.65, "#101a30");
  field.addColorStop(1, "#0a1120");
  disc(g, FIELD_R, field);

  const glow = g.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, FIELD_R);
  glow.addColorStop(0, "rgba(201,162,75,0.5)");
  glow.addColorStop(1, "rgba(201,162,75,0)");
  disc(g, FIELD_R, glow);

  g.save();
  g.setLineDash([1, 4]);
  g.lineWidth = 1;
  g.strokeStyle = "rgba(201,162,75,0.28)";
  ring(g, 66);
  g.restore();

  g.strokeStyle = brass;
  g.lineWidth = 2.2;
  g.lineCap = "round";
  for (const s of LAUREL_STEMS) {
    g.beginPath();
    g.moveTo(s.from[0], s.from[1]);
    g.bezierCurveTo(s.c1[0], s.c1[1], s.c2[0], s.c2[1], s.to[0], s.to[1]);
    g.stroke();
  }
  for (const l of LAUREL_LEAVES) {
    const leaf = g.createLinearGradient(0, l.y - LEAF_RX, 0, l.y + LEAF_RX);
    leaf.addColorStop(0, "#f7e6ae");
    leaf.addColorStop(0.55, "#d9b45c");
    leaf.addColorStop(1, "#8f7233");
    g.fillStyle = leaf;
    g.beginPath();
    g.ellipse(l.x, l.y, LEAF_RX, LEAF_RY, (l.rot * Math.PI) / 180, 0, TAU);
    g.fill();
  }
}

/** A gold mote with a soft halo (two arcs beats an expensive shadowBlur). */
function paintMote(g: CanvasRenderingContext2D, m: Mote) {
  g.fillStyle = "#f2dc96";
  g.globalAlpha = m.alpha * 0.22;
  g.beginPath();
  g.arc(m.x, m.y, m.size * 2.6, 0, TAU);
  g.fill();
  g.globalAlpha = m.alpha;
  g.beginPath();
  g.arc(m.x, m.y, m.size, 0, TAU);
  g.fill();
  g.globalAlpha = 1;
}

/** Paint mote trails during salute. */
function paintMoteTrails(g: CanvasRenderingContext2D, trails: MoteTrail[]) {
  for (const t of trails) {
    if (t.age > 1) continue;
    g.fillStyle = "#f2dc96";
    g.globalAlpha = t.alpha * (1 - t.age) * 0.4;
    g.beginPath();
    g.arc(t.x, t.y, t.size * 2, 0, TAU);
    g.fill();
    g.globalAlpha = 1;
  }
}

/** The shine sweep: same rect, gradient and clip as the SVG version. */
function paintShine(g: CanvasRenderingContext2D, clock: number) {
  const phase = (clock + SHINE_CYCLE - 1.6) % SHINE_CYCLE;
  if (phase > SHINE_SWEEP) return;
  const x = -140 + (phase / SHINE_SWEEP) * (CREST_VIEWBOX + 140);
  g.save();
  g.beginPath();
  g.arc(CENTER, CENTER, FIELD_R, 0, TAU);
  g.clip();
  const grad = g.createLinearGradient(x, 0, x + 140, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.16)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(x, -10, 140, 220);
  g.restore();
}

/** Facets, back to front. Each is stroked in its own colour so the shared
 *  edges do not show antialiasing seams. */
function paintStar(g: CanvasRenderingContext2D, view: StarView) {
  for (const f of projectStar(view)) {
    const paint = `rgb(${f.r},${f.g},${f.b})`;
    g.fillStyle = paint;
    g.strokeStyle = paint;
    g.lineWidth = 0.4;
    g.beginPath();
    g.moveTo(f.pts[0][0], f.pts[0][1]);
    g.lineTo(f.pts[1][0], f.pts[1][1]);
    g.lineTo(f.pts[2][0], f.pts[2][1]);
    g.closePath();
    g.fill();
    g.stroke();
  }
}

export function CadetCrestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const backdrop = document.createElement("canvas");
    const bctx = backdrop.getContext("2d");
    // Fail closed: with no 2D context we paint nothing and the static crest
    // underneath is simply never faded out.
    if (!ctx || !bctx) return;

    const staticLayer = staticRef.current;
    let w = 1;
    let h = 1;
    let size = 1;
    let dpr = 1;
    let painted = false;
    let rect = canvas.getBoundingClientRect();
    let rectStale = false;

    const measure = () => {
      rect = canvas.getBoundingClientRect();
      rectStale = false;
    };

    const resize = () => {
      measure();
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      size = Math.min(w, h);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      backdrop.width = canvas.width;
      backdrop.height = canvas.height;
      // Setting width/height clears, so the backdrop is repainted here only.
      const k = (size / CREST_VIEWBOX) * dpr;
      bctx.setTransform(k, 0, 0, k, ((w - size) / 2) * dpr, ((h - size) / 2) * dpr);
      paintBackdrop(bctx);
    };
    /* Pointer state. The listener is on window so the crest tracks the cursor
       anywhere over the hero, and the canvas only takes the tap itself. */
    let px = 0;
    let py = 0;
    let tiltY = 0;
    let tiltX = 0;
    let spin = 0;
    let spinTarget = 0;
    let clock = 0;
    let bloom = 0;
    let scrollProgress = 0;
    let moteTrails: MoteTrail[] = [];

    const view: StarView = {
      yaw: 0,
      pitch: 0,
      cx: CENTER,
      cy: CENTER,
      radius: STAR_R,
      light: { x: 0, y: 0, z: 1 },
      bloom: 0,
      scrollProgress: 0,
      time: 0,
    };

    const draw = () => {
      const k = (size / CREST_VIEWBOX) * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(backdrop, 0, 0);
      ctx.setTransform(k, 0, 0, k, ((w - size) / 2) * dpr, ((h - size) / 2) * dpr);

      view.yaw = SWAY(clock, scrollProgress) + spin + tiltY;
      view.pitch = SWAY_PITCH(clock, scrollProgress) + tiltX;
      view.bloom = bloom;
      view.scrollProgress = scrollProgress;
      view.time = clock;
      const lx = -0.45 + clamp(px, -1.2, 1.2) * 0.7;
      const ly = 0.55 - clamp(py, -1.2, 1.2) * 0.7;
      const ll = Math.hypot(lx, ly, 0.85) || 1;
      view.light = { x: lx / ll, y: ly / ll, z: 0.85 / ll };

      const motes = projectMotes(view, clock);
      for (const m of motes) if (m.behind) paintMote(ctx, m);

      // Add mote trails during salute bloom
      if (bloom > 0.1) {
        for (const m of motes) {
          if (!m.behind) {
            moteTrails.push({
              x: m.x,
              y: m.y,
              size: m.size,
              alpha: m.alpha * 0.8,
              age: 0,
            });
          }
        }
      }

      if (bloom > 0.01) {
        const flare = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, STAR_R * 1.9);
        flare.addColorStop(0, `rgba(242,220,150,${0.34 * bloom})`);
        flare.addColorStop(1, "rgba(242,220,150,0)");
        disc(ctx, STAR_R * 1.9, flare);
      }
      paintStar(ctx, view);
      for (const m of motes) if (!m.behind) paintMote(ctx, m);
      paintMoteTrails(ctx, moteTrails);
      paintShine(ctx, clock);

      if (!painted) {
        painted = true;
        canvas.style.opacity = "1";
        if (staticLayer) staticLayer.style.opacity = "0";
      }
    };
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const frame = (now: number) => {
      // Offscreen or backgrounded: drop the loop entirely rather than burn a
      // student's battery on an emblem they cannot see.
      if (!onScreen || document.hidden) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      clock += dt;
      // The salute eases into a whole extra turn, so it always lands back on
      // the resting angle instead of snapping or drifting off-centre.
      spin += (spinTarget - spin) * (1 - Math.exp(-dt * 2.4));
      if (Math.abs(spinTarget - spin) < 1e-3) {
        spin %= TAU;
        spinTarget = spin;
      }
      bloom *= Math.exp(-dt * 2.2);
      // Update mote trails
      moteTrails = moteTrails.map(t => ({ ...t, age: t.age + dt * 3 })).filter(t => t.age <= 1);
      // Frame-rate independent easing toward the pointer.
      const ease = 1 - Math.exp(-dt * 6);
      tiltY += (clamp(px, -1.2, 1.2) * 0.5 - tiltY) * ease;
      tiltX += (-clamp(py, -1.2, 1.2) * 0.32 - tiltX) * ease;

      // Read scroll progress from the no-reflow helper (ScrollEffects owns
      // `--rail` for the CSS bars; this canvas reads the same truth cheaply).
      scrollProgress = pageScrollProgress();

      draw();
    };

    const start = () => {
      if (!raf && onScreen && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (rectStale) measure();
      px = clamp((e.clientX - (rect.left + rect.width / 2)) / (rect.width || 1), -2, 2);
      py = clamp((e.clientY - (rect.top + rect.height / 2)) / (rect.height || 1), -2, 2);
    };
    // Tap the crest: a short salute — one full turn, and the brass flares.
    const onSalute = () => {
      bloom = 1;
      spinTarget += TAU;
      start();
    };
    const onScroll = () => {
      rectStale = true;
    };
    const onVisibility = () => start();

    const ro = new ResizeObserver(() => {
      resize();
      start();
    });
    const io = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      start();
    });
    ro.observe(canvas);
    io.observe(canvas);
    canvas.addEventListener("pointerdown", onSalute);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onSalute);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      {/* The shipped SVG stays under the canvas until the first real frame:
          first paint, and the fallback if the canvas never draws. */}
      <div
        ref={staticRef}
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: 1 }}
      >
        <CadetCrestStatic />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: 0 }}
      />
    </>
  );
}