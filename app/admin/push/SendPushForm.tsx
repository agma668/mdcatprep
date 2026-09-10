"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SendResult {
  ok: boolean;
  subscribers?: number;
  sent?: number;
  failed?: number;
  removed?: number;
  skipped?: number;
  error?: string;
}

const DEFAULTS = {
  title: "Cadet College Prep",
  body: "Time to practice! Your daily questions are waiting.",
  url: "/dashboard/practice",
};

export function SendPushForm({ configured }: { configured: boolean }) {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [body, setBody] = useState(DEFAULTS.body);
  const [url, setUrl] = useState(DEFAULTS.url);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = (await res.json()) as SendResult;
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — could not reach the send endpoint.");
    }
    setLoading(false);
  };

  return (
    <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-6">
      <h2 className="text-base font-bold text-white mb-4">Send a notification</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="push-title" className="mb-1.5 block text-xs font-semibold text-white/60">
            Title
          </label>
          <input
            id="push-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]/60"
          />
        </div>

        <div>
          <label htmlFor="push-body" className="mb-1.5 block text-xs font-semibold text-white/60">
            Message
          </label>
          <textarea
            id="push-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={240}
            rows={2}
            className="w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]/60"
          />
        </div>

        <div>
          <label htmlFor="push-url" className="mb-1.5 block text-xs font-semibold text-white/60">
            Opens on tap (path)
          </label>
          <input
            id="push-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]/60"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button variant="primary" onClick={send} disabled={loading || !configured || !title.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Sending…" : "Send to all subscribers"}
          </Button>
          {!configured && (
            <span className="text-xs text-amber-400">
              Set the VAPID keys in the environment first.
            </span>
          )}
        </div>

        {error && (
          <p className="rounded-[var(--radius-md)] border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-4 text-sm">
            {result.ok ? (
              <p className="text-emerald-400 font-semibold mb-1">Sent.</p>
            ) : (
              <p className="text-amber-400 font-semibold mb-1">Nothing sent.</p>
            )}
            <p className="text-white/70">
              {result.subscribers ?? 0} subscriptions · {result.sent ?? 0} delivered ·{" "}
              {result.failed ?? 0} failed · {result.removed ?? 0} expired removed ·{" "}
              {result.skipped ?? 0} skipped
            </p>
          </div>
        )}
      </div>
    </div>
  );
}