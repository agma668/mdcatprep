import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { DailyQuizClient } from "./DailyQuizClient";
import { fetchPublishedQuestions } from "@/lib/questions-repo";
import { getSiteUrl } from "@/lib/site";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Daily MCQ Challenge — Free Cadet College Practice Question",
  description:
    "Solve today's free MCQ challenge! A new exam-style question every day for CCH, PAF Sargodha, MCJ and other cadet college entry tests. No login required.",
  keywords: [
    "daily MCQ challenge",
    "free daily quiz cadet college",
    "daily MCQ practice Pakistan",
    "cadet college question of the day",
    "free MCQ every day",
    "CCH daily practice",
    "PAF Sargodha daily quiz",
    "military college MCQ daily",
    "cadet college prep daily question",
    "free online quiz cadet college",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/daily-quiz`,
    title: "Daily MCQ Challenge — Free Cadet College Practice | Cadet College Prep",
    description:
      "Solve today's free MCQ challenge! A new exam-style question every day for cadet college entry tests.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Daily MCQ Challenge — Free Cadet College Practice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily MCQ Challenge | Cadet College Prep",
    description:
      "Solve today's free MCQ challenge! A new question every day for cadet college entry tests.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/daily-quiz",
  },
};

const dailyQuizJsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: "Daily MCQ Challenge — Cadet College Entry Test Practice",
  description:
    "A free daily multiple-choice question for cadet and military college entry test preparation. New question every day.",
  url: `${siteUrl}/daily-quiz`,
  isAccessibleForFree: true,
  inLanguage: "en",
  provider: {
    "@type": "EducationalOrganization",
    name: "Cadet Prep (Cadet College Prep)",
    url: siteUrl,
  },
};

export const dynamic = "force-dynamic";

async function getDailyQuestions() {
  try {
    const questions = await fetchPublishedQuestions(createServiceClient());
    if (questions.length === 0) return [];
    // Deterministic shuffle based on today's date so the same 5 show all day
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    const shuffled = [...questions].sort((a, b) => {
      const ha = ((hash + (a.id ?? "").charCodeAt(0)) | 0) % 1000;
      const hb = ((hash + (b.id ?? "").charCodeAt(0)) | 0) % 1000;
      return ha - hb;
    });
    return shuffled.slice(0, 5);
  } catch {
    // Missing env vars or an unreachable DB — render the empty state
    // instead of crashing a public page with a 500.
    return [];
  }
}

export default async function DailyQuizPage() {
  // A row without an id can't be recorded, so it is dropped rather than
  // rendered un-answerable.
  const questions = (await getDailyQuestions()).filter((q): q is typeof q & { id: string } => Boolean(q.id));
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dailyQuizJsonLd) }}
      />
      <Navbar />
      <DailyQuizClient questions={questions} />
      <Footer />
    </div>
  );
}
