"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { login } from "@/app/actions/auth";
import { AyahLoadingOverlay } from "@/components/auth/AyahLoadingOverlay";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { createClient } from "@/lib/supabase/client";

function LoginFormInner() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const resetDone = searchParams.get("reset") === "done";
  // The OAuth callback bounces here when Google sign-in fails (rejected
  // consent, provider not enabled, exchange error) — say so instead of
  // silently showing a bare form.
  const googleFailed = searchParams.get("error") === "google";

  // A signed-in user has no business on this form (they can reach it via a
  // stale cached page or the back button). Send them where their status puts
  // them — middleware re-gates /dashboard for pending/rejected/suspended.
  useEffect(() => {
    let alive = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (alive && data.session) router.replace("/dashboard");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    // login() returns the destination instead of redirecting server-side, so
    // the client always gets a definite answer: an error, or a route to take.
    // This is what keeps the button from ever spinning on "Signing in..."
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.redirectTo) {
      router.replace(result.redirectTo);
      return;
    }
    setLoading(false);
  };

  return (
    <>
      {loading && <AyahLoadingOverlay label="Signing in" />}
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
        aria-busy={loading}
        aria-live="polite"
      >
      <div className="mb-5">
        <GoogleButton />
      </div>
      <OrDivider />
      {googleFailed && (
        <div role="alert" className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          Google sign-in didn&apos;t complete. Please try again or use email below.
        </div>
      )}
      {resetDone && (
        <div className="p-3 bg-emerald-500/10 text-emerald-400 text-sm rounded-[var(--radius-md)] border border-emerald-500/25">
          Password updated. Sign in with your new password.
        </div>
      )}
      {error && (
        <div role="alert" className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Email address</label>
        <input 
          type="email" 
          name="email"
          required
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.06] text-white placeholder:text-white/30" 
          placeholder="you@example.com" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Password</label>
        <input 
          type="password" 
          name="password"
          required
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
          placeholder="••••••••" 
        />
        <div className="flex justify-end mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--color-primary)] font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <Button variant="primary" fullWidth className="mt-6" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      </form>
    </>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
