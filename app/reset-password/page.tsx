import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-field flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/[0.06] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-8">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] gradient-brand text-[var(--on-cta)] font-bold text-xl mb-4"
          >
            E
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Set a new password
          </h1>
          <p className="text-white/70 mt-2">
            Choose a strong password for your account.
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm text-white/70 mt-8">
          <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
