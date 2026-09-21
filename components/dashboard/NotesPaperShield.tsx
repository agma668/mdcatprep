"use client";

// The reader's deterrence layer. Honest scope (stated on the page itself too):
// NO client-side measure stops a determined thief — a camera defeats everything.
// What this adds is friction: a repeating per-user watermark (so any leak is
// traceable to the account that leaked it), blur when the window loses focus
// or the screen locks context, and suppression of the common screenshot /
// copy paths. The real control is that the content never ships as a file —
// there is no PDF URL to download.

import { useEffect, useState } from "react";

export function NotesPaperShield({ watermark }: { watermark: string }) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);
    const onVisibility = () => setBlurred(document.visibilityState === "hidden");
    // Print-screen attempts: clear the clipboard (best-effort) and flash the blur.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        try {
          void navigator.clipboard.writeText(
            "MED Prep master notes are watermarked to your account and may not be copied."
          );
        } catch {
          /* clipboard unavailable — fine */
        }
        setBlurred(true);
        window.setTimeout(() => setBlurred(false), 1500);
      }
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Repeating diagonal watermark rows, generated client-side per user.
  const rows = Array.from({ length: 14 });

  return (
    <>
      {blurred && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[70] backdrop-blur-xl bg-[var(--field-0)]/60"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden select-none"
      >
        {rows.map((_, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-[13px] font-semibold tracking-wide text-white/[0.05] dark:text-white/[0.05]"
            style={{
              transform: "rotate(-24deg)",
              marginLeft: `${(i % 2) * 220 - 320}px`,
              marginTop: `${i * 96}px`,
              width: "260%",
            }}
          >
            {Array.from({ length: 8 })
              .map(() => `${watermark} · MED PREP · `)
              .join("")}
          </div>
        ))}
      </div>
    </>
  );
}
