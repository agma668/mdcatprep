'use client';

import { useState } from 'react';
import { fmtInt } from "@/lib/fmt";
import { TrackedLink } from '@/components/TrackedLink';
import { GraduationCap, BookOpenCheck, BarChart3, Trophy, CheckCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Motion';

export function RegisterSection({ mcqs, subjects }: { mcqs: number; subjects: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Acknowledge the tap before the page changes under it — the navigation is
    // a full document load, so without this the button looks inert for a beat.
    setSubmitted(true);
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    try {
      const selectedExam = window.sessionStorage.getItem('edweb:selected-prep-space:v1');
      if (selectedExam) params.set('exam', selectedExam);
    } catch {
      // Continue to signup even when browser storage is unavailable.
    }
    window.location.href = `/signup?${params.toString()}`;
  };

  const inputClass =
    'w-full rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--field-1)] px-4 py-3 text-sm text-[var(--steel-100)] transition-colors duration-[var(--dur-1)] placeholder:text-[var(--steel-500)] focus:border-[var(--signal-400)] focus:ring-2 focus:ring-[var(--tint-signal-strong)] focus:outline-none';

  return (
    <section
      id="register"
      aria-labelledby="register-heading"
      className="section-padding relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--tint-signal), transparent 60%)' }}
      />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="left" distance={20} duration={520}>
            <div className="text-center lg:text-left">
              {/* Static dot, not a pulsing one — a pulse reads as live data and
                  this is a standing fact about the platform. Built from
                  utilities rather than .glass-tile-glow: that class sets its own
                  border-radius, and unlayered CSS outranks a utility, so
                  rounded-full would never win. */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-4 py-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--signal-300)]" />
                <span className="text-sm font-semibold text-[var(--signal-200)]">
                  Join students across Pakistan
                </span>
              </div>

              <h2
                id="register-heading"
                className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl lg:text-5xl"
              >
                Start your preparation{' '}
                <span className="text-[var(--signal-200)]">today</span>
              </h2>

              <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-[var(--steel-300)] lg:mx-0">
                Create a free account and get instant access to {fmtInt(mcqs)} MCQs, study notes,
                progress tracking, and the WhatsApp community. No credit card required.
              </p>

              <div className="mx-auto grid max-w-md grid-cols-2 gap-3 lg:mx-0">
                {[
                  { icon: BookOpenCheck, label: `${fmtInt(mcqs)} MCQs`, sub: 'Exam-style practice' },
                  { icon: BarChart3, label: 'Track Progress', sub: 'Real-time analytics' },
                  { icon: GraduationCap, label: `${subjects} Subjects`, sub: 'Full syllabus coverage' },
                  { icon: Trophy, label: 'Leaderboard', sub: 'Compete with peers' },
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
              {submitted ? (
                <div className="py-8 text-center" role="status">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--ok)]" aria-hidden="true" />
                  <h3 className="mb-2 text-xl text-[var(--steel-100)]">Redirecting to signup...</h3>
                  <p className="text-sm text-[var(--steel-300)]">
                    You&apos;re being taken to the registration page.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="mb-1 text-xl text-[var(--steel-100)]">Create your account</h3>
                    <p className="text-sm text-[var(--steel-400)]">
                      Free forever. No credit card required.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label
                        htmlFor="reg-name"
                        className="mb-1.5 block text-xs font-semibold text-[var(--steel-300)]"
                      >
                        Full name
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reg-email"
                        className="mb-1.5 block text-xs font-semibold text-[var(--steel-300)]"
                      >
                        Email address
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="submit"
                      className="tap-44 mt-1 w-full rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-6 py-3.5 text-sm font-bold text-[var(--on-cta)] shadow-[var(--shadow-cta),inset_0_1px_0_rgba(255,255,255,0.16)] transition-[filter,transform] duration-[var(--dur-1)] hover:brightness-110 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
                    >
                      Get Started Free
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs text-[var(--steel-400)]">
                    Already have an account?{' '}
                    <TrackedLink
                      to="/login"
                      label="register-signin"
                      className="font-medium text-[var(--signal-200)] hover:underline"
                    >
                      Sign in
                    </TrackedLink>
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
