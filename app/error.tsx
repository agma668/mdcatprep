"use client";

import { useEffect } from "react";
import { Compass } from "lucide-react";
import { trackError } from "@/lib/telemetry";
import { getWhatsAppLink } from "@/lib/site";

// Root error boundary. Catches render/action errors anywhere below the root
// layout, reports the digest serverlessly to telemetry (crash reporting), and
// gives the student a clear recovery path instead of a blank page.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackError(error, "boundary");
  }, [error]);

  const digest = error?.digest;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Ambient glow, same family as the landing hero */}
      <div aria-hidden="true" className="hero-aurora">
        <div className="hero-blob hero-blob-2" style={{ opacity: 0.5 }} />
      </div>

      <div className="relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-[var(--line-signal)] bg-[var(--tint-signal)] mb-5">
          <Compass className="w-7 h-7 text-[var(--color-primary-light)]" aria-hidden="true" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-white/60 mb-6 max-w-md mx-auto text-sm sm:text-base">
          An unexpected error interrupted this page. Your progress is safe — try
          again, and if it keeps happening tell us on WhatsApp so we can fix it.
        </p>

        {digest && (
          <p className="text-[11px] text-white/25 mb-6 font-mono select-all">
            Reference: {digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2.5 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-bold hover:brightness-110 transition-all shadow-[var(--glow-signal-lg)]"
          >
            Try again
          </button>
          <a
            href={getWhatsAppLink("Hi Sir Haziq, I hit an error on MED Prep")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-[var(--radius-md)] border border-white/15 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Report on WhatsApp
          </a>
        </div>

        <p className="mt-8 text-xs text-white/30">
          This error was reported automatically to help us fix it.
        </p>
      </div>
    </div>
  );
}
