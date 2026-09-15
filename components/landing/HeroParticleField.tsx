"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/Motion";
import { snoise3 } from "./noise3";

/**
 * Hero particle field — a canvas-2D port of antigravity.google's
 * `MainParticlesComponent` (their deployed script was extracted and its two
 * shaders re-implemented point-by-point on the CPU). Antigravity's hero
 * constants are used verbatim:
 * ringWidth 0.006 · ringWidth2 0.107 · ringDisplacement 0.62 · scale 0.59.
 *
 * Behaviour, exactly as on antigravity:
 *  - Hundreds of tiny soft particles drift on layered simplex noise.
 *  - A breathing ring follows the cursor (radius 0.175 ± sin/cos wobble,
 *    exponential trailing — time-based, frame-rate independent). Inside a
 *    wide band around that ring, particles are DISPLACED outward with
 *    noise-driven excitation — the scatter cloud around the cursor.
 *  - Each particle ROTATES to sit tangentially around the cursor (angle to
 *    ring center + half a noise wobble), like iron filings around a magnet.
 *  - Particles are invisible at rest (alpha ramps in with sim scale > 0.1)
 *    and brighten/swell inside the ring band; velocity feeds into scale.
 *  - When the pointer is away, the ring wanders on its own noise path.
 *
 * Shapes & smoothness (2026-09-11, founder ask: ONE non-rectangular shape
 * for every particle, with LESS lag):
 *  - Every particle is the SAME shape — a teardrop (no squares anywhere).
 *    Shapes are pre-rendered into ONE sprite atlas (48 gradient colors,
 *    64px cells) and stamped with drawImage — a single GPU-resident texture,
 *    measurably cheaper per particle than path fills (arc/ellipse build a
 *    path every call) and unconditionally antialiased, so edges are softer
 *    than fillRect at any scale.
 *  - Fixed-timestep simulation (30 Hz — antigravity's own cadence) decoupled
 *    from the render loop, which runs at full rAF rate: the cursor ring and
 *    particle stamping stay smooth even though physics steps at 30 Hz.
 *  - Noise staggering: the expensive per-particle displacement/rotation
 *    noise is recomputed for half the particles per sim tick (alternating),
 *    halving the dominant CPU cost with no visible difference — the noise
 *    field evolves slowly.
 *  - Budget far-field: particles outside the ring band skip ALL noise work
 *    (cheap deterministic shimmer instead) — they are near-invisible there,
 *    and this is what keeps the sim flat-cost, so the field never stalls the
 *    page even mid-sweep.
 *  - Follow tuning (2026-09-11, "stuck" fix): the ring chases the pointer
 *    with a fast time constant (k=14/s ≈ 70 ms to catch up) and almost no
 *    wander while the pointer is inside — the cloud follows the cursor
 *    instead of lagging a screen behind it.
 *  - When the pointer is away, the ring wanders on its own noise path, so
 *    the field stays alive.
 *
 * Deviations (both documented, both necessary):
 *  - WebGL → canvas 2D: same math, CPU sim.
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

// ── Sprite atlas ────────────────────────────────────────────────────────────
// One canvas: 1 shape column (teardrop) × 48 color rows, 64px cells.
// The shape is painted to FILL the cell, so a stamp of side `bbox` renders
// the drop at that size. (The first cut drew ~36% of the cell and shrank
// every particle to a third of its target size — the invisible-field bug.)
const CELL = 64;
const SHAPE_N = 1;
// Destination bbox per particle, as a multiple of its `size` — calibrated so
// the drop's visible round head matches the old square's footprint: the
// square filled `size` × `size`; the head is ~0.46 of the bbox width, so the
// bbox needs ~2.2× the square's side for the same head diameter.
const SHAPE_BBOX = 2.2;

function paintTear(g: CanvasRenderingContext2D) {
  // Classic drop: round back (radius r at origin) + tip at (L, 0), tangent
  // curves joining them. Tip points along +X — with the tangential rotation
  // applied at draw time, drops swirl tail-first around the cursor ring.
  // Geometry is expressed in units of the CELL and scaled to fill it:
  // the drop spans [-0.5·CELL, +0.5·CELL] on x and its head nearly the
  // full cell height, so the painted shape IS the cell.
  const r = CELL * 0.23;   // head radius — head diameter ≈ 0.46·CELL
  const L = CELL * 0.5;    // tip at the cell's right edge
  const a = Math.acos(Math.min(1, r / L)); // tangent angle
  const tx = r * Math.cos(a);
  const ty = r * Math.sin(a);
  const cxL = L * 0.52;
  const cyL = r * 1.32;
  g.beginPath();
  g.arc(0, 0, r, a, Math.PI * 2 - a); // the round back, long way around
  g.quadraticCurveTo(cxL, -cyL, L, 0);
  g.quadraticCurveTo(cxL, cyL, tx, ty);
  g.closePath();
  g.fill();
}

const PAINTERS = [paintTear];

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
    // Touch / coarse-pointer devices: no pointer to chase, and full-frame
    // simulator noise is the mobile-lag culprit. Keep the field desktop-only.
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
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
    // Cached noise outputs (staggered recompute — see loop).
    let dxCache = new Float32Array(0);
    let dyCache = new Float32Array(0);
    let rotCache = new Float32Array(0);

    // ── Sprite atlas (built lazily per color row) ──
    const atlas = document.createElement("canvas");
    atlas.width = SHAPE_N * CELL;
    atlas.height = LUT_N * CELL;
    const atlasCtx = atlas.getContext("2d");
    const rowPainted = new Uint8Array(LUT_N);
    const ensureAtlasRow = (row: number) => {
      if (!atlasCtx || rowPainted[row]) return;
      atlasCtx.save();
      for (let s = 0; s < SHAPE_N; s++) {
        atlasCtx.save();
        atlasCtx.translate(s * CELL + CELL / 2, row * CELL + CELL / 2);
        atlasCtx.fillStyle = COLOR_LUT[row];
        PAINTERS[s](atlasCtx);
        atlasCtx.restore();
      }
      atlasCtx.restore();
      rowPainted[row] = 1;
    };

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
      // (their WebGL field is denser; the CPU sim keeps the same look).
      const mobile = w < 768;
      const spacing = Math.max(mobile ? 13 : 11, Math.min(22, Math.sqrt(w * h) * 0.0125));
      // Their density→distance mapping j(density,0,300,10,2)/(…,11,3), density 230:
      const t = 230 / 300;
      const minDist = spacing;
      const maxDist = (spacing * (11 + (3 - 11) * t)) / (10 + (2 - 10) * t);
      const pts = poissonFill(w, h, minDist, maxDist, 20260911);
      count = pts.length;
      rx = new Float32Array(count);
      ry = new Float32Array(count);
      posx = new Float32Array(count);
      posy = new Float32Array(count);
      scale = new Float32Array(count);
      vel = new Float32Array(count);
      colorIdx = new Uint8Array(count);
      dxCache = new Float32Array(count);
      dyCache = new Float32Array(count);
      rotCache = new Float32Array(count);
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

    // ── Loop: fixed-timestep sim (40 Hz) + full-rate smooth render ─────────
    const SIM_DT = 1 / 40;
    let raf = 0;
    let last = 0;
    let simTime = 0;
    let simAcc = 0;
    let simTick = 0;
    let onScreen = true;

    // Idempotent, so a re-entry storm cannot stack loops.
    const start = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) start();
    });
    io.observe(canvas);

    // One physics step — the position-update fragment shader math. The
    // dominant cost is the simplex noise, so particles FAR outside the ring
    // band take a noise-free budget path instead (cheap shimmer, decay) —
    // they are invisible or near-invisible anyway, and skipping their noise
    // is what keeps the sim cheap enough to never stall.
    const simStep = () => {
      simTick++;
      // Breathing ring radius (their exact formula).
      const R = 0.175 + Math.sin(simTime) * 0.03 + Math.cos(simTime * 3) * 0.02;
      const bandMax = R + RING_WIDTH2 * 2.2;
      const refreshColor = simTick % 10 === 0;

      for (let i = 0; i < count; i++) {
        const cxr = (rx[i] / w) * 2 - 1; // ref in [-1,1]
        const cyr = -((ry[i] / h) * 2 - 1);

        const dist = Math.hypot(cxr - ringX, cyr - ringY);

        // ── Far-field budget path: outside the band → no noise calls.
        //    Fades toward a faint pseudo-random shimmer (deterministic per
        //    particle) so the ambient field stays barely-alive without the
        //    per-particle simplex cost.
        if (dist > bandMax) {
          const tb = 0.1 + 0.08 * Math.sin(simTime * 0.7 + i * 1.7);
          scale[i] += (tb - scale[i]) * 0.2;
          posx[i] *= 0.8;
          posy[i] *= 0.8;
          vel[i] *= 0.5;
          continue;
        }

        // ── Ring-band excitation (their t / t2 / t3, exact) ──
        const noise0 = snoise3(cxr * 0.2 + 18.4924, cyr * 0.2 + 72.9744, simTime * 0.25);
        const dist1 = Math.hypot(cxr + noise0 * 0.005 - ringX, cyr + noise0 * 0.005 - ringY);
        let t1 = sstep(R - RING_WIDTH * 2, R, dist) - sstep(R, R + RING_WIDTH, dist1);
        t1 = t1 * t1;
        let t2 = sstep(R - RING_WIDTH2 * 2, R, dist) - sstep(R, R + RING_WIDTH2, dist1);
        t2 = t2 * t2 * t2;
        const t3 = sstep(R + RING_WIDTH2, R, dist);
        let t = t1 + t2 * 3 + t3 * 0.4;
        // Ambient baseline inside the band only — antigravity's value (0.6)
        // lights the whole field; a low value keeps the excitation focused on
        // the ring so the follow reads clearly.
        const nS = snoise3(cxr * 2 + 18.4924, cyr * 2 + 72.9744, simTime * 0.25);
        t += (nS + 1.5) * 0.5 * ((nS + 1.5) * 0.5) * 0.22;

        // ── Displacement field, staggered: half the particles per tick.
        //    The noise field evolves slowly, so alternating halves is
        //    visually indistinguishable and halves the dominant cost.
        if ((simTick + i) % 2 === 0) {
          const n1 = snoise3(cxr * 4 + 88.494, cyr * 4 + 32.4397, simTime * 0.175);
          const n2 = snoise3(cxr * 4 + 50.904, cyr * 4 + 120.947, simTime * 0.175);
          const n3 = snoise3(cxr * 20 + 18.4924, cyr * 20 + 72.9744, simTime * 0.25);
          const n4 = snoise3(cxr * 20 + 50.904, cyr * 20 + 120.947, simTime * 0.25);
          let dx = n1 * 0.03 + n3 * 0.005;
          let dy = n2 * 0.03 + n4 * 0.005;
          const cd = Math.min(dist, 1);
          dx += Math.sin(cxr * 20 + simTime * 2) * 0.02 * cd;
          dy += Math.cos(cyr * 20 + simTime * 1.5) * 0.02 * cd;
          dxCache[i] = dx;
          dyCache[i] = dy;
          rotCache[i] = snoise3(cxr * 10 + 18.4924, cyr * 10 + 72.9744, simTime * 0.425);
        }
        const dx = dxCache[i];
        const dy = dyCache[i];

        posx[i] *= 0.8;
        posy[i] *= 0.8;
        const pull = Math.pow(t2, 0.75) * RING_DISPLACEMENT;
        posx[i] -= (ringX - (cxr + dx)) * pull;
        posy[i] -= (ringY - (cyr + dy)) * pull;

        scale[i] += (t - scale[i]) * 0.2;
        vel[i] *= 0.5;
        vel[i] += scale[i] * 0.25;

        if (refreshColor) {
          const fx = cxr + dx + posx[i] * 0.25;
          const fy = cyr + dy + posy[i] * 0.25;
          const nc = (snoise3(fx * 2 + 74.664, fy * 2 + 91.556, simTime * 0.25) + 1) * 0.5;
          const progress = sstep(0, 0.75, nc * nc);
          colorIdx[i] = Math.min(LUT_N - 1, (progress * (LUT_N - 1)) | 0);
        }
      }
    };

    const frame = (now: number) => {
      // HALT, don't idle. Re-arming first and early-returning keeps a frame
      // booked 60 times a second for the whole session — including every second
      // the hero is scrolled off, which is most of a study session. The loop is
      // restarted by the observer below when the hero comes back.
      if (!onScreen || document.hidden) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;

      // ── Ring target: the cursor while present. Two fixes so the cloud
      //    actually FOLLOWS: (1) a fast time constant — k=3/s meant the ring
      //    took ~1s to arrive after a sweep (the "stuck" feel); k=14/s
      //    catches the pointer in ~70ms. (2) almost no wander added on top
      //    of the pointer while inside — the old ±10%-of-width drunken sway
      //    made the target visibly drift off the cursor.
      const wx = snoise3(simTime * 0.66, 94.234, 0) * 0.2;
      const wy = snoise3(simTime * 0.75, 21.028, 0) * 0.1;
      const tx = inside ? cursorX + wx * 0.15 : wx;
      const ty = inside ? cursorY + wy * 0.15 : wy;
      const k = inside ? 14.0 : 1.4; // 1/s — glued to the cursor, dreamy when idle
      const a = 1 - Math.exp(-dt * k);
      ringX += (tx - ringX) * a;
      ringY += (ty - ringY) * a;

      // Fixed-timestep sim.
      simAcc += dt;
      let steps = 0;
      while (simAcc >= SIM_DT && steps < 2) {
        simAcc -= SIM_DT;
        simTime += SIM_DT;
        simStep();
        steps++;
      }
      if (steps === 2) simAcc = 0; // fell too far behind — drop the backlog

      // ── Render: stamp the atlas sprites (single GPU texture) ──
      // A zero-sized backing store still pays for every draw call, so bail
      // before the per-particle pass rather than drawing nothing, N times.
      if (w <= 0 || h <= 0) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < count; i++) {
        const s = scale[i];
        if (s <= 0.1) continue; // alpha smoothstep(0.1, 0.2, scale) gate
        const alpha = sstep(0.1, 0.2, s);
        if (alpha < 0.02) continue;

        const cxr = (rx[i] / w) * 2 - 1;
        const cyr = -((ry[i] / h) * 2 - 1);
        const fx = cxr + dxCache[i] + posx[i] * 0.25;
        const fy = cyr + dyCache[i] + posy[i] * 0.25;

        const sx = (fx + 1) * 0.5 * w;
        const sy = (1 - fy) * 0.5 * h;
        // Tangential rotation: angle to ring center, tip trailing —
        // teardrops swirl like iron filings around the cursor.
        const ang = Math.atan2(fy - ringY, fx - ringX);
        const rot = -ang + rotCache[i] * 0.5;

        const size = s * 7 * (dpr * 0.5) * particleScale; // their gl_PointSize
        if (size < 0.25) continue;

        const row = colorIdx[i];
        ensureAtlasRow(row);

        const bbox = size * SHAPE_BBOX;
        const half = bbox * 0.5;
        ctx.globalAlpha = alpha;
        ctx.setTransform(
          dpr * Math.cos(rot),
          dpr * Math.sin(rot),
          -dpr * Math.sin(rot),
          dpr * Math.cos(rot),
          dpr * sx,
          dpr * sy
        );
        ctx.drawImage(atlas, 0, row * CELL, CELL, CELL, -half, -half, bbox, bbox);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    start();

    // The canvas is the hero's own atmosphere: it costs nothing once the hero
    // is gone.
    const onVisibility = () => {
      if (onScreen && !document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
    };
  }, [reduced]);

  if (reduced) return null;
  // NOTE: there used to be a second render-time gate here —
  // `if (window.matchMedia("(pointer: coarse)").matches) return null` — and it
  // was a hydration mismatch on every phone. The server cannot know the pointer
  // type, so it renders the `<canvas>`; the client's FIRST render then disagreed
  // and threw React error #418 ("hydration failed because the initial UI does
  // not match what was rendered on the server"), which React recovers from by
  // throwing the tree away and re-rendering every one of these canvases client
  // side. The pointer check belongs in the effect above, which already returns
  // before `getContext` on a coarse pointer — so on a phone this element has no
  // backing store, draws nothing and runs no loop, exactly as the `null` did,
  // and is `pointer-events-none` on top of that. The canvas stays in the DOM so
  // server and client agree.

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
