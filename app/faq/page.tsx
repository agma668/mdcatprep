import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl, getWhatsAppLink } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "FAQ — Cadet College Entry Test Preparation Questions Answered",
  description:
    "Answers to every question about cadet college entry tests in Pakistan — CCH, PAF Sargodha, MCJ, Kohat. Syllabus, preparation, fees, admission process and more.",
  keywords: [
    "cadet college FAQ",
    "CCH entry test questions",
    "cadet college admission process Pakistan",
    "how to prepare for cadet college",
    "cadet college fees Pakistan",
    "military college vs cadet college",
    "CCH syllabus 2026",
    "PAF Sargodha entry test pattern",
    "cadet college age limit",
    "cadet college preparation tips",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/faq`,
    title: "FAQ — Cadet College Entry Test Questions | Cadet College Prep",
    description:
      "Answers to every question about cadet college entry tests in Pakistan.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Frequently Asked Questions — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Cadet College Prep",
    description: "All your cadet college questions answered.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "What is Cadet College Prep?",
        a: "Cadet College Prep (Cadet Prep) is a free online preparation platform for cadet and military college entry tests in Pakistan. It provides exam-style MCQ practice, study notes, progress analytics, and live WhatsApp mentorship — all at no cost.",
      },
      {
        q: "Is Cadet College Prep really free?",
        a: "Yes. The full question bank, study notes, progress dashboard, and WhatsApp group classes are completely free. There is no trial period, no credit card required, and no expiry. Premium one-on-one mentoring is available for Rs. 6,000 but is optional.",
      },
      {
        q: "Which colleges does Cadet College Prep cover?",
        a: "Cadet College Prep covers CCH Hasanabdal, PAF College Sargodha, Military College Jhelum (MCJ), Cadet College Kohat, Cadet College Petaro, Cadet College Razmak, Military College Murree, and more. Each college's material is tailored to its specific syllabus.",
      },
      {
        q: "Who founded Cadet College Prep?",
        a: "Cadet College Prep was founded by Muhammad Haziq Khan Miankhail, a CCH Hasanabdal alumni from Quetta, Balochistan. He built Cadet College Prep to make quality cadet college preparation accessible to students across Pakistan.",
      },
    ],
  },
  {
    category: "Entry Tests & Syllabus",
    items: [
      {
        q: "What is the CCH Hasanabdal entry test pattern?",
        a: "The CCH entry test has 4 sections: Section A — Mathematics (50 marks), Section B — English + Islamiat (40+10 marks), Section C — General Science 25 MCQs (50 marks), Section D — Urdu (50 marks). Total: 200 marks in 3 hours.",
      },
      {
        q: "What subjects are tested in PAF Sargodha entry test?",
        a: "PAF College Sargodha tests Mathematics, English, General Knowledge, and Analytical Reasoning. The analytical reasoning section is unique to PAF and requires pattern recognition and logical thinking practice.",
      },
      {
        q: "What is the MCJ Jhelum entry test pattern?",
        a: "Military College Jhelum tests Mathematics, English, General Science, and Aptitude. The test evaluates both academic knowledge and problem-solving ability.",
      },
      {
        q: "What is the age limit for cadet college admission?",
        a: "Most cadet colleges accept students after Class 7 or Class 8 (for O-Level / Class 9 entry). The typical age range is 12-14 years. Always check the official announcement for the specific college and year.",
      },
      {
        q: "How long should I prepare for the entry test?",
        a: "We recommend 3-6 months of consistent preparation. Students who practice 1-2 hours daily on Cadet College Prep typically see significant improvement within 6-8 weeks.",
      },
    ],
  },
  {
    category: "Preparation & Practice",
    items: [
      {
        q: "How do I prepare for CCH entry test at home?",
        a: "1) Sign up on Cadet College Prep for free. 2) Start with the subject-wise MCQ practice. 3) Follow the structured study plan. 4) Take mock tests weekly. 5) Review your analytics to identify weak areas. 6) Join the WhatsApp group for guidance.",
      },
      {
        q: "Does Cadet College Prep have past papers?",
        a: "Cadet College Prep's question bank is designed to match the exact format and difficulty of real entry tests. While we don't publish official past papers (they are copyrighted by the colleges), our MCQs are modeled after the actual test patterns.",
      },
      {
        q: "Can I use Cadet College Prep on my phone?",
        a: "Yes. Cadet College Prep works on any smartphone or computer with an internet connection. The platform is fully responsive and works great on mobile browsers.",
      },
      {
        q: "How does the progress tracking work?",
        a: "Cadet College Prep tracks every question you answer, calculates your accuracy per subject and topic, shows your daily streak, and provides weekly progress reports. The analytics dashboard shows trends, weak areas, and recommended next steps.",
      },
    ],
  },
  {
    category: "Cadet vs Military College",
    items: [
      {
        q: "What is the difference between a cadet college and a military college?",
        a: "Cadet colleges are run by private trusts or provincial governments and focus on academic preparation with military-style discipline. Military colleges are directly operated by the armed forces and provide full military training. Both have competitive entry tests.",
      },
      {
        q: "Which is better — CCH or MCJ?",
        a: "Both are excellent. CCH Hasanabdal is one of the most prestigious cadet colleges with a strong academic focus. MCJ Jhelum is a military college with more rigorous military training. Your choice depends on your career goals and preferences.",
      },
      {
        q: "Can I join the army after cadet college?",
        a: "Yes. Cadet college graduates can appear in ISSB (Inter-Services Selection Board) and join the Pakistan Armed Forces. Many cadet college alumni become officers in the Army, Navy, and Air Force.",
      },
    ],
  },
  {
    category: "Technical & Account",
    items: [
      {
        q: "How do I sign up?",
        a: "Click 'Sign Up Free' on the homepage. Enter your name, phone number, email, and select your target college. Your account will be reviewed by admin and approved within 24 hours.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Forgot Password' on the login page. Enter your email address and you will receive a password reset link within minutes.",
      },
      {
        q: "How do I contact Cadet College Prep?",
        a: "You can reach Muhammad Haziq directly on WhatsApp at 0319-3051175. You can also join the WhatsApp group from the link on the homepage for guidance and updates.",
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
              Everything students and parents ask about cadet college entry tests, Cadet College Prep, and preparation strategy.
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
            <p className="text-white/70 mb-6">Message Muhammad Haziq directly on WhatsApp for personal guidance.</p>
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
