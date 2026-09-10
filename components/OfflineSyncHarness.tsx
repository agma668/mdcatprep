"use client";

// The global owner of *when* the offline outbox drains. Every player writes
// through the queue-aware recordAnswer seam, so answers can sit in the
// IndexedDB outbox from any surface — the dashboard drill, the mock test's
// submit batch, the daily quiz, the diagnostic, or the offline player. This
// harness (mounted in the root layout, one per app) makes sure those answers
// reach the server no matter which page the student is on when the network
// comes back:
//
//   • queue changes (an enqueue or a failed send) while online
//   • the window "online" event
//   • the tab becoming visible again (visibilitychange / pageshow) — browsers
//     throttle background intervals to ~1/min, which can stall a queue that
//     filled while the tab was hidden
//   • a 10 s foreground interval while entries are pending and the device is
//     online (covers the origin returning while the link never dropped)
//
// drainPendingAttempts is single-flight at the module level, so these
// overlapping triggers never race the queue — and it is session-gated
// server-side per entry, so guests (whose answers never queue) and signed-out
// tabs cost nothing. This component renders nothing.

import { useEffect, useRef } from "react";
import { countPendingAttempts, subscribeQueueChange } from "@/lib/offline";
import { drainPendingAttempts } from "@/lib/offline-sync";

const RETRY_INTERVAL_MS = 10_000;

export function OfflineSyncHarness() {
  const pendingRef = useRef(0);
  const onlineRef = useRef(true);

  useEffect(() => {
    onlineRef.current = navigator.onLine;

    const refreshCount = () => {
      countPendingAttempts()
        .then((n) => {
          pendingRef.current = n;
        })
        .catch(() => {
          pendingRef.current = 0;
        });
    };
    const maybeDrain = () => {
      if (onlineRef.current) void drainPendingAttempts();
    };

    refreshCount();
    if (navigator.onLine) void drainPendingAttempts();

    const unsubscribe = subscribeQueueChange(() => {
      refreshCount();
      maybeDrain();
    });

    const onOnline = () => {
      onlineRef.current = true;
      void drainPendingAttempts();
    };
    const onOffline = () => {
      onlineRef.current = false;
    };
    // Background-tab timer throttling can delay the interval — drain as soon
    // as the student is looking at the tab again.
    const onVisible = () => {
      if (document.visibilityState === "visible" && onlineRef.current && pendingRef.current > 0) {
        void drainPendingAttempts();
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);

    const interval = setInterval(() => {
      if (pendingRef.current > 0 && onlineRef.current) void drainPendingAttempts();
    }, RETRY_INTERVAL_MS);

    return () => {
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      clearInterval(interval);
    };
  }, []);

  return null;
}
