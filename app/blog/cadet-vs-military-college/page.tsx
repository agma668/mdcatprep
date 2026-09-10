import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Cadet College vs Military College — Which One Should You Choose?",
  description:
    "Understand the key differences between cadet colleges and military colleges in Pakistan. Compare admission process, fees, lifestyle, career paths and which is right for you.",
  keywords: [
    "cadet college vs military college",
    "difference between cadet and military college Pakistan",
    "which college is better CCH or military",
    "cadet college admission process",
    "military college admission process",
    "cadet college fees Pakistan",
    "military college fees Pakistan",
    "career after cadet college",
    "career after military college",
    "best cadet college in Pakistan",
  ],
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/cadet-vs-military-college`,
    title: "Cadet College vs Military College — Which One Should You Choose?",
    description:
      "Compare cadet colleges and military colleges in Pakistan — admission, fees, lifestyle, and career paths.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Cadet College vs Military College — Cadet College Prep Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadet College vs Military College | Cadet College Prep",
    description: "Which is right for you? Compare both in detail.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog/cadet-vs-military-college",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cadet College vs Military College — Which One Should You Choose?",
  description:
    "Understand the key differences between cadet colleges and military colleges in Pakistan.",
  url: `${siteUrl}/blog/cadet-vs-military-college`,
  author: {
    "@type": "Organization",
    name: "Cadet College Prep",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "Cadet College Prep",
    url: siteUrl,
  },
  datePublished: "2026-08-20",
  dateModified: "2026-08-20",
};

const COMPARISONS = [
  { aspect: "Governance", cadet: "Run by private trusts or provincial governments", military: "Run directly by the Pakistan Army / PAF / Navy" },
  { aspect: "Military Training", cadet: "Basic discipline and physical training", military: "Full military-style training and lifestyle" },
  { aspect: "Career Path", cadet: "Opens doors to military, civil services and private sector", military: "Primarily prepares for commissioning as officer in armed forces" },
  { aspect: "Admission Age", cadet: "Class 7 or Class 8 pass (ages 12–14)", military: "Similar age range, some take Class 10 pass students" },
  { aspect: "Fee Structure", cadet: "Moderate — varies by college (some offer scholarships)", military: "Low to moderate — government subsidised" },
  { aspect: "Facilities", cadet: "Good boarding, labs and sports", military: "Excellent — state-of-the-art facilities" },
  { aspect: "Competition", cadet: "High — limited seats per college", military: "Very high — national-level competition" },
];

export default function CadetVsMilitaryPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main>
        <article className="pt-32 pb-20">
          <div className="container-page max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[var(--color-accent-light)] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="accent">Guide</Badge>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" /> August 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Clock className="w-3 h-3" /> 6 min read
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Cadet College vs Military College — Which One Should You Choose?
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Both cadet colleges and military colleges offer excellent
                education and discipline. But they differ in governance, training,
                career paths and lifestyle. Here&apos;s a detailed comparison.
              </p>
            </div>

            <div className="prose-custom space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is a Cadet College?
                </h2>
                <p>
                  Cadet colleges are residential institutions that provide
                  secondary education with military-style discipline. They are
                  run by private trusts or provincial governments. Examples
                  include CCH Hasanabdal, PAF College Sargodha, and Cadet
                  College Kohat. Students receive quality education along with
                  physical training, but the primary focus is academic
                  preparation alongside character building.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What is a Military College?
                </h2>
                <p>
                  Military colleges are directly operated by the armed forces
                  (Army, PAF, or Navy). They provide a more rigorous
                  military-style lifestyle with structured training routines.
                  Examples include Military College Jhelum (MCJ), Pakistan
                  Military Academy (PMA) Cadet College, and Military College
                  Murree. The primary goal is to prepare students for
                  commissioning as officers in the Pakistan Armed Forces.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Key Differences
                </h2>
                <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-xl)] overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/[0.04] px-6 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Aspect</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Cadet College</span>
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Military College</span>
                  </div>
                  {COMPARISONS.map(({ aspect, cadet, military }, i) => (
                    <div
                      key={aspect}
                      className={`grid grid-cols-3 px-6 py-4 ${i < COMPARISONS.length - 1 ? "border-b border-white/5" : ""} ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                    >
                      <span className="text-sm font-semibold text-white">{aspect}</span>
                      <span className="text-sm text-white/70">{cadet}</span>
                      <span className="text-sm text-white/70">{military}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Which One is Right for You?
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-2">
                      Choose a Cadet College if...
                    </h3>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-white/80">
                      <li>You want a balanced education with discipline but not full military rigour</li>
                      <li>You want to keep your career options open (civil services, private sector, military)</li>
                      <li>You prefer a slightly more relaxed boarding environment</li>
                    </ul>
                  </div>
                  <div className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-6">
                    <h3 className="text-lg font-bold text-[var(--color-accent-light)] mb-2">
                      Choose a Military College if...
                    </h3>
                    <ul className="text-sm space-y-1.5 list-disc list-inside text-white/80">
                      <li>You are determined to join the Pakistan Armed Forces as an officer</li>
                      <li>You thrive under strict discipline and structured routines</li>
                      <li>You want the best military training facilities available</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Preparation Tips for Both
                </h2>
                <p>
                  Regardless of which type of college you choose, the entry test
                  preparation is similar. Focus on Mathematics, English, General
                  Science and the specific subjects required by your target
                  college. Use Cadet College Prep&apos;s free question bank to practice
                  exam-style MCQs and track your progress.
                </p>
              </section>

              <section className="bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Start Preparing Today
                </h3>
                <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                  Whether you&apos;re aiming for a cadet college or military
                  college, Cadet College Prep has you covered with free MCQ practice, notes and
                  analytics.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/daily-quiz"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors"
                  >
                    Try Daily Quiz
                  </Link>
                </div>
              </section>
            </div>
          </div>

          <div className="container-page max-w-3xl mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl font-extrabold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/blog/cch-preparation-guide" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">CCH</Badge>
                <p className="text-sm font-bold text-white">How to Prepare for CCH Entry Test 2026</p>
              </Link>
              <Link href="/blog/paf-sargodha-preparation-tips" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] transition-colors">
                <Badge variant="glass" className="mb-2 text-[10px]">PAF Sargodha</Badge>
                <p className="text-sm font-bold text-white">Top 10 Tips to Pass PAF Sargodha Entry Test</p>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link href="/colleges/cch" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-4 flex items-center justify-between hover:bg-white/[0.09] transition-colors">
                <span className="text-sm font-bold text-white">CCH Practice</span>
                <span className="text-xs text-[var(--color-accent-light)]">→</span>
              </Link>
              <Link href="/colleges/mcj" className="bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-4 flex items-center justify-between hover:bg-white/[0.09] transition-colors">
                <span className="text-sm font-bold text-white">MCJ Practice</span>
                <span className="text-xs text-[var(--color-accent-light)]">→</span>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
