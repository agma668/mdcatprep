"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { TELEMETRY_OPT_OUT_KEY } from "@/lib/telemetry";

// Privacy preference toggles. Currently one control: usage/error telemetry.
// The opt-out lives in localStorage under the same key lib/telemetry reads,
// surfaced through useSyncExternalStore (the sanctioned way to mirror an
// external store) — no effect/setState, lint-clean, hydration-safe.

function subscribe(onStoreChange: () => void) {
  const onChange = () => onStoreChange();
  window.addEventListener("storage", onChange);
  window.addEventListener("ccp-telemetry-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("ccp-telemetry-change", onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function PrivacyPreferences() {
  const optOut = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = (next: boolean) => {
    try {
      if (next) localStorage.setItem(TELEMETRY_OPT_OUT_KEY, "1");
      else localStorage.removeItem(TELEMETRY_OPT_OUT_KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("ccp-telemetry-change"));
  };

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        Privacy &amp; preferences
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        We collect minimal usage and error data to improve the platform. See the{" "}
        <Link href="/privacy" className="text-[var(--color-primary-light)] hover:underline">
          privacy policy
        </Link>{" "}
        for everything we store.
      </p>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={optOut}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
        />
        <span>
          <span className="block text-sm font-medium text-[var(--color-text-primary)]">
            Opt out of usage &amp; error telemetry
          </span>
          <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
            Stops page-view counts and automatic error reports. Practice data
            and analytics continue to work normally — they are part of your
            account, not telemetry.
          </span>
        </span>
      </label>
    </div>
  );
}
