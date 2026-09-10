"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/auth";

// Permanent account deletion, with the industry-standard "type DELETE to
// confirm" guard so a stray tap can never erase a student's record. On
// success the action redirects to /account-deleted.

export function DeleteAccountSection() {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = confirmText === "DELETE";

  const runDelete = async () => {
    if (!confirmed || busy) return;
    setBusy(true);
    setError(null);
    const result = await deleteAccount();
    // Only reached on failure — success redirects.
    setBusy(false);
    setError(result?.error ?? "Something went wrong. Please try again.");
  };

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-rose-500/25 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-1">
        <AlertTriangle className="w-5 h-5 text-rose-400" aria-hidden="true" />
        Delete account
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
        Permanently removes your account, profile and all practice data —
        answers, analytics, streaks and mistakes. Uploaded notes lose their
        author link. Offline copies on this device are cleared by your
        browser. This cannot be undone. Read the{" "}
        <Link href="/privacy" className="text-[var(--color-primary-light)] hover:underline">
          privacy policy
        </Link>{" "}
        for details.
      </p>

      {error && (
        <div className="mb-4 p-3 text-sm rounded-[var(--radius-md)] border bg-rose-500/10 text-rose-400 border-rose-500/25">
          {error}
        </div>
      )}

      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
        Type <span className="font-mono text-rose-400">DELETE</span> to confirm
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          spellCheck={false}
          className="w-full sm:max-w-[200px] px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white/[0.06] text-white font-mono"
        />
        <button
          type="button"
          onClick={runDelete}
          disabled={!confirmed || busy}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[var(--radius-md)] bg-rose-600/90 text-white text-sm font-bold hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {busy ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
