import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Motion";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "Who can take MDCAT and NUMS?",
    answer:
      "Students who have completed or are appearing in FSc Pre-Medical (or an equivalent qualification like A-Levels with Biology, Chemistry and Physics) can sit MDCAT. NUMS uses the same PMDC syllabus for its own test, plus a Logical Reasoning section. Always verify eligibility in the current year's official PMDC/NUMS announcement.",
  },
  {
    question: "How long does it take to prepare for MDCAT?",
    answer:
      "Preparation time depends on your starting point, available study time and familiarity with the syllabus. A consistent routine of topic review, timed practice and revisiting mistakes is more useful than relying on a fixed number of weeks.",
  },
  {
    question: "What subjects and marks does the MDCAT paper cover?",
    answer:
      "The PMDC MDCAT paper is 180 MCQs completed in 3 hours, with no negative marking. Biology carries the largest share, followed by Chemistry and Physics, with English and Logical Reasoning as the smaller sections. Confirm the exact year's split on pmdc.pk — it is the official source.",
  },
  {
    question: "Which universities accept MDCAT or NUMS scores?",
    answer:
      "MDCAT scores are used by public and private medical colleges across Pakistan — UHS, DUHS, KMU, SZABMU, Bolan and more. NUMS runs its own test for Army Medical College and its affiliated institutions. One score, many doors.",
  },
  {
    question: "Do you have past papers?",
    answer:
      "Yes. The Past Papers section lists the MDCAT and NUMS papers we hold, sorted by board and year, and each one says plainly whether an official answer key exists. Alongside them you get exam-style questions written from scratch on the official PMDC syllabus, so you always know what is a real paper and what is practice.",
  },
  {
    question: "How is MED Prep different from a regular coaching academy?",
    answer:
      "MED Prep brings independent practice, answer explanations, topic-based resources and progress tools together. Where supported, your activity can help you identify topics that need more revision. It is designed to complement—not replace—your teachers, textbooks and official exam guidance.",
  },
  {
    question: "Is everything really free?",
    answer:
      "You can explore the public practice resources without an upfront payment. Some features may require an account, and access can change as the platform develops. Check the relevant feature page for its current access requirements.",
  },
  {
    question: "Can I use MED Prep on my phone?",
    answer:
      "The site is designed to work in modern smartphone browsers as well as on desktop. You can use your browser's 'Add to Home Screen' option where supported. Offline access depends on the feature and is not guaranteed for every resource.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your practice records are tied to your account so they survive across devices, and we never sell or share your data. You can read the full privacy policy on our Privacy page, and delete your account (and all your data) at any time from Profile → Delete account.",
  },
  {
    question: "Can students from rural areas or small cities use MED Prep?",
    answer:
      "Absolutely — that is one of MED Prep's main goals. All you need is a smartphone or computer with an internet connection. MED Prep was built to give students in smaller cities and towns the same quality preparation as students in major urban centres.",
  },
  {
    question: "How is this different from YouTube channels and free PDFs?",
    answer:
      "YouTube videos and PDFs are great for one-off topic explanations, but they can't tell you which topics you personally are weak in, give you instant feedback after every MCQ, or record your progress over weeks. MED Prep is the practice + tracking layer — the structured system that turns content into improvement.",
  },
  {
    question: "What if I have questions outside the platform — can I get help?",
    answer:
      "Yes! Join the free WhatsApp community group — students help each other with subject questions, motivation, and strategy advice.",
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
        <Reveal distance={20} duration={520}>
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
              Everything parents and students ask before joining MED Prep.
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
