"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/Motion";
import { snoise3 } from "./noise3";

/**
 * Hero particle field — a canvas-2D port of antigravity.google's
 * `MainParticlesComponent` (their deployed script was extracted and its two
 * shaders re-implemented point-by-point on the CPU; every constant below is
 * theirs, and the hero's own attribute values are used verbatim:
 * ringWidth 0.006 · ringWidth2 0.107 · ringDisplacement 0.62 · scale 0.59).
 *
 * Behaviour, exactly as on antigravity:
 *  - Thousands of tiny capsule dashes drift on layered simplex noise.
 *  - A breathing ring follows the cursor (radius 0.175 ± sin/cos wobble,
 *    trailing lerp 0.02/frame — 0.01 when idle). Inside a wide band around
 *    that ring, particles are DISPLACED outward with noise-driven
 *    excitation — the scatter cloud you see around the cursor.
 *  - Each dash ROTATES to sit tangentially around the cursor (angle to ring
 *    center + half a noise wobble), like iron filings around a magnet.
 *  - Dashes are invisible at rest (alpha ramps in with sim scale > 0.1) and
 *    brighten/swell inside the ring band; velocity feeds back into scale.
 *  - When the pointer is away, the ring wanders on its own noise path, so
 *    the field stays alive.
 *
 * Deviations (both documented, both necessary):
 *  - WebGL → canvas 2D: same math, CPU sim, ~30 fps cadence (antigravity
 *    itself skips every other frame). Point budget scales with viewport
 *    area so low-end devices stay smooth.
 *  - Palette: antigravity's dark theme is blue-heavy with a BLACK final
 *    stop, which would vanish on this site's dark hero — the black stop is
 *    replaced with antigravity's own light-theme yellow (#ffcf03).
 */

const PALETTE: readonly [string, string, string] = ["#7189ff", "#3074f9", "#ffcf03"];

// 3-stop gradient exactly as the fragment shader mixes it: progress comes
// from noise, h = 0.8 splits the two mix ranges.
const LUT_N = 48;
const COLOR_LUT: string[] = (() => {
  const hex = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [c1, c2, c3] = [hex(PALETTE[0]), hex(PALETTE[1]), hex(PALETTE[2])];
  const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const out: string[] = [];
  for (let i = 0; i < LUT_N; i++) {
    const nc = i / (LUT_N - 1);
    const progress = smooth(0, 0.75, nc * nc);
    const h = 0.8;
    const rgb = progress < h
      ? mix(c1, c2, progress / h)
      : mix(c2, c3, (progress - h) / (1 - h));
    out.push(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
  }
  return out;
})();

// GLSL smoothstep clone — works with reversed edges (edge0 > edge1), which
// the original shader relies on for its inverted ramp near the ring.
function sstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Bridson poisson-disk sampling in a w×h box, seeded (deterministic). */
function poissonFill(w: number, h: number, minDist: number, maxDist: number, seed: number): Array<[number, number]> {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const cell = minDist / Math.SQRT2;
  const gw = Math.ceil(w / cell);
  const gh = Math.ceil(h / cell);
  const grid = new Int32Array(gw * gh).fill(-1);
  const pts: Array<[number, number]> = [];
  const active: number[] = [];
  const gridAt = (x: number, y: number) => {
    const gx = Math.min(gw - 1, Math.max(0, (x / cell) | 0));
    const gy = Math.min(gh - 1, Math.max(0, (y / cell) | 0));
    return gy * gw + gx;
  };
  const fits = (x: number, y: number) => {
    const gx = (x / cell) | 0;
    const gy = (y / cell) | 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const idx = grid[ny * gw + nx];
        if (idx >= 0) {
          const [qx, qy] = pts[idx];
          if ((x - qx) * (x - qx) + (y - qy) * (y - qy) < minDist * minDist) return false;
        }
      }
    }
    return true;
  };
  const first: [number, number] = [rand() * w, rand() * h];
  pts.push(first);
  active.push(0);
  grid[gridAt(first[0], first[1])] = 0;
  const tries = 20; // the original lib's tries value
  while (active.length) {
    const ai = (rand() * active.length) | 0;
    const origin = pts[active[ai]];
    let placed = false;
    for (let k = 0; k < tries; k++) {
      const ang = rand() * Math.PI * 2;
      const rad = minDist + rand() * (maxDist - minDist);
      const x = origin[0] + Math.cos(ang) * rad;
      const y = origin[1] + Math.sin(ang) * rad;
      if (x < 0 || y < 0 || x >= w || y >= h || !fits(x, y)) continue;
      grid[gridAt(x, y)] = pts.length;
      pts.push([x, y]);
      active.push(pts.length - 1);
      placed = true;
      break;
    }
    if (!placed) active.splice(ai, 1);
  }
  return pts;
}

