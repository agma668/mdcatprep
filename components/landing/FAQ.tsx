import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Motion";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "Which classes are eligible to apply for cadet colleges?",
    answer:
      "Most cadet colleges accept students after Class 7 or Class 8 (for O-Level / Class 9 entry). Some colleges like CCH and PAF Sargodha take Class 7 pass students (entering Class 8). Always verify with each college's official announcement for the current year.",
  },
  {
    question: "How long does it take to prepare for the entry test?",
    answer:
      "We recommend 3–6 months of consistent preparation. Students who use Cadet College Prep daily for 1–2 hours typically see significant improvement within 6–8 weeks. Our structured course plan guides you through the full syllabus in an organised, exam-focused sequence.",
  },
  {
    question: "What subjects are covered in the CCH entry test?",
    answer:
      "The Cadet College Hasanabdal (CCH) entry test covers 5 sections: Section A — Mathematics (50 marks), Section B — English + Islamiat (40+10 marks), Section C — General Science 25 MCQs (50 marks), Section D — Urdu (50 marks). Total: 200 marks in 3 hours.",
  },
  {
    question: "Does Cadet College Prep cover all major colleges in Pakistan?",
    answer:
      "Yes! Cadet College Prep covers CCH, PAF Sargodha, MCJ Jhelum, Cadet College Kohat, Cadet College Petaro, Cadet College Razmak, Military College Murree, and more. Each college's material is tailored to its specific syllabus and exam format.",
  },
  {
    question: "Do you have past papers?",
    answer:
      "No — and neither does anyone you should trust. Official entry-test papers are not published by the colleges, so any site claiming to have them is either wrong or sharing leaks. Cadet College Prep questions are written from scratch, modelled on each college's published test pattern (sections, marks, time, difficulty). You can see exactly which test pattern each pack targets.",
  },
  {
    question: "How is Cadet College Prep different from a regular coaching academy?",
    answer:
      "Unlike coaching academies that give the same notes to everyone, Cadet College Prep personalises your practice to your weak areas. You get instant explanations after every question, can study at any time, track your exact progress, and access exam-style practice questions — all at a fraction of academy cost.",
  },
  {
    question: "Is everything really free?",
    answer:
      "Yes. Everything on Cadet College Prep is completely free — all practice MCQs, study notes, syllabus material, progress tracking, and live WhatsApp classes. No credit card, no trial period, no hidden charges. Cadet College Prep is a community initiative to help students across Pakistan.",
  },
  {
    question: "Can I use Cadet College Prep on my phone?",
    answer:
      "Yes — the whole site is built mobile-first and works on any smartphone browser. You can also install it as an app from your browser's 'Add to Home Screen' (works on Android and iPhone), and download up to 200 questions to keep practising when you don't have internet.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your practice records are tied to your account so they survive across devices, and we never sell or share your data. You can read the full privacy policy on our Privacy page, and delete your account (and all your data) at any time from Profile → Delete account.",
  },
  {
    question: "Can students from rural areas or small cities use Cadet College Prep?",
    answer:
      "Absolutely — that is one of Cadet College Prep's main goals. All you need is a smartphone or computer with an internet connection. Cadet College Prep was built to give students in smaller cities and towns the same quality preparation as students in major urban centres.",
  },
  {
    question: "How is this different from YouTube channels and free PDFs?",
    answer:
      "YouTube videos and PDFs are great for one-off topic explanations, but they can't tell you which topics you personally are weak in, give you instant feedback after every MCQ, or record your progress over weeks. Cadet College Prep is the practice + tracking layer — the structured system that turns content into improvement.",
  },
  {
    question: "What if I have questions outside the platform — can I get help?",
    answer:
      "Yes! Join our free WhatsApp group where teachers and fellow students help each other with subject questions, motivation, and strategy advice.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-mesh section-padding relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <Reveal>
          <div className="mb-14 text-center">
            <Badge variant="glass" className="mb-4">
              FAQ
            </Badge>
            <h2
              id="faq-heading"
              className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl"
            >
              Frequently Asked{" "}
              <span className="text-[var(--signal-200)]">Questions</span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[var(--steel-300)]">
              Everything parents and students ask before joining Cadet College Prep.
            </p>
          </div>
        </Reveal>

        {/* Plain <details> so answers open with JavaScript off. The open row
            lights its left edge — the only marker needed to show which one
            you're reading. The list itself doesn't animate in: thirteen rows
            fading up in sequence delays the answer someone came for. */}
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {FAQS.map(({ question, answer }) => (
            <details
              key={question}
              className="group overflow-hidden rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] shadow-[var(--shadow-md)] transition-colors duration-[var(--dur-1)] open:border-[var(--line-signal)] open:bg-[var(--srf-2)]"
            >
              <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors duration-[var(--dur-1)] select-none hover:bg-[var(--srf-2)]">
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-0 w-[2px] origin-center scale-y-0 bg-[var(--signal-300)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-open:scale-y-100"
                />
                <span className="pr-2 text-base font-semibold text-[var(--steel-100)]">
                  {question}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--srf-3)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-open:rotate-180"
                >
                  <ChevronDown className="h-4 w-4 text-[var(--signal-300)]" />
                </span>
              </summary>
              <div className="px-6 pt-1 pb-5">
                <p className="text-sm leading-relaxed text-[var(--steel-300)]">
                  {answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
