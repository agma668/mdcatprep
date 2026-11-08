import { Badge } from "@/components/ui/Badge";
import { MessageCircle, Star } from "lucide-react";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="section-padding relative overflow-hidden bg-mesh"
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(200,151,42,0.06)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <div className="text-center mb-14">
          <Badge variant="glass" className="mb-4">
            Student Feedback
          </Badge>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
          >
            What Students Say About{" "}
            <span className="text-[var(--color-accent-light)]">MED Prep</span>
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Real feedback from students preparing for their entry tests.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <MessageCircle className="w-8 h-8 text-[var(--color-accent-light)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Be the first to share your experience
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Cadet College Prep is new and growing. As students use the platform and see results,
              we&apos;ll share their honest feedback here. No invented stories —
              just real words from real students.
            </p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-white/20"
                />
              ))}
            </div>
            <p className="text-xs text-white/40">
              Your feedback could appear here after your entry test results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
