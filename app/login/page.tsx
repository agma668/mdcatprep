import Link from "next/link";
import { LoginForm } from "./LoginForm";

/**
 * The two query flags this page reacts to are read HERE, on the server, and
 * handed down as props.
 *
 * Reading them inside the client component with `useSearchParams()` cost more
 * than it looked: a hook that depends on the query string opts the whole route
 * out of static prerendering, so the form was rendered on the client only and
 * the served HTML for /login contained **no `<form>`, no `<input>` and nothing
 * a slow device could show**. Measured on a throttled phone profile (1.6 Mbps /
 * 150 ms RTT / 4× CPU, cold cache) the password field did not exist in the DOM
 * until **2.9–3.4 s** and was not painted until **3.1–3.7 s** — a student saw a
 * card with a heading and a blank space where the fields belong.
 *
 * Awaiting `searchParams` makes the page dynamic instead of static, which is
 * the honest classification: its content genuinely depends on the query string.
 * The form is now in the first byte of HTML.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const params = await searchParams;

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

        <LoginForm
          resetDone={params.reset === "done"}
          googleFailed={params.error === "google"}
        />

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-[var(--color-primary)] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
