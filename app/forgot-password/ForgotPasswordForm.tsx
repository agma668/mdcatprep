"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="p-4 bg-emerald-500/10 text-emerald-400 text-sm rounded-[var(--radius-md)] border border-emerald-500/25 text-center">
        <p className="font-medium mb-1">Check your inbox</p>
        <p>
          If an account exists for that email, a password reset link is on its
          way.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Email address
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="you@example.com"
        />
      </div>
      <Button variant="primary" fullWidth className="mt-6" disabled={loading}>
        {loading ? "Sending…" : "Send Reset Link"}
      </Button>
    </form>
  );
}