export function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── antigravity's hero constants (data- attributes on their section) ──
    const RING_WIDTH = 0.006;
    const RING_WIDTH2 = 0.107;
    const RING_DISPLACEMENT = 0.62;
    const PARTICLES_SCALE = 0.59;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particleScale = 0;

    // Field state (per point: ref, pos, scale, velocity — the GPGPU
    // position texture, flattened to typed arrays).
    let count = 0;
    let rx = new Float32Array(0);
    let ry = new Float32Array(0);
    let posx = new Float32Array(0);
    let posy = new Float32Array(0);
    let scale = new Float32Array(0);
    let vel = new Float32Array(0);
    let colorIdx = new Uint8Array(0);
    let colorTick = 0;

    const build = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth || window.innerWidth;
      h = parent?.clientHeight || 480;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particleScale = (w / 2000) * PARTICLES_SCALE; // their particleScale formula

      // Point budget: poisson spacing chosen so counts stay canvas-friendly
      // (their WebGL field is denser; 30 fps canvas keeps the same look).
      const mobile = w < 768;
      const spacing = Math.max(mobile ? 13 : 11, Math.min(22, (Math.sqrt(w * h) * 0.0125) / 1));
      // Their density→distance mapping j(density,0,300,10,2)/(…,11,3), density 230:
      const t = 230 / 300;
      const minDist = spacing;
      const maxDist = spacing * (11 + (3 - 11) * t) / (10 + (2 - 10) * t);
      const pts = poissonFill(w, h, minDist, maxDist, 20260911);
      count = pts.length;
      rx = new Float32Array(count);
      ry = new Float32Array(count);
      posx = new Float32Array(count);
      posy = new Float32Array(count);
      scale = new Float32Array(count);
      vel = new Float32Array(count);
      colorIdx = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        rx[i] = pts[i][0];
        ry[i] = pts[i][1];
        posx[i] = 0;
        posy[i] = 0;
      }
    };

    build();
    const ro = new ResizeObserver(build);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Cursor / ring state ────────────────────────────────────────────────
    let cursorX = 0; // normalized [-1, 1], y up — the sim's coordinate space
    let cursorY = 0;
    let ringX = 0;
    let ringY = 0;
    let inside = false;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursorY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
    };
    const onLeaveDoc = () => {
      inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);

    // ── Render loop (30 fps — antigravity itself skips every other frame) ──
    let raf = 0;
    let last = 0;
    let time = 0;
    let onScreen = true;

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen || document.hidden) return;
      if (now - last < 1000 / 32) return; // ~30 fps cadence
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;
      time += dt;

      // Ring target: cursor when present, otherwise a noise wander (the
      // original's idle cursorPos). Trailing lerp 0.02 inside / 0.01 idle —
      // doubled to compensate the halved frame rate.
      const wx = snoise3(time * 0.66, 94.234, 0) * 0.2;
      const wy = snoise3(time * 0.75, 21.028, 0) * 0.1;
      const tx = inside ? cursorX * 1 + wx * 0.5 : wx;
      const ty = inside ? cursorY * 1 + wy * 0.5 : wy;
      const lerp = inside ? 0.04 : 0.02;
      ringX += (tx - ringX) * lerp;
      ringY += (ty - ringY) * lerp;

      // Breathing ring radius (their exact formula).
      const R = 0.175 + Math.sin(time) * 0.03 + Math.cos(time * 3) * 0.02;

      ctx.clearRect(0, 0, w, h);

      // Colors refresh slowly and staggered (the shader's noiseColor).
      colorTick++;
      const refreshColor = colorTick % 6 === 0;

      for (let i = 0; i < count; i++) {
        const cxr = rx[i] / w * 2 - 1; // ref in [-1,1]
        const cyr = -(ry[i] / h * 2 - 1);

        const dist = Math.hypot(cxr - ringX, cyr - ringY);

        // ── Sim (the position-update fragment shader, verbatim math) ──
        const noise0 = snoise3(cxr * 0.2 + 18.4924, cyr * 0.2 + 72.9744, time * 0.25);
        const dist1 = Math.hypot(cxr + noise0 * 0.005 - ringX, cyr + noise0 * 0.005 - ringY);

        let t1 = sstep(R - RING_WIDTH * 2, R, dist) - sstep(R, R + RING_WIDTH, dist1);
        t1 = t1 * t1;
        let t2 = sstep(R - RING_WIDTH2 * 2, R, dist) - sstep(R, R + RING_WIDTH2, dist1);
        t2 = t2 * t2 * t2;
        const t3 = sstep(R + RING_WIDTH2, R, dist);

        let t = t1 + t2 * 3 + t3 * 0.4;
        const nS = snoise3(cxr * 2 + 18.4924, cyr * 2 + 72.9744, time * 0.25);
        t += (nS + 1.5) * 0.5 * ((nS + 1.5) * 0.5) * 0.6;

        // Mid + close scale noise → displacement field.
        const n1 = snoise3(cxr * 4 + 88.494, cyr * 4 + 32.4397, time * 0.175);
        const n2 = snoise3(cxr * 4 + 50.904, cyr * 4 + 120.947, time * 0.175);
        const n3 = snoise3(cxr * 20 + 18.4924, cyr * 20 + 72.9744, time * 0.25);
        const n4 = snoise3(cxr * 20 + 50.904, cyr * 20 + 120.947, time * 0.25);
        let dx = n1 * 0.03 + n3 * 0.005;
        let dy = n2 * 0.03 + n4 * 0.005;
        const cd = Math.min(dist, 1);
        dx += Math.sin(cxr * 20 + time * 2) * 0.02 * cd;
        dy += Math.cos(cyr * 20 + time * 1.5) * 0.02 * cd;

        posx[i] *= 0.8;
        posy[i] *= 0.8;
        const pull = Math.pow(t2, 0.75) * RING_DISPLACEMENT;
        posx[i] -= (ringX - (cxr + dx)) * pull;
        posy[i] -= (ringY - (cyr + dy)) * pull;

        scale[i] += (t - scale[i]) * 0.2;

        const fx = cxr + dx + posx[i] * 0.25;
        const fy = cyr + dy + posy[i] * 0.25;

        vel[i] *= 0.5;
        vel[i] += scale[i] * 0.25;

        // ── Render (the point fragment shader) ─────────────────────────────
        const s = scale[i];
        if (s <= 0.1) continue; // alpha smoothstep(0.1, 0.2, scale) gate
        const alpha = Math.min(1, sstep(0.1, 0.2, s));
        if (alpha < 0.02) continue;

        if (refreshColor) {
          const nc = (snoise3(fx * 2 + 74.664, fy * 2 + 91.556, time * 0.25) + 1) * 0.5;
          const progress = sstep(0, 0.75, nc * nc);
          colorIdx[i] = Math.min(LUT_N - 1, (progress * (LUT_N - 1)) | 0);
        }

        // Screen space (field [-1,1] → px), tangential rotation.
        const sx = (fx + 1) * 0.5 * w;
        const sy = (1 - fy) * 0.5 * h;
        const ang = Math.atan2(fy - ringY, fx - ringX);
        const na = snoise3(fx * 10 + 18.4924, fy * 10 + 72.9744, time * 0.425);
        const rot = -ang + na * 0.5;

        const size = s * 7 * (dpr * 0.5) * particleScale; // their gl_PointSize
        if (size < 0.25) continue;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLOR_LUT[colorIdx[i]];
        ctx.setTransform(
          dpr * Math.cos(rot),
          dpr * Math.sin(rot),
          -dpr * Math.sin(rot),
          dpr * Math.cos(rot),
          dpr * sx,
          dpr * sy
        );
        // Capsule ratio from sdRoundBox(uv, (0.5, 0.2), 0.25): 1.5 × 0.9.
        ctx.fillRect(-size * 0.75, -size * 0.45, size * 1.5, size * 0.9);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
