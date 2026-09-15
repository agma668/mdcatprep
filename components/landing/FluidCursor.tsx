"use client";

import { useEffect, useRef } from "react";

/**
 * Fluid cursor — DESKTOP ONLY.
 *
 * Ported from nexstudio.tech's `FluidCursor`; every constant below is theirs:
 *
 *  - The arrow LERPS toward the pointer (0.19).
 *  - Every frame it ROTATES toward the pointer's movement direction (atan2 of
 *    the per-move delta, shortest-path angle lerp 0.16), so the arrow points
 *    the way you move and swings around corners.
 *  - It STRETCHES along its motion axis with pointer speed (speed/900, capped
 *    +0.02) and squashes across it (speed/1100, capped 0.012).
 *  - The arrow is tip-anchored: translate(-92%, -50%), transform-origin 92% —
 *    the tip sits at the pointer while the tail lags and swings.
 *  - Visual: white arrow + `mix-blend-mode: difference` — it reads black on
 *    light backgrounds and inverts to white over dark ones.
 *  - States: hovering interactive elements → 1.07 scale; pressed → 0.76
 *    opacity; the pointer leaving the window → hidden.
 *  - The loop HALTS once the lerp settles on a still pointer and wakes on the
 *    next pointer event, so an idle page asks for no frames.
 *
 * The original's TOUCH MODE is deliberately not ported (an arrow centred on
 * screen that followed finger drags). It drew a cursor on phones: an Android
 * WebView, a tablet with a trackpad and "request desktop site" all report a
 * FINE pointer at a phone width, so a gate trusting `(pointer: fine)` alone
 * lets them through, and the touch fallback then rendered an arrow on a screen
 * that has no pointer to indicate. Requiring a fine pointer AND a ≥769px
 * viewport — the same two conditions the CSS gate in globals.css mirrors —
 * means no phone ever displays this element, runs its rAF loop, or gets the
 * `cursor: none` override.
 */

// Frames the lerp needs to converge (~30) plus slack, after which the loop
// stops until the next pointer event.
const SETTLE_FRAMES = 60;

export function FluidCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const t = rootRef.current;
    const r = bodyRef.current;
    if (!t || !r) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const desktop = window.matchMedia("(min-width: 769px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const allowed = () => fine.matches && desktop.matches && !reduced.matches;

    let raf = 0;
    let active = false;
    let idle = 0;

    // Pointer state (names mirror the original: d,f target · p,m position ·
    // h,g last sample · y angle · v move angle · b speed · c hasMoved).
    let d = window.innerWidth / 2;
    let f = window.innerHeight / 2;
    let p = d, m = f, h = d, g = f;
    let y = 0, v = 0, b = 0;
    let c = false;

    const clearCursorProperty = () => {
      document.documentElement.style.removeProperty("cursor");
      document.body.style.removeProperty("cursor");
    };

    const frame = () => {
      const dx = d - p;
      const dy = f - m;
      const dist = Math.hypot(dx, dy);
      p += dx * 0.19;
      m += dy * 0.19;
      b += (dist - b) * 0.14;
      y += (((v - y + 540) % 360) - 180) * 0.16;

      const stretch = Math.min(b / 900, 0.02);
      const squash = Math.min(b / 1100, 0.012);
      const interactive = t.dataset.interactive === "true" ? 1.07 : 1;

      t.style.transform = `translate3d(${p}px, ${m}px, 0) rotate(${y}deg)`;
      r.style.transform = `translate(-92%, -50%) scale(${(1 + stretch) * interactive}, ${(1 - squash) * interactive})`;

      // Idle gate: once the arrow has settled on a still pointer, stop
      // requesting frames. The transform no longer changes, so keeping the
      // loop alive would only re-write the same styles 60×/sec (and tax every
      // scroll). Any pointer move (below) restarts it.
      if (Math.hypot(d - p, f - m) > 0.5) {
        idle = 0;
      } else {
        idle++;
        if (idle >= SETTLE_FRAMES) {
          raf = 0;
          return;
        }
      }

      raf = window.requestAnimationFrame(frame);
    };

    // Re-run on every media change. The early return makes it a no-op unless
    // the gate actually flipped, so resizing across the breakpoint does not
    // reset the arrow's position.
    const apply = () => {
      const next = allowed();
      if (next === active) return;
      active = next;

      if (active) {
        document.documentElement.dataset.customCursor = "true";
        t.dataset.visible = "false";
        c = false;
        document.documentElement.style.setProperty("cursor", "none", "important");
        document.body.style.setProperty("cursor", "none", "important");
        if (!raf) raf = window.requestAnimationFrame(frame);
      } else {
        delete document.documentElement.dataset.customCursor;
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

      // Wake the loop if it had gone idle (idle-gated after settling).
      if (!raf) raf = window.requestAnimationFrame(frame);
    };

    // A touch or pen contact on a hybrid device is not a mouse move.
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      move(e.clientX, e.clientY, e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      move(e.clientX, e.clientY, e.target);
      t.dataset.pressed = "true";
    };

    const onPointerUp = () => {
      t.dataset.pressed = "false";
    };

    const onLeave = () => {
      t.dataset.visible = "false";
    };

    const onEnter = () => {
      if (c && active) t.dataset.visible = "true";
    };

    apply();
    fine.addEventListener("change", apply);
    desktop.addEventListener("change", apply);
    reduced.addEventListener("change", apply);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      fine.removeEventListener("change", apply);
      desktop.removeEventListener("change", apply);
      reduced.removeEventListener("change", apply);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      delete document.documentElement.dataset.customCursor;
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
