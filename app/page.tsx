import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyACMA } from "@/components/landing/WhyACMA";
import { CollegeCarousel } from "@/components/landing/CollegeCarousel";

import { FAQ, FAQS } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { RegisterSection } from "@/components/landing/RegisterSection";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Footer } from "@/components/landing/Footer";
import { getPublicStats } from "@/lib/public-stats";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const MCQDemoSection = nextDynamic(() => import("@/components/landing/MCQDemoSection").then(m => ({ default: m.MCQDemoSection })), { loading: () => null });
const AnalyticsPreview = nextDynamic(() => import("@/components/landing/AnalyticsPreview").then(m => ({ default: m.AnalyticsPreview })), { loading: () => null });
const LeaderboardPreview = nextDynamic(() => import("@/components/landing/LeaderboardPreview").then(m => ({ default: m.LeaderboardPreview })), { loading: () => null });
const ScrollEffects = nextDynamic(() => import("@/components/landing/ScrollEffects").then(m => ({ default: m.ScrollEffects })));
const SmoothScroll = nextDynamic(() => import("@/components/landing/SmoothScroll").then(m => ({ default: m.SmoothScroll })), { loading: () => null });
const ExamCountdown = nextDynamic(() => import("@/components/dashboard/ExamCountdown").then(m => ({ default: m.ExamCountdown })), { loading: () => null });
const StudyObjects = nextDynamic(() => import("@/components/landing/StudyObjects").then(m => ({ default: m.StudyObjects })), { loading: () => null });
const ScrollReveal = nextDynamic(() => import("@/components/landing/ScrollReveal").then(m => ({ default: m.ScrollReveal })));

const siteUrl = getSiteUrl();

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

// The free prep offering described on this page: exam-style MCQ practice,
// mock tests, study notes, and analytics for MDCAT and medical entrance tests.
const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "MDCAT & NUMS Medical Entrance Test Preparation",
  description: SITE_DESCRIPTION,
  url: siteUrl,
  provider: {
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
  },
  learningResourceType: ["MCQ Practice", "Mock Test", "Study Notes"],
  educationalUse: "practice",
  isAccessibleForFree: true,
  inLanguage: ["en", "ur"],
  about: [
    "MDCAT",
    "NUMS",
    "UHS Medical Entrance",
    "SZABMU Test",
    "AKU Medical Test",
    "KMU CAT",
  ],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export const metadata: Metadata = {
  title: "MDCAT & NUMS Medical Entrance Test Preparation",
  description:
    "Structured preparation for MDCAT, NUMS, UHS, SZABMU, AKU, KMU and all medical university entry tests in Pakistan. Exam-style MCQ practice, study notes, and live analytics.",
};

// The landing page's numbers come from the live database
// (lib/public-stats.ts). ISR regenerates them at most every 60 s in the
// background, so a visitor's page is never more than a minute stale, never
// shows a fabricated or zero value, and renders near-instantly on every hit.
export const revalidate = 60;

export default async function Home() {
  const stats = await getPublicStats();
  const board = stats.board ?? { entries: [], stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 } };
  return (
    <div className="landing-canvas min-h-screen font-sans text-[var(--steel-100)] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
      />
      <ScrollEffects />
      <SmoothScroll />
      <ScrollReveal />
      <Navbar />
      <main>
        <Hero
          stats={{
            colleges: stats.hero.colleges,
            subjects: stats.hero.subjects,
            mcqs: stats.hero.mcqs,
            asOf: stats.hero.asOf,
          }}
        />

        <TrustStrip />

        {/* WhatsApp group banner */}
        <div className="py-4">
          <div className="container-page">
            <a
              href="https://chat.whatsapp.com/HYkBmANpvm1BD4awon23Rw"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-[var(--r-3)] border border-[var(--line-2)] bg-[var(--srf-1)] px-6 py-4 transition-colors duration-[var(--dur-1)] hover:border-[var(--line-3)] hover:bg-[var(--srf-2)] sm:flex-row sm:items-center"
            >
              {/* WhatsApp's own green, on both marks here, with dark ink on the
                  fill — white on this green measures 2:1. */}
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--whatsapp)] text-[var(--color-text-inverse)]"
              >
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-[var(--steel-100)] sm:text-base">
                  Preparing for MDCAT, NUMS & Medical Entrance Exams?
                </span>
                <span className="mt-0.5 block text-xs text-[var(--steel-300)] sm:text-sm">
                  Join our WhatsApp group for guidance, study material, daily quizzes, and discussion.
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--r-2)] bg-[var(--whatsapp)] px-4 py-2 text-sm font-semibold text-[var(--color-text-inverse)] transition-[filter] duration-[var(--dur-1)] group-hover:brightness-110">
                Join Group
              </span>
            </a>
          </div>
        </div>

        <section id="features">
          <Features />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="mcq-demo">
          <MCQDemoSection />
        </section>
        {stats.analytics && (
          <section id="analytics-preview">
            <AnalyticsPreview analytics={stats.analytics} />
          </section>
        )}
        {/* The flattest band on the page was carrying its heaviest message. The
            exam date now gets a band of its own, with a faint drift of what is
            actually on the paper behind it — comprehension, maths, chemistry,
            geometry, physics, IQ. Desktop only, and globals.css hides the whole
            layer outright under prefers-reduced-motion. */}
        <section id="exam-countdown" className="relative overflow-hidden py-14 sm:py-16">
          <StudyObjects />
          <div className="container-page relative z-10">
            <ExamCountdown />
          </div>
        </section>
        {board.entries.length > 0 && (
          <section id="leaderboard-preview">
            <LeaderboardPreview entries={board.entries} stats={board.stats} />
          </section>
        )}
        <section id="why-acma">
          <WhyACMA />
        </section>
        <section id="cadet-colleges">
          <CollegeCarousel />
        </section>
        <section id="faq">
          <FAQ />
        </section>
        <section id="register">
          <RegisterSection mcqs={stats.hero.mcqs} />
        </section>
        <section id="cta">
          <CTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}