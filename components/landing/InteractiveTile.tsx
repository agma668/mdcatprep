"use client";

import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef } from "react";

type InteractiveTileProps = {
  children: ReactNode;
  className?: string;
  /** Increase tilt intensity (default 6) */
  intensity?: number;
};

/**
 * Adds a 3D tilt response that follows the mouse cursor.
 * Cards physically rotate toward the pointer, with a glassmorphic highlight
 * that shifts position. Only activates for mouse/trackpad users.
 *
 * FRAME BUDGET — the bounds are cached, not re-measured. `getBoundingClientRect()`
 * forces a synchronous style+layout flush, and this used to call it inside every
 * `pointermove`, i.e. on every event the pointer produced. A pointer sweeping the
 * page emits far more moves than there are frames, and a landing page carries
 * many tiles, so that was a burst of forced layouts the browser could not batch —
 * the same defect class this repo already fixed once in the cadet scroll layer
 * (a per-frame `getComputedStyle` read). The rect is now measured on
 * `pointerenter` and re-measured only when something could actually have moved
 * the tile: scroll or resize, both passive and both coalesced to one frame.
 *
 * The four custom properties written per frame are consumed by
 * `.interactive-tile` (rotation) and `.glass-shine::before` (the hotspot). They
 * are written on the tile, never on <html> — an unregistered property on the root
 * would invalidate the whole document's computed style per frame.
 *
 * Safety: every property has a CSS fallback (`--tile-rx` defaults to `0deg`,
 * `--tile-glow-x/y` to `50% / 0%`), so a tile whose JS never runs is flat and
 * still shows its highlight — nothing depends on this effect having run.
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
  // Cached bounds. `null` means "must measure before the next use".
  const boundsRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const remeasureRef = useRef(false);

  // A tile can move without the pointer moving: the page scrolls, or the
  // viewport resizes. Invalidate rather than listen-and-re-measure, so a
  // 60-per-second scroll costs no layout at all while the pointer is still.
  useEffect(() => {
    const invalidate = () => {
      remeasureRef.current = true;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  function measure() {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const bounds = { left: r.left, top: r.top, width: r.width, height: r.height };
    boundsRef.current = bounds;
    remeasureRef.current = false;
    return bounds;
  }

  function handlePointerEnter() {
    if (remeasureRef.current || !boundsRef.current) measure();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;

    const bounds = remeasureRef.current || !boundsRef.current ? measure() : boundsRef.current;
    if (!bounds || !bounds.width || !bounds.height) return;

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
    // The pointer left, so the cached rect is no longer trustworthy; the next
    // hover measures again.
    boundsRef.current = null;
    targetRef.current = { rx: 0, ry: 0, gx: 50, gy: 0 };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(lerp);
    }
  }

  return (
    <div
      ref={ref}
      className={`interactive-tile ${className}`}
      onPointerEnter={handlePointerEnter}
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
