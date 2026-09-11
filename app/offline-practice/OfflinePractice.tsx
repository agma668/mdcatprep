"use client";

// The consumer the offline bank was always missing. Reads the questions the
// dashboard's "Download for Offline" toggle cached into IndexedDB and runs
// them through the same verified PracticeSession player the online /practice
// sessions use — same keyboard model, verdicts, explanations, resume and
// results, just with zero network and no auth gate.
//
// Answers are NOT lost offline anymore: every player records through the
// queue-aware recordAnswer seam, which queues a signed-in student's answers
// while the origin is unreachable and drains them through the shared
// recordAttempt path once it is back — so goal, streak, analytics and rank
// all move. This component owns the honest surface around that:
//
//   • a banner stating exactly what counts when (signed-in answers sync;
//     guest runs stay on the device), plus a persistent "last synced" line so
//     a returning student can tell their offline run reached the server;
//   • a pending-sync pill with the live queue count and an explicit
//     "Sync now" action — the drain is never invisible or unreachable.
//
// Drains fire on mount, on every queue change, on the online event, on the
// tab becoming visible again (visibilitychange / pageshow — background-tab
// timer throttling can stall a plain interval), on a 10 s interval while
// answers are pending, and from the manual Sync now button.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CloudUpload, Download, Loader2, RefreshCw, WifiOff } from "lucide-react";
import {
  countPendingAttempts,
  getCachedQuestions,
  subscribeQueueChange,
} from "@/lib/offline";
import { drainPendingAttempts, getLastSyncedAt } from "@/lib/offline-sync";
import { toQuizQuestion, type QuizQuestion } from "@/lib/questions";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { createClient } from "@/lib/supabase/client";

type Phase = "loading" | "empty" | "ready";

