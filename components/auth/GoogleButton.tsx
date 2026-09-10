"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * "Continue with Google" — starts Supabase OAuth (PKCE). The browser client
 * stashes the code verifier in cookies; /auth/callback exchanges the code
 * server-side and routes through the same approval gates as password login.
 *
 * The redirect uses window.location.origin, not getSiteUrl(): in production
 * they are the same host, and in local dev the origin (localhost) is what
 * Supabase's default redirect-URL allowlist actually covers.
 *
 * The Google "G" is the official four-colour mark, inlined as SVG so there
 * is no image request and no third-party script on the auth path.
 */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function isProviderDisabled(message: string) {
  return /not enabled|unsupported provider|invalid provider/i.test(message);
}

export function GoogleButton({
  label = "Continue with Google",
  refCode,
}: {
  label?: string;
  refCode?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // A referral code rides through the OAuth round-trip as ?ref= so the
        // callback can attribute the signup (Supabase preserves extra query
        // params when it appends its auth code on the way back).
        redirectTo: `${window.location.origin}/auth/callback${
          refCode ? `?ref=${encodeURIComponent(refCode)}` : ""
        }`,
      },
    });
    // On success the browser is navigated away by the OAuth flow; only
    // failures land back here.
    if (error) {
      setError(
        isProviderDisabled(error.message)
          ? "Google sign-in isn't set up yet on the server — please use email for now."
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] bg-white/[0.06] text-white text-sm font-semibold hover:bg-white/[0.12] transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <GoogleIcon />
        {loading ? "Redirecting to Google…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hairline divider between the Google button and the email form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5" aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--line-2)]" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--steel-400)]">
        or
      </span>
      <span className="h-px flex-1 bg-[var(--line-2)]" />
    </div>
  );
}
