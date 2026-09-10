import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, BookOpen, BarChart3, Users } from "lucide-react";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Military College Jhelum (MCJ) Entry Test Prep — Free MCQ Practice | Cadet College Prep",
  description:
    "Free Military College Jhelum (MCJ) entry test preparation. Practice exam-style MCQs in Mathematics, English, General Science and Aptitude.",
  keywords: [
    "MCJ Jhelum entry test",
    "Military College Jhelum preparation",
    "MCJ entry test MCQs",
    "Military College Jhelum admission",
    "MCJ math practice",
    "MCJ English MCQs",
    "MCJ science MCQs",
    "Military College Jhelum entry test 2026",
    "free MCJ preparation online",
    "military college Jhelum test pattern",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/colleges/mcj`,
    title: "Military College Jhelum (MCJ) Entry Test Prep — Free | Cadet College Prep",
    description:
      "Free MCJ Jhelum entry test preparation. Exam-style MCQ practice, study notes and analytics.",
    siteName: "Cadet College Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Military College Jhelum Entry Test Preparation — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCJ Jhelum Entry Test Prep | Cadet College Prep",
    description:
      "Free MCJ Jhelum entry test preparation. MCQ practice, study notes and analytics.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/colleges/mcj",
  },
};

const mcjJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Military College Jhelum (MCJ) Entry Test Preparation",
  description:
    "Free preparation course for Military College Jhelum entry test covering Mathematics, English, General Science and Aptitude.",
  provider: {
    "@type": "EducationalOrganization",
    name: "Cadet College Prep",
    url: siteUrl,
  },
  url: `${siteUrl}/colleges/mcj`,
  isAccessibleForFree: true,
  inLanguage: "en",
  educationalLevel: "Secondary",
  about: {
    "@type": "Thing",
    name: "Military College Jhelum Entry Test",
  },
};

export default function CollegePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mcjJsonLd) }}
      />
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container-page relative z-10">
            <Badge variant="accent" className="mb-4">Pakistan&apos;s Premier Prep Platform</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              <span className="text-[var(--color-accent-light)]">Military College Jhelum</span> Entry Test Prep
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mb-8">
              MCJ entry test evaluates math, English, science and aptitude.
              Prepare with free exam-style MCQs, track your progress and get ready to ace the test.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors">Start Preparing Free</Link>
              <a href="https://chat.whatsapp.com/GbhjI1A6FvBBtAd4PZR2NU" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors">Join WhatsApp</a>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white/[0.02]">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-white mb-8">Subjects Covered</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Mathematics","English","General Science","Aptitude"].map((s) => (
                <div key={s} className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 text-center">
                  <BookOpen className="w-6 h-6 text-[var(--color-accent-light)] mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-white mb-2">Test Pattern &amp; Syllabus</h2>
            <p className="text-sm text-white/60 mb-8">Military College Jhelum entry test — 200 marks, 3 hours, 4 sections.</p>
            <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-xl)] overflow-hidden max-w-2xl">
              <div className="grid grid-cols-12 bg-white/[0.04] px-5 py-3 border-b border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <div className="col-span-5">Section</div>
                <div className="col-span-4">Topics</div>
                <div className="col-span-3 text-right">Marks</div>
              </div>
              {[
                { section: "A — Mathematics", topics: "Arithmetic, Algebra, Geometry", marks: "50" },
                { section: "B — English + Urdu", topics: "Grammar, Comprehension, Urdu Grammar", marks: "50" },
                { section: "C — General Science", topics: "Physics, Chemistry, Biology", marks: "50" },
                { section: "D — Aptitude / Islamiat", topics: "IQ, Pattern Recognition, Islamiyat", marks: "50" },
              ].map(({ section, topics, marks }, i) => (
                <div key={section} className={`grid grid-cols-12 px-5 py-3.5 items-center ${i < 3 ? "border-b border-white/5" : ""}`}>
                  <div className="col-span-5 text-sm font-semibold text-white">{section}</div>
                  <div className="col-span-4 text-xs text-white/60">{topics}</div>
                  <div className="col-span-3 text-sm font-bold text-[var(--color-accent-light)] text-right">{marks}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-5 py-3 bg-white/[0.04] border-t border-white/10">
                <div className="col-span-5 text-sm font-bold text-white">Total</div>
                <div className="col-span-4 text-xs text-white/50">Class 8 entry — one of Pakistan&apos;s oldest</div>
                <div className="col-span-3 text-sm font-extrabold text-[var(--color-accent-light)] text-right">200</div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-white mb-8">Why Prepare with Cadet College Prep?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {i: CheckCircle, t: "Exam-Style MCQs", d: "Practice with MCJ Jhelum format questions designed to match the real test pattern."},
                {i: BarChart3, t: "Track Progress", d: "Real-time accuracy, streaks and analytics to measure your improvement."},
                {i: Users, t: "Community", d: "Leaderboard and WhatsApp groups for peer guidance and mentorship."},
              ].map(({i: I, t, d}) => (
                <div key={t} className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                  <I className="w-6 h-6 text-[var(--color-accent-light)] mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">{t}</h3>
                  <p className="text-sm text-white/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 bg-white/[0.02]">
          <div className="container-page text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Ace the <span className="text-[var(--color-accent-light)]">MCJ Jhelum</span> Entry Test?</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">Join students across Pakistan preparing with Cadet College Prep. Sign up free — no credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold text-lg hover:bg-[var(--color-accent-light)] transition-colors">Sign Up Free</Link>
          </div>
        </section>
        <section className="py-16">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-white mb-8">Study Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/blog/cadet-vs-military-college" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <p className="text-xs font-bold text-[var(--color-accent-light)] uppercase tracking-wider mb-2">Blog Guide</p>
                <p className="text-sm font-bold text-white">Cadet College vs Military College</p>
              </Link>
              <Link href="/faq" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <p className="text-xs font-bold text-[var(--color-accent-light)] uppercase tracking-wider mb-2">FAQ</p>
                <p className="text-sm font-bold text-white">MCJ Entry Test Questions Answered</p>
              </Link>
              <Link href="/daily-quiz" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <p className="text-xs font-bold text-[var(--color-accent-light)] uppercase tracking-wider mb-2">Practice</p>
                <p className="text-sm font-bold text-white">Try Today&apos;s Free MCQ</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
