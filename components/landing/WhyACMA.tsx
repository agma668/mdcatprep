import { Check, Crosshair, HeartHandshake, MapPinned, X, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Reveal, Stagger } from "@/components/ui/Motion";
import { InteractiveTile } from "@/components/landing/InteractiveTile";

const DIFFERENTIATORS = [
  {
    acma: "Personalised practice and instant feedback for every student",
    old: "Same notes for every student",
  },
  {
    acma: "Instant, detailed explanations for every MCQ",
    old: "Wait for the next class to get answers",
  },
  {
    acma: "Available 24/7 — practice at your own pace",
    old: "Fixed class timings, no flexibility",
  },
  {
    acma: "Exam-style practice questions for all major colleges",
    old: "Random questions with no exam relevance",
  },
  {
    acma: "Progress tracked automatically",
    old: "No way to measure improvement",
  },
  {
    acma: "Free online access from anywhere in Pakistan",
    old: "Expensive, city-limited coaching centres",
  },
] as const;

// These three are parallel reasons, not a sequence, so they carry an icon each
// rather than 01/02/03 — numbering would imply an order that doesn't exist.
const REASONS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: HeartHandshake,
    title: "A Community Service",
    description:
      "Cadet College Prep is a non-profit initiative — a community effort to help students from every corner of Pakistan access quality exam preparation without barriers.",
  },
  {
    icon: MapPinned,
    title: "Trusted by Families Across Pakistan",
    description:
      "Students from Karachi to Peshawar, from small towns to major cities, use Cadet College Prep to compete on equal footing with students from elite academies.",
  },
  {
    icon: Crosshair,
    title: "Focused on Real Exams",
    description:
      "We know exactly what CCH, PAF, MCJ and the other entry tests require — and we prepare you precisely for that, question by question.",
  },
];

export function WhyACMA() {
  return (
    <section
      id="why-acma"
      aria-labelledby="why-acma-heading"
      className="section-padding section-glow-divider relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 right-0 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <Reveal>
          <div className="mb-14 text-center">
            <Badge variant="glass" className="mb-4">
              Why Cadet College Prep?
            </Badge>
            <h2
              id="why-acma-heading"
              className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl"
            >
              Old Coaching vs{" "}
              <span className="text-[var(--signal-200)]">Cadet College Prep Platform</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[var(--steel-300)]">
              See how Cadet College Prep compares with traditional coaching, point by point.
            </p>
          </div>
        </Reveal>

        {/* Comparison table. The left column recedes (dim icons, muted type) and
            the right advances — the contrast between the two columns is the
            argument, so brightness does the work instead of a colour clash. */}
        <Reveal delay={120}>
          <div className="glass-tile-elevated mx-auto mb-20 max-w-3xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-[var(--line-2)]">
              <div className="bg-[var(--srf-3)] px-6 py-4">
                <p className="text-sm font-semibold text-[var(--steel-400)]">
                  Old Coaching Centres
                </p>
              </div>
              <div className="bg-[var(--tint-signal-strong)] px-6 py-4">
                <p className="text-sm font-semibold text-[var(--signal-200)]">
                  Cadet College Prep Platform
                </p>
              </div>
            </div>

            {DIFFERENTIATORS.map(({ acma, old }, i) => (
              <div
                key={acma}
                className={`grid grid-cols-2 divide-x divide-[var(--line-2)] ${
                  i % 2 === 0 ? "bg-[var(--srf-2)]" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 px-6 py-4">
                  <X className="h-4 w-4 shrink-0 text-[var(--steel-500)]" aria-hidden="true" />
                  <span className="text-sm text-[var(--steel-400)]">{old}</span>
                </div>
                <div className="flex items-center gap-2.5 px-6 py-4">
                  <Check className="h-4 w-4 shrink-0 text-[var(--ok)]" aria-hidden="true" />
                  <span className="text-sm font-medium text-[var(--steel-100)]">{acma}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Stagger stagger={150} className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <InteractiveTile key={title} className="h-full">
              <Card
                variant="glass"
                className="group feature-tile glass-shine flex h-full flex-col p-6"
              >
                <span
                  aria-hidden="true"
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:-translate-y-0.5"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-3 text-xl text-[var(--steel-100)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--steel-300)]">
                  {description}
                </p>
              </Card>
            </InteractiveTile>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
