import {
  BarChart,
  BookOpen,
  NotebookPen,
  StickyNote,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Motion";
import { InteractiveTile } from "@/components/landing/InteractiveTile";

// Icon tiles used to be six saturated hues (yellow, blue, amber, purple, rose,
// orange) — a swatch book, not a system. Colour now carries meaning: signal is
// the default, brass marks the free live classes (brass is the insignia metal
// and the word "free"), and beacon marks the one live-data card.
const TONES = {
  signal: "border-[var(--line-signal)] bg-[var(--tint-signal)] text-[var(--signal-300)]",
  brass: "border-[var(--line-brass)] bg-[var(--tint-brass)] text-[var(--champagne)]",
  beacon: "border-[rgba(95,211,228,0.24)] bg-[var(--tint-beacon)] text-[var(--beacon-400)]",
} as const;

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  wide?: boolean;
  tone: keyof typeof TONES;
}[] = [
  {
    icon: NotebookPen,
    title: "MCQ Practice with Explanations",
    description:
      "Practice subject-wise and topic-wise MCQs with instant explanations after every answer. Your progress is recorded automatically.",
    badge: "Practice",
    wide: true,
    tone: "signal",
  },
  {
    icon: BookOpen,
    title: "Full Syllabus Coverage",
    description:
      "Every subject, every topic — Mathematics, English, Science, Urdu, Islamiat, and IQ — structured exactly as the real entry tests.",
    badge: "Complete",
    tone: "signal",
  },
  {
    icon: StickyNote,
    title: "Important Notes Library",
    description:
      "Access published notes from the academy and share your own. Upload a note and it appears after admin review.",
    badge: "Notes",
    tone: "signal",
  },
  {
    icon: Users,
    title: "Live WhatsApp Classes",
    description:
      "Join free live group classes with teachers. Get guidance, ask questions, and stay motivated with a community of fellow students.",
    badge: "Free",
    wide: true,
    tone: "brass",
  },
  {
    icon: BarChart,
    title: "Progress Dashboard",
    description:
      "Track your performance with detailed analytics. See your score trends, identify weak topics, and measure improvement week over week.",
    badge: "Analytics",
    tone: "beacon",
  },
  {
    icon: Swords,
    title: "Challenge a Friend",
    description:
      "Send today's quiz to a friend on WhatsApp and see who scores higher. Practice becomes a game when you play it together.",
    badge: "Fun",
    wide: true,
    tone: "signal",
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="section-padding section-glow-divider relative overflow-hidden"
      data-scroll-reveal
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -bottom-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--tint-beacon)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <Reveal direction="up">
          <div className="mb-14 text-center">
            <Badge variant="glass" className="mb-4">
              Platform Features
            </Badge>
            <h2
              id="features-heading"
              className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl"
            >
              Everything You Need to{" "}
              <span className="text-[var(--signal-200)]">Prepare with Confidence</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--steel-300)]">
              Structured MCQ practice, instant explanations, progress tracking, and live classes —
              all completely free for every student.
            </p>
          </div>
        </Reveal>

        {/* Bento: three tiles run two columns wide, so the grid reads as a
            deliberate layout rather than six identical cards. The col-span has
            to sit on the revealing wrapper — it is the grid item. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, badge, wide, tone }, i) => (
            <Reveal
              key={title}
              delay={i * 70}
              className={wide ? "lg:col-span-2" : ""}
            >
              <InteractiveTile className="h-full">
                <Card
                  variant="glass"
                  className="group feature-tile glass-shine relative flex h-full flex-col gap-4 overflow-hidden"
                >
                  <span aria-hidden="true" className="feature-sheen pointer-events-none absolute top-0 bottom-0 w-[140px] -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ left: "var(--tile-glow-x, 50%)" }} />
                  <div className="flex items-start justify-between">
                    <span
                      aria-hidden="true"
                      className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:-translate-y-0.5 ${TONES[tone]}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <Badge variant="glass">{badge}</Badge>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg text-[var(--steel-100)]">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--steel-300)]">
                      {description}
                    </p>
                  </div>
                </Card>
              </InteractiveTile>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
