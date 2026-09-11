"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/Motion";

/**
 * Interactive 3D hero object — a rotating constellation sphere rendered on
 * one canvas: 3D points, perspective projection, painter-sorted dots and
 * edges. Zero dependencies, one rAF loop, compositor-only work.
 *
 * Interactivity model (antigravity/nexstudio feel):
 *  - The object auto-rotates slowly on its own.
 *  - Pointer movement adds a VELOCITY IMPULSE to the rotation (direction and
 *    magnitude), so the object swings with your cursor and keeps gliding with
 *    inertia, then eases back to its idle spin.
 *  - Hovering lights the nearest nodes (depth + proximity glow).
 *  - Hidden for prefers-reduced-motion (the component renders null).
 */

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Node extends Vec3 {
  size: number;
  color: [number, number, number];
  pulse: number;
}

interface EdgeRef {
  a: number;
  b: number;
}

// Deterministic PRNG so the object looks identical on every load.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fibonacciSphere(count: number): Vec3[] {
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

export function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.parentElement?.clientWidth || window.innerWidth;
    let h = canvas.parentElement?.clientHeight || 400;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      if (!canvas.parentElement) return;
      w = canvas.parentElement.clientWidth || window.innerWidth;
      h = canvas.parentElement.clientHeight || 400;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Build the object: nodes on a fibonacci sphere + nearest-neighbour
    //    edges, plus a handful of brighter "beacon" nodes. ─────────────────
    const rand = mulberry32(20260910);
    const NODE_COUNT = 64;
    const base = fibonacciSphere(NODE_COUNT);
    const nodes: Node[] = base.map((p, i) => ({
      ...p,
      size: 1.2 + rand() * 2.2,
      color:
        i % 7 === 0 ? ([201, 162, 75] as [number, number, number]) : i % 3 === 0 ? ([59, 130, 246] as [number, number, number]) : ([95, 211, 228] as [number, number, number]),
      pulse: rand() * Math.PI * 2,
    }));

    const edges: EdgeRef[] = [];
    const maxEdge = 0.62; // unit-sphere chord threshold
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = base[i].x - base[j].x;
        const dy = base[i].y - base[j].y;
        const dz = base[i].z - base[j].z;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < maxEdge) {
          edges.push({ a: i, b: j });
        }
      }
    }

    // ── Rotation state: quaternion-free. Two angular velocities + an angle
    //    each around world Y (spin) and camera X (pitch) is enough and keeps
    //    the math simple; impulses nudge the velocities. ────────────────────
    let angleY = 0;
    let angleX = 0;
    let velY = 0.0035; // idle spin
    let velX = 0.0012;
    const IDLE_VY = 0.0035;
    const IDLE_VX = 0.0012;
    const FRICTION = 0.965;

    // Pointer state (velocity impulse source)
    let px = -1000, py = -1000, prevX = -1000, prevY = -1000;
    let inside = false;
    let raf = 0;
    let onScreen = true;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      if (prevX !== -1000) {
        const dx = px - prevX;
        const dy = py - prevY;
        // Impulse ∝ pointer velocity; vertical movement pitches, horizontal spins.
        velY += dx * 0.00022;
        velX += dy * 0.00018;
        velY = Math.max(-0.09, Math.min(0.09, velY));
        velX = Math.max(-0.09, Math.min(0.09, velX));
      }
      prevX = px;
      prevY = py;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
      px = py = prevX = prevY = -1000;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    // Temporary projection buffers (no allocation in the loop).
    const rx = new Float32Array(NODE_COUNT);
    const ry = new Float32Array(NODE_COUNT);
    const rz = new Float32Array(NODE_COUNT);

    const loop = () => {
      if (!onScreen) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);

      angleY += velY;
      angleX += velX;
      // Ease velocities back to idle.
      velY += (IDLE_VY - velY) * 0.02;
      velX += (IDLE_VX - velX) * 0.02;
      if (!inside) {
        velY *= FRICTION + 0.02;
        velX *= FRICTION + 0.02;
      }

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.36;
      const persp = 2.6; // camera distance in unit-sphere radii
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Rotate + project every node.
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        // Y-axis rotation (spin)
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;
        const y1 = n.y;
        // X-axis rotation (pitch)
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const z3 = z2 + persp;
        const f = persp / z3;
        rx[i] = cx + x1 * scale * f;
        ry[i] = cy + y2 * scale * f;
        rz[i] = z3; // larger = farther
      }

      // Edges first (behind dots), alpha by depth.
      for (const { a, b } of edges) {
        const za = (rz[a] + rz[b]) / 2;
        const depth = 1 - (za - (persp - 1)) / 2; // 1 near, 0 far
        const alpha = Math.max(0, depth * 0.34);
        if (alpha <= 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(rx[a], ry[a]);
        ctx.lineTo(rx[b], ry[b]);
        ctx.strokeStyle = `rgba(95, 211, 228, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Dots, painter-sorted back → front, with a soft depth glow.
      const order = Array.from({ length: NODE_COUNT }, (_, i) => i).sort((a, b) => rz[b] - rz[a]);
      for (const i of order) {
        const n = nodes[i];
        const depth = 1 - (rz[i] - (persp - 1)) / 2; // 1 near, 0 far
        const alpha = 0.25 + depth * 0.7;
        const size = n.size * (0.55 + depth * 0.85);
        // Hover proximity glow.
        let glow = 0;
        if (inside) {
          const d = Math.hypot(px - rx[i], py - ry[i]);
          if (d < 110) glow = (1 - d / 110) * 0.5;
        }
        const [r, g, b] = n.color;
        if (glow > 0) {
          ctx.beginPath();
          ctx.arc(rx[i], ry[i], size * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(glow * 0.35).toFixed(3)})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(rx[i], ry[i], size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + glow).toFixed(3)})`;
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
