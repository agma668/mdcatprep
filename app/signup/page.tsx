import Link from "next/link";
import { GraduationCap, Trophy, BookOpenCheck, BarChart3 } from "lucide-react";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen landing-canvas flex flex-col md:flex-row">
      {/* Left side - visual / branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden flex-col justify-between p-10">
        {/* Ambient field wash — signal, per --rgb-signal */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 20% 20%, rgba(var(--rgb-signal), 0.12), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(var(--rgb-signal), 0.08), transparent 55%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 50L50-10M-10 30L30-10M10 50L50 10M-10 10L10-10M30 50L50 30' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10">
          <Link
            href="/"
            aria-label="Cadet College Prep - Home"
            className="inline-flex items-center gap-2.5 group"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] gradient-brand text-[var(--on-cta)] font-bold text-lg shadow-[var(--glow-signal-md)]">
              A
            </span>
            <span className="font-bold text-xl tracking-tight text-white">
              Cadet College Prep
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Start your preparation
            <span className="text-[var(--color-primary-light)]"> today</span>
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-10">
            Join students across Pakistan preparing for CCH, PAF Sargodha,
            MCJ, Kohat, and other cadet college entry tests. Everything is 100% free.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Trophy,
                label: "Practice MCQs",
                sub: "Exam-style practice",
                tone: "text-[var(--color-primary-light)]",
              },
              {
                icon: BookOpenCheck,
                label: "Instant Answers",
                sub: "With explanations",
                tone: "text-yellow-400",
              },
              {
                icon: BarChart3,
                label: "Track Progress",
                sub: "Analytics dashboard",
                tone: "text-sky-300",
              },
              {
                icon: GraduationCap,
                label: "7 Subjects",
                sub: "Full syllabus coverage",
                tone: "text-rose-300",
              },
            ].map(({ icon: Icon, label, sub, tone }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
              >
                <Icon className={`w-5 h-5 ${tone}`} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-white/50 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-[var(--steel-400)]">
            &copy; {new Date().getFullYear()} Cadet College Prep. A community initiative.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-field relative">
        {/* Mobile logo */}
        <div className="md:hidden mb-8 text-center">
          <Link
            href="/"
            aria-label="Cadet College Prep - Home"
            className="inline-flex items-center gap-2"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] gradient-brand text-[var(--on-cta)] font-bold text-lg">
              A
            </span>
            <span className="font-bold text-xl tracking-tight text-white">
              CCP
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
              Free forever. No credit card required.
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--color-primary)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