const RETRY_INTERVAL_MS = 10_000;
const FLASH_MS = 4_000;

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function relativeTime(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return "just now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function OfflinePractice() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const drainingRef = useRef(false);
  const pendingRef = useRef(0);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    getCachedQuestions()
      .then((rows) => {
        if (!alive) return;
        if (rows.length === 0) {
          setPhase("empty");
          return;
        }
        const sorted = [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        setQuestions(sorted.map((q) => toQuizQuestion(q)));
        setPhase("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStorageUnavailable(true);
        setPhase("empty");
      });
    return () => {
      alive = false;
    };
  }, []);

  const refreshPending = useCallback(() => {
    countPendingAttempts()
      .then((n) => {
        pendingRef.current = n;
        setPending(n);
      })
      .catch(() => {
        pendingRef.current = 0;
        setPending(0);
      });
  }, []);

  const drain = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    setSyncing(true);
    try {
      const res = await drainPendingAttempts();
      setLastSynced(getLastSyncedAt());
      if (res.synced > 0) {
        setFlash(`${plural(res.synced, "answer")} synced to your account`);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setFlash(null), FLASH_MS);
      }
    } finally {
      drainingRef.current = false;
      setSyncing(false);
      void refreshPending();
    }
  }, [refreshPending]);

  // Who is this student (offline-safe storage read), the state of the queue
  // and last sync the moment the page loads, and the first drain.
  useEffect(() => {
    let alive = true;
    createClient()
      .then((supabase) => supabase.auth.getSession())
      .then(({ data }) => {
        if (!alive) return;
        setSignedIn(!!data.session);
      })
      .catch(() => {});
    // Read on a microtask so the effect body never sets state synchronously.
    queueMicrotask(() => {
      if (alive) setLastSynced(getLastSyncedAt());
    });
    void refreshPending();
    if (navigator.onLine) void drain();
    const onOnline = () => {
      setOnline(true);
      void refreshPending();
      void drain();
    };
    const onOffline = () => setOnline(false);
    // Returning to the tab is a drain trigger: browsers throttle background
    // intervals to ~1/min, so a queue that stalled while the tab was hidden
    // drains the moment it is visible again instead of waiting for a tick.
    const onVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine && pendingRef.current > 0) {
        void drain();
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    return () => {
      alive = false;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, [drain, refreshPending]);

  // Every enqueue/remove/release updates the pill; a queue while online is a
  // drain trigger (a failed send released back to queued retries here).
  useEffect(() => {
    return subscribeQueueChange(() => {
      void refreshPending();
      if (navigator.onLine) void drain();
    });
  }, [drain, refreshPending]);

  // While answers are waiting and the device is back online, keep trying
  // until the queue empties (foreground interval; visibilitychange covers the
  // throttled-background case when the student returns to the tab).
  useEffect(() => {
    if (pending === 0 || !online) return;
    const t = setInterval(() => void drain(), RETRY_INTERVAL_MS);
    return () => clearInterval(t);
  }, [drain, online, pending]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your offline bank…
        </div>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:py-24">
        <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-8 text-center sm:p-10">
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl"
          >
            <WifiOff className="h-6 w-6 text-[var(--color-primary-light)]" />
          </span>
          <h1 className="mt-5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {storageUnavailable ? "Offline bank unavailable in this browser" : "No questions downloaded yet"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {storageUnavailable
              ? "This browser can't store the offline question bank (IndexedDB is unavailable). Try a normal, up-to-date browser — or update this one — then download the bank again."
              : "                Download the question bank once while you&apos;re online, and you&apos;ll be able to practise here with no internet at all — on the bus, in a blackout, anywhere."}
          </p>
          {!storageUnavailable && (
            <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-[var(--color-text-secondary)]">
              <li className="flex gap-2.5">
                <span className="font-bold text-[var(--color-primary-light)]">1.</span>
                Open the Dashboard → <b className="text-white">Offline Practice</b>
              </li>
              <li className="flex gap-2.5">
                <span className="font-bold text-[var(--color-primary-light)]">2.</span>
                Tap <b className="text-white">Download for Offline</b> — that&apos;s it.
              </li>
              <li className="flex gap-2.5">
                <span className="font-bold text-[var(--color-primary-light)]">3.</span>
                Come back to this page once while online so your browser saves it,
                then it works with no connection.
              </li>
            </ol>
          )}
          <Link
            href="/dashboard/practice"
            className="mt-7 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)]"
          >
            {storageUnavailable ? "Try the download again" : "Download the question bank"}
            <Download className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const syncedPill = syncing ? (
    <>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Syncing {plural(pending, "answer")} to your account…
    </>
  ) : !online ? (
    <>
      <WifiOff className="h-3.5 w-3.5 text-[var(--color-primary-light)]" />
      {plural(pending, "answer")} saved — they&apos;ll count once you&apos;re back online
    </>
  ) : signedIn === false ? (
    <>
      <CloudUpload className="h-3.5 w-3.5 text-[var(--color-primary-light)]" />
      {plural(pending, "answer")} waiting — sign in and they&apos;ll sync
    </>
  ) : (
    <>
      <CloudUpload className="h-3.5 w-3.5 text-[var(--color-primary-light)]" />
      {plural(pending, "answer")} waiting to sync
      <button
        onClick={() => void drain()}
        className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/15 px-3 py-1 text-[11px] font-bold text-[var(--color-primary-light)] transition-colors hover:bg-[var(--color-primary)]/25"
      >
        <RefreshCw className="h-3 w-3" />
        Sync now
      </button>
    </>
  );

  const statusPill = flash ? (
    <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {flash}
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0b1220]/90 px-4 py-2 text-xs font-semibold text-white/85 shadow-lg backdrop-blur-md">
      {syncedPill}
    </div>
  );

  return (
    <div className="relative">
      {signedIn !== null && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:pt-10">
          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            <CloudUpload
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary-light)]"
            />
            <div className="min-w-0 flex-1">
              <p>
                {signedIn
                  ? "Every answer here counts like any practice — signed-in answers sync to your Daily Goal, streak and rank the moment you’re back online. Nothing is lost."
                  : "You’re signed out, so answers stay on this device and don’t sync anywhere. Sign in, then practise offline to count answers toward your goal and streak."}
              </p>
              {signedIn && lastSynced !== null && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400/80" />
                  Answers last synced to your account {relativeTime(lastSynced)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ready — run the cached bank through the shared practice player. The
          Exit / Esc / "Back to Practice" actions all point at the dashboard
          practice page (the player's default home), so a finished run never
          traps the student on this page. Resume is keyed to the bank size: a
          reload mid-run picks up exactly where they stopped, because the
          order above is deterministic. */}
      <PracticeSession
        questions={questions}
        sessionKey={`ccp-offline:${questions.length}`}
        subjectLabel="Offline Bank"
      />

      {(pending > 0 || flash) && (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">{statusPill}</div>
      )}
    </div>
  );
}
