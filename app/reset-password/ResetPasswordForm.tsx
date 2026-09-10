"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updatePassword } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/login?reset=done");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          New password
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Confirm new password
        </label>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="Repeat your new password"
        />
      </div>
      <Button variant="primary" fullWidth className="mt-6" disabled={loading}>
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
