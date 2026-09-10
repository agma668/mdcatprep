"use client";

import { useEffect, useState } from "react";
import { Gift, Check, Copy, MessageCircle } from "lucide-react";

interface Info {
  code: string | null;
  status: string | null;
  joinedCount: number;
  goal: number;
}

// On the "application pending" screen, a student can skip the admin queue by
// sharing: the moment 10 people sign up through their link, the database
// approves them automatically — no manual counting, and nobody waits for each
// friend's approval. This card shows the live progress.
export function PendingReferralCard() {
  const [info, setInfo] = useState<Info | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setInfo({ code: d.code ?? null, status: d.status ?? null, joinedCount: d.joinedCount ?? 0, goal: d.goal ?? 10 });
        }
      })
      .catch(() => {});
  }, []);

  if (!info || !info.code) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/signup?ref=${info.code}`;
  const pct = Math.min(100, Math.round((info.joinedCount / info.goal) * 100));

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
      `🎯 Join me on Cadet Prep — free MDCAT & NUMS entry-test practice. Sign up with my link and we both move up the waitlist:\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full mt-6 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/[0.08] to-transparent p-6 text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/15">
          <Gift className="w-5 h-5 text-[var(--color-primary-light)]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Skip the wait — share with 10 friends</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            When {info.goal} friends sign up through your link, your account is approved automatically.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
          <span className="text-[var(--color-text-muted)]">Progress</span>
          <span className="tabular-nums text-[var(--color-primary-light)]">
            {info.joinedCount} / {info.goal} joined
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))",
              boxShadow: "0 0 10px rgba(61, 126, 219, 0.5)",
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-white/10 bg-white/[0.05] px-3 py-2 font-mono text-xs text-white/70">
          {link}
        </code>
        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--whatsapp)]/40 px-3 py-2 text-xs font-bold text-[var(--whatsapp)] transition-colors hover:bg-[var(--whatsapp)]/10"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </div>
  );
}
