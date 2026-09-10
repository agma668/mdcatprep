"use client";

import { useState } from "react";
import { Copy, Check, Gift, Lock, MessageCircle, Sparkles } from "lucide-react";
import { useReferral } from "@/lib/use-referral";

/**
 * Founder-requested, non-dismissible referral notification on the dashboard
 * overview. Every student sees this banner at the very top with their own
 * referral link and the growth incentive: 5 friend sign-ups unlock the locked
 * Master PDFs in Important Notes. No close button — the founder wants it read
 * by everyone.
 */
export function ReferralBanner() {
  const [copied, setCopied] = useState(false);
  const { code, joinedCount: count, link, masterPdfGoal: goal, masterPdfUnlocked } = useReferral();

  if (!code) return null;

  const remaining = Math.max(0, goal - count);
  const pct = Math.min(100, Math.round((count / goal) * 100));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🎓 Join me on Elite Cadet Prep — free entry-test practice for cadet colleges. Sign up with my link and you're in!\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      aria-label="Invite friends and unlock Master PDFs"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--color-primary)]/10 to-transparent p-5 sm:p-6"
    >
      {/* glow accent */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-[var(--color-primary)]/20 blur-3xl pointer-events-none"
      />

      {masterPdfUnlocked ? (
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-[var(--radius-md)] bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-emerald-300">
                🎉 Master PDFs Unlocked!
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                You invited {count} friend{count !== 1 ? "s" : ""} — your locked Master PDF section is now open in Important Notes.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/notes#master-pdfs"
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-emerald-500 text-[var(--color-text-inverse)] text-sm font-bold hover:bg-emerald-400 transition-colors"
          >
            View Master PDFs
            <Sparkles className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="relative">
          {/* Headline */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-xs font-bold text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/30">
              <Gift className="w-3.5 h-3.5" />
              Get 5 friends to join
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              Unlock Master PDFs
            </span>
          </div>

          <h2 className="text-lg font-extrabold text-white">
            Invite 5 friends to join — unlock the Master PDF pack free
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-2xl">
            Share your personal link below. When {goal} students sign up with it,
            the locked <strong className="text-white">Master PDF section</strong> in
            Important Notes unlocks for you — full access to premium prep material, free.
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-[var(--color-text-muted)]">Your progress</span>
              <span className="tabular-nums text-[var(--color-primary-light)]">
                {count} / {goal} friends{count === 0 ? " — invite your first friend" : remaining > 0 ? ` — ${remaining} to go` : ""}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))",
                  boxShadow: "0 0 12px rgba(61, 126, 219, 0.55)",
                }}
              />
            </div>
          </div>

          {/* Code + actions */}
          <div className="mt-4 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-white/10 bg-white/[0.05] px-3 py-2 font-mono text-sm text-white/80">
              {link}
            </code>
            <button
              onClick={copy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3.5 py-2 text-xs font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)] cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--whatsapp)]/40 px-3.5 py-2 text-xs font-bold text-[var(--whatsapp)] transition-colors hover:bg-[var(--whatsapp)]/10 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      )}
    </section>
  );
}