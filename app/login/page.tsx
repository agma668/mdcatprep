import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-field flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(var(--rgb-signal),0.10)_0%,transparent_65%)]" />
      <div aria-hidden="true" className="absolute bottom-0 -left-40 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(var(--rgb-signal),0.06)_0%,transparent_65%)]" />
      <div className="max-w-md w-full glass-tile-glow rounded-[var(--radius-xl)] p-8 relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-[linear-gradient(135deg,var(--signal-600),var(--signal-700))] text-[var(--on-cta)] font-bold text-xl mb-4 shadow-[var(--glow-signal-md)]">
            E
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Sign in to your account to continue</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-[var(--color-primary)] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
