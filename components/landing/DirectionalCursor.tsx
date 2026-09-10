"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/Motion";

/**
 * Directional velocity cursor — recreates the nexstudio.tech cursor mechanics:
 *
 * - The dot LERPS toward the pointer (never snaps), so it flows behind you.
 * - Every frame it ROTATES toward the direction the pointer is moving
 *   (atan2 of the per-move delta, smoothed by shortest-path angle lerp), so
 *   the elongated dot points the way you move and swings around corners.
 * - It STRETCHES along its motion axis with pointer speed (squash on Y),
 *   which reads as a velocity streak.
 * - The native cursor is hidden on pointer devices; hovering interactive
 *   elements (a, button, input, …) scales the cursor up slightly.
 * - Touch devices and prefers-reduced-motion get no custom cursor at all.
 *
 * Mechanics reference (parameters match the original's constants):
 *   positionLerp 0.19 · angleLerp 0.16 · speedStretch 900 · speedSquash 1100
 *   interactiveScale 1.07 · moveThreshold 0.5px
 */

export function DirectionalCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const dot = dotRef.current;
    if (!dot) return;

    // pointer:fine + hover:hover gate — touch devices keep the native cursor.
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let enabled = false;
    let raf = 0;

    // Pointer state
    let targetX = 0, targetY = 0;     // d, f — where the pointer is
    let lastSampleX = 0, lastSampleY = 0; // h, g — last per-move sample
    let hasMoved = false;             // c
    let moveAngle = 0;                // v — movement direction in degrees

    // Render state
    let dotX = 0, dotY = 0;           // p, m — lerped dot position
    let angle = 0;                    // y — smoothed dot angle
    let speed = 0;                    // b — smoothed speed magnitude

    const POS_LERP = 0.19;
    const ANGLE_LERP = 0.16;
    const SPEED_EASE = 0.14;
    const STRETCH_DIV = 900;
    const SQUASH_DIV = 1100;
    const INTERACTIVE_SCALE = 1.07;
    const MOVE_EPS = 0.5;

    const frame = () => {
      const dx = targetX - dotX;
      const dy = targetY - dotY;
      const dist = Math.hypot(dx, dy);
      dotX += dx * POS_LERP;
      dotY += dy * POS_LERP;
      speed += (dist - speed) * SPEED_EASE;
      // Shortest-path angle lerp: ((target - current + 540) % 360) - 180
      angle += (((moveAngle - angle + 540) % 360) - 180) * ANGLE_LERP;

      const stretch = Math.min(speed / STRETCH_DIV, 0.02);
      const squash = Math.min(speed / SQUASH_DIV, 0.012);
      const interactive = dot.dataset.interactive === "true" ? INTERACTIVE_SCALE : 1;

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) rotate(${angle}deg)`;
      dot.style.scale = `${(1 + stretch) * interactive} ${1 - squash}`;

      raf = window.requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (hasMoved) {
        const sx = targetX - lastSampleX;
        const sy = targetY - lastSampleY;
        if (Math.hypot(sx, sy) > MOVE_EPS) {
          moveAngle = (180 * Math.atan2(sy, sx)) / Math.PI;
        }
        lastSampleX = targetX;
        lastSampleY = targetY;
      } else {
        dotX = targetX;
        dotY = targetY;
        lastSampleX = targetX;
        lastSampleY = targetY;
        hasMoved = true;
        dot.dataset.visible = "true";
      }
      dot.dataset.interactive =
        e.target instanceof Element &&
        e.target.closest("a, button, input, textarea, select, [role='button'], [data-cursor-interactive]")
          ? "true"
          : "false";
    };

    const onLeave = () => { dot.dataset.visible = "false"; };
    const onEnter = () => { if (hasMoved) dot.dataset.visible = "true"; };

    const apply = () => {
      const want = fine.matches && hover.matches && !coarse.matches;
      if (want && !enabled) {
        enabled = true;
        document.documentElement.dataset.customCursor = "true";
        document.documentElement.style.setProperty("cursor", "none", "important");
        document.body.style.setProperty("cursor", "none", "important");
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        document.documentElement.addEventListener("pointerenter", onEnter);
        raf = window.requestAnimationFrame(frame);
      } else if (!want && enabled) {
        enabled = false;
        delete document.documentElement.dataset.customCursor;
        document.documentElement.style.removeProperty("cursor");
        document.body.style.removeProperty("cursor");
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        document.documentElement.removeEventListener("pointerenter", onEnter);
        window.cancelAnimationFrame(raf);
        dot.dataset.visible = "false";
        hasMoved = false;
      }
    };

    apply();
    fine.addEventListener("change", apply);
    hover.addEventListener("change", apply);
    coarse.addEventListener("change", apply);

    return () => {
      fine.removeEventListener("change", apply);
      hover.removeEventListener("change", apply);
      coarse.removeEventListener("change", apply);
      if (enabled) {
        window.cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        document.documentElement.removeEventListener("pointerenter", onEnter);
        delete document.documentElement.dataset.customCursor;
        document.documentElement.style.removeProperty("cursor");
        document.body.style.removeProperty("cursor");
      }
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-visible="false"
      data-interactive="false"
      className="directional-cursor pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
    >
      {/* The elongated cap lies along +X so rotate(angle) points it the way
          the pointer moves; it stretches on X and squashes on Y with speed. */}
      <span className="directional-cursor-dot" />
    </div>
  );
}
