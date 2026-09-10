"use client";

import { useState } from "react";
import { Copy, Check, Gift, FileText, Lock, MessageCircle } from "lucide-react";

interface MasterNotesItem {
  name: string;
  href: string;
}

interface MasterPdfsSectionProps {
  unlocked: boolean;
  joinedCount: number;
  goal: number;
  code: string | null;
  link: string;
  masterNotes: MasterNotesItem[];
}

/**
 * The locked "Master PDFs" section shown at the top of Important Notes.
 * Server-side gated: unlocked = live referral count reached the founder's goal
 * (5). When locked, students see the incentive + share CTA; when unlocked they
 * see the college Master Notes links.
 */
export function MasterPdfsSection({ unlocked, joinedCount, goal, code, link, masterNotes }: MasterPdfsSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const remaining = Math.max(0, goal - joinedCount);
  const pct = Math.min(100, Math.round((joinedCount / goal) * 100));

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
      `🎓 Join me on Elite Cadet Prep — a 100% free platform to help every student prepare for cadet-college entry tests. Sign up with my link so we can grow together!\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="master-pdfs"
      className="scroll-mt-24 rounded-[var(--radius-xl)] border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-[var(--radius-md)] bg-amber-500/15 ring-1 ring-amber-500/30">
          {unlocked ? <FileText className="w-6 h-6 text-amber-300" /> : <Lock className="w-6 h-6 text-amber-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            Master PDFs &amp; Master Notes
            {unlocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-amber-500/30">
                Locked
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {unlocked
              ? "You invited 5 friends — you now have access. Here are the Master Notes for every college."
              : `Premium Master PDFs and Master Notes for your target college. Locked until ${joinedCount} of ${goal} friends sign up through your link — help us spread this free platform to every student, so your friends can grow too.`}
          </p>
        </div>
      </div>

      {unlocked ? (
        <div className="mt-5">
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Master Notes by College
          </p>
          {masterNotes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No Master Notes available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {masterNotes.map(({ name, href }) => (
                <a
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
                >
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {name} — Master Notes
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Full prep pack for {name}</p>
                  </div>
                  <span className="text-emerald-300">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          {/* Progress */}
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--color-text-muted)]">Referral progress</span>
            <span className="tabular-nums text-amber-300">
              {joinedCount} / {goal} friends{remaining > 0 ? ` — ${remaining} to go` : ""}
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

          {/* Share CTA */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-white/[0.04] border border-white/10 text-xs font-bold text-white">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                Your code
              </span>
              <code className="min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-white/10 bg-white/[0.05] px-3 py-2 font-mono text-xs text-white/80">
                {link}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-text-inverse)] hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--whatsapp)]/40 px-3 py-2 text-xs font-bold text-[var(--whatsapp)] hover:bg-[var(--whatsapp)]/10 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Sharing costs nothing and helps a lot — this is a 100% free platform, made for
            every cadet-college aspirant in Pakistan. Grow together: when {goal} of your
            friends join, these Master Notes unlock for you. Keep sharing with friends so
            they can unlock theirs too. 🙌
          </p>
        </div>
      )}
    </section>
  );
}