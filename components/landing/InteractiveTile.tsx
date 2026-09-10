"use client";

import { type CSSProperties, type PointerEvent, type ReactNode, useRef } from "react";

type InteractiveTileProps = {
  children: ReactNode;
  className?: string;
  /** Increase tilt intensity (default 6) */
  intensity?: number;
};

/**
 * Adds a deeper3D tilt response that follows the mouse cursor.
 * Cards physically rotate toward the pointer, with a glassmorphic highlight
 * that shifts position. Only activates for mouse/trackpad users.
 */
export function InteractiveTile({
  children,
  className = "",
  intensity = 6,
}: InteractiveTileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 0 });
  const currentRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 0 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;

    const bounds = ref.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    targetRef.current = {
      rx: -y * intensity,
      ry: x * intensity * 1.2,
      gx: (x + 0.5) * 100,
      gy: (y + 0.5) * 100,
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(lerp);
    }
  }

  function lerp() {
    const el = ref.current;
    if (!el) {
      rafRef.current = 0;
      return;
    }

    const t = 0.12; // smooth interpolation factor
    const c = currentRef.current;
    const tgt = targetRef.current;

    c.rx += (tgt.rx - c.rx) * t;
    c.ry += (tgt.ry - c.ry) * t;
    c.gx += (tgt.gx - c.gx) * t;
    c.gy += (tgt.gy - c.gy) * t;

    el.style.setProperty("--tile-rx", `${c.rx}deg`);
    el.style.setProperty("--tile-ry", `${c.ry}deg`);
    el.style.setProperty("--tile-glow-x", `${c.gx}%`);
    el.style.setProperty("--tile-glow-y", `${c.gy}%`);

    // Continue animating until close enough to target
    const dist = Math.abs(tgt.rx - c.rx) + Math.abs(tgt.ry - c.ry);
    if (dist > 0.01) {
      rafRef.current = requestAnimationFrame(lerp);
    } else {
      rafRef.current = 0;
    }
  }

  function resetTile() {
    targetRef.current = { rx: 0, ry: 0, gx: 50, gy: 0 };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(lerp);
    }
  }

  return (
    <div
      ref={ref}
      className={`interactive-tile ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTile}
      style={
        {
          "--tile-rx": "0deg",
          "--tile-ry": "0deg",
          "--tile-glow-x": "50%",
          "--tile-glow-y": "0%",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
