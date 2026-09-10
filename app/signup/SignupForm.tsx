"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signup } from "@/app/actions/auth";
import { AyahLoadingOverlay } from "@/components/auth/AyahLoadingOverlay";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";

export function SignupForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(form);
    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(
        result.message || "Signup successful. Your account is pending admin approval."
      );
      form.reset();
    }

    setLoading(false);
  };

  return (
    <>
      {loading && <AyahLoadingOverlay label="Creating your account" />}
      <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
          {error}
        </div>
      )}
      {success && (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 text-sm rounded-[var(--radius-md)] border border-emerald-500/25">
            {success}
          </div>
          <Link
            href="/pending"
            className="block text-center w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.12] transition-colors"
          >
            Check your application status →
          </Link>
        </div>
      )}

      <GoogleButton refCode={refCode || undefined} />
      <OrDivider />

      <div>
        <label
          htmlFor="signup-name"
          className="block text-sm font-semibold text-white mb-1.5"
        >
          Full Name
        </label>
        <input
          id="signup-name"
          type="text"
          name="full_name"
          required
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow bg-white/[0.06]"
          placeholder="Ahmad Khan"
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="block text-sm font-semibold text-white mb-1.5"
        >
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          name="email"
          required
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow bg-white/[0.06]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="block text-sm font-semibold text-white mb-1.5"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow bg-white/[0.06]"
          placeholder="Min 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="signup-phone"
          className="block text-sm font-semibold text-white mb-1.5"
        >
          Phone{" "}
          <span className="text-[var(--steel-400)] font-normal">
            (optional)
          </span>
        </label>
        <input
          id="signup-phone"
          type="tel"
          name="phone"
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow bg-white/[0.06]"
          placeholder="0300 1234567"
        />
      </div>

      <div>
        <label
          htmlFor="signup-exam"
          className="block text-sm font-semibold text-white mb-1.5"
        >
          Exam Target{" "}
          <span className="text-[var(--steel-400)] font-normal">
            (optional)
          </span>
        </label>
        <input
          id="signup-exam"
          type="text"
          name="exam_target"
          className="w-full px-4 py-2.5 border border-white/10 rounded-[var(--radius-md)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow bg-white/[0.06]"
          placeholder="MDCAT 2026, NUMS, AKU..."
        />
      </div>

      {refCode && <input type="hidden" name="ref" value={refCode} />}

      <Button
        variant="primary"
        fullWidth
        className="mt-6 !py-3 !text-sm !font-bold"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Get Started Free"}
      </Button>
      </form>
    </>
  );
}
