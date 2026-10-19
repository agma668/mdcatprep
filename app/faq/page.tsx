import type { Metadata } from "next";
import { ANALYSIS_CORPUS, formatStat } from "@/lib/stats";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl, getWhatsAppLink } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "FAQ — MDCAT & NUMS Preparation Questions Answered",
  description:
    "Answers to every question about MDCAT and NUMS preparation in Pakistan — syllabus, marks distribution, registration, dates, eligibility and study strategy.",
  keywords: [
    "MDCAT FAQ",
    "MDCAT questions Pakistan",
    "MDCAT syllabus 2026",
    "NUMS entry test questions",
    "MDCAT marks distribution",
    "MDCAT registration process",
    "MDCAT eligibility FSc pre-medical",
    "how to prepare for MDCAT",
    "MDCAT preparation tips",
    "MDCAT vs NUMS difference",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/faq`,
    title: "FAQ — MDCAT & NUMS Questions | MED Prep",
    description: "Answers to every question about MDCAT and NUMS preparation in Pakistan.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Frequently Asked Questions — MED Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | MED Prep",
    description: "All your MDCAT and NUMS questions answered.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/faq" },
};

// Fact-checked answers. Date claims carry their source; pattern claims match
// the published PMDC MDCAT structure. No invented statistics.
const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "What is MED Prep?",
        a: "MED Prep is a free online preparation platform for MDCAT and NUMS in Pakistan. It provides exam-style MCQ practice, master concept notes, repeat-fact high-yield notes, progress analytics, and a WhatsApp community — all at no cost.",
      },
      {
        q: "Is MED Prep really free?",
        a: "Yes. The full question bank, study notes, progress dashboard, and WhatsApp group are completely free. There is no trial period, no credit card required, and no expiry. Premium one-on-one mentoring is available for Rs. 6,000 but is optional.",
      },
      {
        q: "Who can use MED Prep?",
        a: "Any student preparing for medical entry tests in Pakistan — FSc pre-medical, A-Level, and repeater students alike. The material is written from the PMDC MDCAT syllabus, which every public and private medical college admission test in Pakistan draws from.",
      },
      {
        q: "Who runs MED Prep?",
        a: "MED Prep is an independent, free platform built so every student in Pakistan can access quality exam preparation, no matter which city they study in. The people behind it prefer to stay behind the scenes — the platform's work is the public story.",
      },
    ],
  },
  {
    category: "MDCAT & NUMS: Tests, Syllabus and Dates",
    items: [
      {
        q: "What is the difference between MDCAT and NUMS?",
        a: "MDCAT is the national medical admission test conducted by PMDC (Pakistan Medical and Dental Council) — it is mandatory for MBBS/BDS admission in public and private colleges. NUMS (National University of Medical Sciences) runs its own entry test for its affiliated institutions; NUMS MDCAT is held separately, usually before the national MDCAT.",
      },
      {
        q: "What subjects are in the MDCAT, and what is the marks distribution?",
        a: "The PMDC MDCAT paper is 180 MCQs, completed in 3 hours with no negative marking. Biology carries the most weight, so your study plan should reflect that. Check pmdc.pk for the official split of the current year.",
      },
      {
        q: "When is the MDCAT 2026 exam?",
        a: "The national MDCAT 2026 was rescheduled by PMDC and will be held on Sunday, 20 September 2026 (source: PMDC public notice and Dawn, 2026-08-06). NUMS MDCAT 2026 is on Sunday, 13 September 2026 (source: numspak.edu.pk). Always confirm on pmdc.pk and numspak.edu.pk for last-minute changes.",
      },
      {
        q: "What is the eligibility criteria for MDCAT?",
        a: "You need at least 60% marks in FSc pre-medical (or an equivalent A-Level combination of Biology, Chemistry and Physics). DAE and other equivalent holders should verify their case with PMDC directly. There is no age limit.",
      },
      {
        q: "How many times can I attempt MDCAT?",
        a: "There is currently no limit on MDCAT attempts — repeaters sit the test every year. A gap year with focused practice is a common and proven route to a better score.",
      },
    ],
  },
  {
    category: "Preparation & Practice",
    items: [
      {
        q: "How do I prepare for MDCAT at home?",
        a: "1) Sign up on MED Prep for free. 2) Start subject-wise MCQ practice, Biology first. 3) Read the master concept notes for every topic you miss. 4) Use the high-yield repeat-fact notes in the last month — they come from analysis of thousands of real past-paper questions. 5) Take timed mock tests weekly. 6) Review your analytics to find weak areas and fix them.",
      },
      {
        q: "Does MED Prep have past papers?",
        a: `Yes. The Past Papers section lists the MDCAT and NUMS papers we hold, sorted by board and year, and each one says whether an official answer key exists. Our high-yield notes are built from analysis of ${formatStat(ANALYSIS_CORPUS)} real-paper questions, with repeat facts marked by how often they appear. The exam-style MCQ bank is original writing that models the actual test pattern.`,
      },
      {
        q: "Can I use MED Prep on my phone?",
        a: "Yes. MED Prep works on any smartphone or computer with an internet connection, and it is fully installable as a PWA (Add to Home Screen) so your streaks and practice stay one tap away — even on slow connections.",
      },
      {
        q: "How does the progress tracking work?",
        a: "MED Prep tracks every question you answer, calculates your accuracy per subject and topic, shows your daily streak, and provides weekly progress reports. The analytics dashboard shows trends, weak areas, and recommended next steps.",
      },
      {
        q: "How long should I prepare for MDCAT?",
        a: "Most students need 3–6 months of consistent preparation after covering FSc coursework. Repeating students often sharpen in 6–10 weeks. What matters is daily practice with analytics: 1–2 focused hours beats long passive reading.",
      },
    ],
  },
  {
    category: "Admissions & Merit",
    items: [
      {
        q: "How is the final medical admission merit calculated?",
        a: "Public-sector merit combines MDCAT score with your FSc marks (the exact MDCAT-to-FSc weighting is set per admission cycle by PMDC and the provincial admitting universities). Private colleges weigh MDCAT more heavily. Check your target university's admission notice for the current formula.",
      },
      {
        q: "Which universities accept MDCAT vs NUMS scores?",
        a: "All public and private medical and dental colleges in Pakistan accept PMDC MDCAT. NUMS and its affiliated military hospitals and colleges accept the NUMS test. Some private institutions accept both — always verify with the specific college's prospectus.",
      },
      {
        q: "Can I apply for MBBS and BDS with the same test?",
        a: "Yes. One MDCAT score covers both MBBS and BDS admission applications in the same cycle.",
      },
    ],
  },
  {
    category: "Technical & Account",
    items: [
      {
        q: "How do I sign up?",
        a: "Click 'Sign Up Free' on the homepage. Enter your name, email, and optionally your phone and exam target. Your account is reviewed by admin and approved — then you can log in and start practising.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Forgot Password' on the login page. Enter your email address and you will receive a password reset link.",
      },
      {
        q: "How do I contact MED Prep?",
        a: "Use the WhatsApp button on the homepage or your dashboard to message us directly, and join the WhatsApp community group from the homepage link for guidance and updates.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.flatMap(({ items }) =>
    items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container-page relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Frequently Asked <span className="text-[var(--color-accent-light)]">Questions</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Everything students and parents ask about MDCAT and NUMS preparation, MED Prep, and study strategy.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-page max-w-4xl space-y-12">
            {FAQS.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-xl font-extrabold text-[var(--color-accent-light)] mb-6">{category}</h2>
                <div className="space-y-3">
                  {items.map(({ q, a }) => (
                    <details
                      key={q}
                      className="group bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none hover:bg-white/[0.08] transition-colors">
                        <span className="font-semibold text-white text-sm">{q}</span>
                        <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-open:rotate-180 text-[var(--color-accent-light)]">
                          ↓
                        </span>
                      </summary>
                      <div className="px-6 pb-5 pt-1">
                        <p className="text-sm text-white/70 leading-relaxed">{a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 bg-white/[0.02]">
          <div className="container-page text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold text-white mb-4">Still have questions?</h2>
            <p className="text-white/70 mb-6">Message us directly on WhatsApp for personal guidance.</p>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[var(--radius-md)] bg-[var(--whatsapp)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--whatsapp-deep)] transition-colors"
            >
              💬 Ask on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
