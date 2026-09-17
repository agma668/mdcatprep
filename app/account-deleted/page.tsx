import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getWhatsAppLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div aria-hidden="true" className="hero-aurora">
        <div className="hero-blob hero-blob-3" />
      </div>

      <div className="relative max-w-lg w-full glass-tile-glow rounded-[var(--radius-xl)] p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Your account was deleted</h1>
        <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6">
          Your profile, answers, analytics and streaks have been removed
          permanently. Any offline copies on this device will clear as your
          browser cleans its storage. Thanks for preparing with us — you are
          welcome back anytime.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[#0a0a0a] text-sm font-bold hover:brightness-110 transition-all"
          >
            Create a new account
          </Link>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-[var(--radius-md)] border border-white/15 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Questions? WhatsApp us
          </a>
        </div>
        <p className="mt-6 text-xs text-white/45">
          Deletion is immediate and cannot be undone.
        </p>
      </div>
    </div>
  );
}
