import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4" aria-hidden="true">🧭</p>
      <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] mb-2">
        Page not found
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
