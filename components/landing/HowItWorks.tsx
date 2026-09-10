import { Badge } from "@/components/ui/Badge";
import { UserPlus, BookOpen, Trophy } from "lucide-react";
import { Reveal, Stagger } from "@/components/ui/Motion";

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Take the Diagnostic",
    description:
      "Answer 10 quick questions across 5 subjects. Find your strongest and weakest areas in under 2 minutes.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Practice Daily",
    description:
      "Create a free account, then solve exam-style MCQs with instant explanations. Follow your personalised study plan.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Improve & Track",
    description:
      "Watch your accuracy improve, track streaks, and walk into the exam confident. Prepare with structure, practice with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="section-padding section-glow-divider relative overflow-hidden"
      data-scroll-reveal
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <Reveal>
          <div className="mb-14 text-center">
            <Badge variant="glass" className="mb-4">
              How It Works
            </Badge>
            <h2
              id="how-it-works-heading"
              className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl"
            >
              Three Steps to{" "}
              <span className="text-[var(--signal-200)]">Your Dream College</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[var(--steel-300)]">
              Getting started takes less than a minute. No fees, no paperwork — just practice.
            </p>
          </div>
        </Reveal>

        <Stagger stagger={120} className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="relative flex flex-col items-center rounded-[var(--radius-xl)] border border-[var(--line-2)] bg-[var(--srf-1)] p-7 text-center transition-colors duration-[var(--dur-2)] hover:border-[var(--line-signal)] hover:bg-[var(--srf-2)]">
              {/* The line between steps brightens toward the next one — the
                  sequence is the information, so the connector shows direction. */}
              {number !== "03" && (
                <div
                  aria-hidden="true"
                  className="absolute top-10 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-[linear-gradient(90deg,var(--line-2),var(--line-signal))] md:block"
                />
              )}

              <div className="group relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--line-3)] bg-[var(--srf-2)] transition-all duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:border-[var(--line-signal)] group-hover:bg-[var(--tint-signal)] group-hover:shadow-[var(--glow-signal)]">
                  <Icon className="h-8 w-8 text-[var(--signal-300)]" aria-hidden="true" />
                </div>
                <span className="font-display absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--signal-300)] text-xs font-bold tabular-nums text-[var(--color-text-inverse)]">
                  {number}
                </span>
              </div>

              <h3 className="mb-2 text-lg text-[var(--steel-100)]">{title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-[var(--steel-300)]">
                {description}
              </p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
