import Link from "next/link";
import { Check, GraduationCap, MessageCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Reveal, ScaleIn } from "@/components/ui/Motion";

const WHATSAPP_GROUP = "https://chat.whatsapp.com/GbhjI1A6FvBBtAd4PZR2NU";

const FREE_FEATURES = [
  "Live online group classes with teachers",
  "Exam-style MCQ practice",
  "Study notes library",
  "Progress tracking dashboard",
  "WhatsApp group support",
] as const;


export function CTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="section-padding relative overflow-hidden section-glow-divider"
    >
      {/* Two soft fields of light, one steel and one brass — this is the only
          section where brass leads, because the subject is the word "free". */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--tint-signal)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--tint-brass)] blur-3xl"
      />

      <div className="container-page relative z-10">
        <Reveal direction="up">
          <div className="mb-10 text-center">
            {/* Signal, not brass. The headline directly below already spends
                the medal metal on the words "100% Free", and two brass things
                stacked in one band is how brass stopped meaning anything on the
                old site. The chip keeps its copy and gives up the metal. */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-5 py-2">
              <Sparkles className="h-4 w-4 text-[var(--signal-300)]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[var(--signal-200)]">
                Great News!
              </span>
            </div>
            <h2
              id="cta-heading"
              className="mb-5 text-3xl text-[var(--steel-100)] sm:text-4xl md:text-5xl"
            >
              Everything Is{' '}
              <span className="text-liquid-gold">100% Free</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[var(--steel-300)]">
              MCQ practice, study notes, progress tracking, and live WhatsApp classes with teachers —
              all completely free for every student preparing for cadet college entry tests.
              No credit card, no trial, no hidden charges.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mb-14 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/diagnostic">
              <Button variant="primary" size="lg" className="gap-2 px-10 text-base">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Take Free Diagnostic Quiz
              </Button>
            </Link>
            <a
              href={WHATSAPP_GROUP}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* WhatsApp green is the service's own brand mark, so it stays —
                  but the hover fill takes dark ink, not white: white on #25D366
                  is 2:1 and unreadable. */}
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 border-[var(--whatsapp)] px-10 text-base text-[var(--whatsapp)] hover:border-[var(--whatsapp)] hover:bg-[var(--whatsapp)] hover:text-[var(--color-text-inverse)]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Join WhatsApp Group
              </Button>
            </a>
          </div>
        </Reveal>

        <ScaleIn delay={200}>
          <div className="mx-auto max-w-md">
            <div className="glass-tile-elevated glass-shine flex flex-col p-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[var(--signal-300)]" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[var(--steel-300)]">
                    Group Classes
                  </p>
                </div>
                <div className="mb-1 flex items-end gap-2">
                  <span className="font-display text-4xl font-bold text-[var(--champagne)]">
                    FREE
                  </span>
                </div>
                <p className="text-sm text-[var(--steel-400)]">
                  Live group classes with teachers — open to all students, always free.
                </p>
              </div>

              <ul role="list" className="mb-8 flex flex-1 flex-col gap-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--steel-200)]">
                    <Check className="h-4 w-4 shrink-0 text-[var(--ok)]" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* The same action as the button above, so it gets the same
                  treatment. As a bare secondary on this elevated tile it read
                  as a disabled control — one action should not have two
                  appearances forty pixels apart. */}
              <a
                href={WHATSAPP_GROUP}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="gap-2 border-[var(--whatsapp)] text-[var(--whatsapp)] hover:border-[var(--whatsapp)] hover:bg-[var(--whatsapp)] hover:text-[var(--color-text-inverse)]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Join WhatsApp Group
                </Button>
              </a>
            </div>
          </div>
        </ScaleIn>

        {/* Static, not revealed: three plain facts don't need an entrance. */}
        <div className="mt-12 flex flex-col items-center justify-center gap-6 text-center sm:flex-row">
          {[
            { icon: GraduationCap, text: "Qualified teachers" },
            { icon: MessageCircle, text: "WhatsApp support" },
            { icon: Users, text: "Students across Pakistan" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-[var(--steel-400)]">
              <Icon className="h-4 w-4 text-[var(--signal-400)]" aria-hidden="true" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
