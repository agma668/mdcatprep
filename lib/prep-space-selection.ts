"use client";

import { useSyncExternalStore } from "react";
import { PREP_SPACES } from "@/lib/prep-space-registry";

const STORAGE_KEY = "edweb:selected-prep-space:v1";
const SELECTION_EVENT = "edweb:prep-space-selection-change";

type PrepSpace = (typeof PREP_SPACES)[number];

let currentSelectedSlug: string | null = null;

function subscribeToSelection(onStoreChange: () => void) {
  window.addEventListener(SELECTION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SELECTION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSelectedSlugSnapshot() {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved && PREP_SPACES.some((space) => space.slug === saved)) return saved;
  } catch {
    // Storage is an enhancement; the in-memory selection still works.
  }
  return currentSelectedSlug;
}

function getServerSelectedSlugSnapshot() {
  return null;
}

export function selectPrepSpace(slug: string) {
  currentSelectedSlug = PREP_SPACES.some((space) => space.slug === slug) ? slug : null;
  try {
    if (currentSelectedSlug) {
      window.sessionStorage.setItem(STORAGE_KEY, currentSelectedSlug);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage is optional; keep the current tab interactive without it.
  }
  window.dispatchEvent(new Event(SELECTION_EVENT));
}

export function useSelectedPrepSpace(): PrepSpace | null {
  const slug = useSyncExternalStore(
    subscribeToSelection,
    getSelectedSlugSnapshot,
    getServerSelectedSlugSnapshot,
  );
  return PREP_SPACES.find((space) => space.slug === slug) ?? null;
}
