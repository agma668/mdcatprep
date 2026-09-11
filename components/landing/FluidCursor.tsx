"use client";

import { useEffect, useRef } from "react";

/**
 * Fluid cursor — a faithful port of nexstudio.tech's `FluidCursor`. Their
 * bundled component was extracted from the deployed chunk and re-read line
 * by line; every constant below is theirs exactly:
 *
 *  - The arrow LERPS toward the pointer (0.19; 0.105 in touch mode).
 *  - Every frame it ROTATES toward the pointer's movement direction (atan2
 *    of the per-move delta, shortest-path angle lerp 0.16; 0.12 touch), so
 *    the arrow points the way you move and swings around corners.
 *  - It STRETCHES along its motion axis with pointer speed (speed/900,
 *    capped +0.02) and squashes across it (speed/1100, capped 0.012).
 *  - The arrow is tip-anchored: translate(-92%, -50%), transform-origin 92%
 *    — the tip sits at the pointer while the tail lags and swings.
 *  - Visual: white arrow + `mix-blend-mode: difference` — it reads black on
 *    light backgrounds and inverts to white over dark ones, exactly like
 *    the original.
 *  - States: hovering interactive elements → 1.07 scale; pressed → 0.76
 *    opacity; pointer leaves the window → hidden.
 *  - Touch mode (original behaviour): the arrow is centered on screen,
 *    follows finger DRAGS (pointerdown/move while pressed), the native
 *    cursor/scrollbar stays untouched, and it fades when the finger lifts.
 *  - Disabled for prefers-reduced-motion; below 769 px the touch mode is
 *    forced on exactly like the original's media gating.
 */

export function FluidCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const t = rootRef.current;
    const r = bodyRef.current;
    if (!t || !r) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 769px)");

    let raf = 0;
    let active = false;

    // Pointer state (names mirror the original: d,f target · p,m position ·
    // h,g last sample · y angle · v move angle · b speed · w touch mode).
    let d = window.innerWidth / 2;
    let f = window.innerHeight / 2;
    let p = d, m = f, h = d, g = f;
    let y = 0, v = 0, b = 0;
    let w = false;
    let c = false; // hasMoved

    const clearCursorProperty = () => {
      document.documentElement.style.removeProperty("cursor");
      document.body.style.removeProperty("cursor");
    };

    const frame = () => {
      const dx = d - p;
      const dy = f - m;
      const dist = Math.hypot(dx, dy);
      const posLerp = w ? 0.105 : 0.19;
      const angleLerp = w ? 0.12 : 0.16;
      p += dx * posLerp;
      m += dy * posLerp;
      b += (dist - b) * 0.14;
      y += (((v - y + 540) % 360) - 180) * angleLerp;

      const stretch = Math.min(b / 900, 0.02);
      const squash = Math.min(b / 1100, 0.012);
      const interactive = t.dataset.interactive === "true" ? 1.07 : 1;

      t.style.transform = `translate3d(${p}px, ${m}px, 0) rotate(${y}deg)`;
      r.style.transform = `translate(-92%, -50%) scale(${(1 + stretch) * interactive}, ${(1 - squash) * interactive})`;

      raf = window.requestAnimationFrame(frame);
    };

    const apply = () => {
      w = coarse.matches || !desktop.matches;
      active = !reduced.matches && (w || fine.matches);
      if (active) {
        document.documentElement.dataset.customCursor = "true";
        document.documentElement.dataset.cursorInput = w ? "touch" : "pointer";
        if (w) {
          // Touch mode: arrow starts centered, native cursor untouched.
          clearCursorProperty();
          if (!c) {
            d = window.innerWidth / 2;
            f = window.innerHeight / 2;
            p = d; m = f; h = d; g = f;
            c = true;
          }
          t.dataset.visible = "true";
        } else if (fine.matches) {
          t.dataset.visible = "false";
          c = false;
          document.documentElement.style.setProperty("cursor", "none", "important");
          document.body.style.setProperty("cursor", "none", "important");
        }
        if (!raf) raf = window.requestAnimationFrame(frame);
      } else {
        delete document.documentElement.dataset.customCursor;
        delete document.documentElement.dataset.cursorInput;
        clearCursorProperty();
        t.dataset.visible = "false";
        c = false;
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      }
    };

    const move = (x: number, yTo: number, target: EventTarget | null) => {
      if (!active) return;
      d = x;
      f = yTo;
      if (c) {
        const sx = d - h;
        const sy = f - g;
        if (Math.hypot(sx, sy) > 0.5) {
          v = (180 * Math.atan2(sy, sx)) / Math.PI;
        }
        h = d;
        g = f;
      } else {
        p = d; m = f; h = d; g = f;
        c = true;
        t.dataset.visible = "true";
      }
      t.dataset.interactive =
        target instanceof Element &&
        target.closest("a, button, input, textarea, select, [role='button'], [data-cursor-interactive]")
          ? "true"
          : "false";
    };

    // Fine pointer: follow every move. Touch: only while a drag is active —
    // the original ignores plain touch scrolls (w-gate in its onMove).
    const onPointerMove = (e: PointerEvent) => {
      if (w || e.pointerType === "touch") return;
      move(e.clientX, e.clientY, e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      move(e.clientX, e.clientY, e.target);
      t.dataset.pressed = "true";
    };

    const onPointerUp = () => {
      t.dataset.pressed = "false";
    };

    const onLeave = () => {
      if (!w) t.dataset.visible = "false";
    };

    const onEnter = () => {
      if (c && active) t.dataset.visible = "true";
    };

    apply();
    fine.addEventListener("change", apply);
    coarse.addEventListener("change", apply);
    reduced.addEventListener("change", apply);
    desktop.addEventListener("change", apply);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      fine.removeEventListener("change", apply);
      coarse.removeEventListener("change", apply);
      reduced.removeEventListener("change", apply);
      desktop.removeEventListener("change", apply);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      delete document.documentElement.dataset.customCursor;
      delete document.documentElement.dataset.cursorInput;
      clearCursorProperty();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-visible="false"
      data-interactive="false"
      data-pressed="false"
      className="fluid-cursor"
    >
      <span ref={bodyRef} className="fluid-cursor__body">
        {/* nexstudio's exact cursor glyph: a black arrow with a white stroke —
            the white stroke is what mix-blend-mode:difference inverts over
            dark content, so one asset works on both light and dark sites. */}
        <svg
          width="600"
          height="500"
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M530 225C555 237 555 263 530 275L112 475C76 492 40 462 50 423L181 269C190 258 190 242 181 231L50 77C40 38 76 8 112 25L530 225Z"
            fill="black"
            stroke="white"
            style={{ fill: "black", fillOpacity: 1, stroke: "white", strokeOpacity: 1 }}
          />
        </svg>
      </span>
    </div>
  );
}
