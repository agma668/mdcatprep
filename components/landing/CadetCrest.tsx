"use client";

// Hero crest — the gate in front of two renderings of the same emblem.
//
// Default and fallback: CadetCrestStatic (the shipped SVG patch, zero JS), so
// the hero paints the crest in the server HTML and never waits on script.
// Upgrade: CadetCrestCanvas, lazily imported, which turns the star into a lit
// 3D solid that tracks the pointer, orbits gold motes and salutes on tap.
//
// Nothing here can delay first paint: the live emblem is a separate chunk
// requested after hydration, and its Suspense fallback is the static crest, so
// there is no hole in the layout while it loads. Students who ask for reduced
// motion, and those browsing with data saver on, keep the static crest — and
// because the preference is read through a subscription, turning reduced
// motion on mid-visit swaps the live emblem back out immediately.
// Owns nothing else: Hero.tsx still imports <CadetCrest /> and gets a crest.

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { CadetCrestStatic } from "./CadetCrestStatic";

// ssr:false is only legal inside a Client Component, which this is.
const CadetCrestCanvas = dynamic(
  () => import("./CadetCrestCanvas").then((m) => m.CadetCrestCanvas),
  { ssr: false, loading: () => <CadetCrestStatic /> }
);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

interface SaveDataNavigator extends Navigator {
  connection?: { saveData?: boolean };
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Client answer: may we run the live emblem? */
function liveEmblem(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  if (window.matchMedia(REDUCED_MOTION).matches) return false;
  return !(navigator as SaveDataNavigator).connection?.saveData;
}

/** Server answer: always the static crest, so the HTML holds the real emblem. */
function staticEmblem(): boolean {
  return false;
}

export function CadetCrest() {
  const live = useSyncExternalStore(subscribe, liveEmblem, staticEmblem);

  return (
    <div className="cadet-crest" role="img" aria-label="Cadet College Prep crest">
      {live ? <CadetCrestCanvas /> : <CadetCrestStatic />}
    </div>
  );
}
