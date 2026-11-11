"use client";

import { fmtInt } from "@/lib/fmt";
import Link from "next/link";
import { BookOpenCheck, BarChart3, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/ui/Motion";

const SELECTED_PATH_KEY = "edweb:selected-prep-space:v1";

function goToSignup() {
  let destination = "/signup";
  try {
    const selected = window.sessionStorage.getItem(SELECTED_PATH_KEY);
    if (selected) destination += `?exam=${encodeURIComponent(selected)}`;
  } catch {
    // Signup remains available when browser storage is unavailable.
  }
  window.location.assign(destination);
}

export function RegisterSection({ mcqs, subjects }: { mcqs: number; subjects: number }) {
  return (
    <section
      id="register"
      aria-labelledby="register-heading"
      className="section-padding relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, var(--tint-signal), transparent 60%)" }}
      />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="left" distance={20} duration={520}>
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-4 py-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--signal-300)]" />
                <span className="text-sm font-semibold text-[var(--signal-200)]">
                  One account · Distinct preparation spaces
                </span>
              </div>

              <h2
                id="register-heading"
                className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl lg:text-5xl"
              >
                Start with the exam you’re working toward.
              </h2>

              <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-[var(--steel-300)] lg:mx-0">
                Choose your preparation path during signup. Your selection will be carried into your account setup, and you can review it before creating your account.
              </p>

              <div className="mx-auto grid max-w-md grid-cols-2 gap-3 lg:mx-0">
                {[
                  { icon: BookOpenCheck, label: `${fmtInt(mcqs)} questions`, sub: "Across the current bank" },
                  { icon: GraduationCap, label: `${subjects} subjects`, sub: "Current subject catalogue" },
                  { icon: BarChart3, label: "Progress tools", sub: "Where supported" },
                  { icon: BookOpenCheck, label: "Exam pathways", sub: "Different preparation needs" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--srf-1)] p-3 text-left"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--r-1)] border border-[var(--line-signal)] bg-[var(--tint-signal)]"
                    >
                      <Icon className="h-4 w-4 text-[var(--signal-300)]" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--steel-100)]">{label}</p>
                      <p className="text-[11px] text-[var(--steel-400)]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={100}>
            <div className="glass-tile-elevated glass-shine p-8">
              <h3 className="mb-2 text-xl text-[var(--steel-100)]">Ready to choose your path?</h3>
              <p className="mb-6 text-sm leading-relaxed text-[var(--steel-300)]">
                Create your account with your name, email, password and target exam. You’ll be able to check your selection before submitting.
              </p>
              <button
                type="button"
                onClick={goToSignup}
                className="tap-44 w-full rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-6 py-3.5 text-sm font-bold text-[var(--on-cta)] shadow-[var(--shadow-cta),inset_0_1px_0_rgba(255,255,255,0.16)] transition-[filter,transform] duration-[var(--dur-1)] hover:brightness-110 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
              >
                Create account
              </button>
              <p className="mt-5 text-center text-xs text-[var(--steel-400)]">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-[var(--signal-200)] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
