import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { ExternalLink, BookOpen, FileText, Globe } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Free Study Resources — Notes & Exam-Style MCQs for Cadet College Prep",
  description:
    "Organized collection of free study materials, practice MCQs and notes for CCH, PAF Sargodha, MCJ and other cadet college entry tests in Pakistan.",
  keywords: [
    "cadet college free notes",
    "CCH exam-style MCQs free",
    "cadet college MCQs online free",
    "cadet college preparation notes PDF",
    "PAF Sargodha free MCQs",
    "cadet college exam-style MCQs",
    "cadet college study material free",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/resources`,
    title: "Free Study Resources for Cadet College Prep | Cadet College Prep",
    description: "Free notes, MCQs and study materials for cadet college entry tests.",
    siteName: "Cadet Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Free Study Resources — Cadet College Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study Resources | Cadet College Prep",
    description: "Free notes and MCQs for cadet college preparation.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/resources" },
};

interface Resource {
  title: string;
  url: string;
  description: string;
  type: "notes" | "mcqs" | "papers" | "website";
}

const SHARED_RESOURCES: Resource[] = [
  { title: "Cadet College Model Papers — Free PDFs", url: "https://cadetguide.pk/pages/model-papers.php", description: "Comprehensive model papers and practice tests for Class 8th and 11th cadet college admissions. All free to download.", type: "papers" },
  { title: "PakShaheens — Complete Test Prep", url: "https://www.pakshaheens.com/cadet-colleges/", description: "Free MCQs, notes, quizzes and video lectures for all subjects. Covers Math, English, Science, IQ and more.", type: "website" },
  { title: "Shaheen Academy — Free Online Tests", url: "https://www.shaheenleaderacademy.com/online-tests/", description: "Free online MCQ tests for PAF, Army, Navy and cadet college entry exams. Includes English, Math and IQ sections.", type: "mcqs" },
  { title: "Cadet College Sample Tests (CCRWP)", url: "https://ccrwp.edu.pk/sample-test-for-admissions/", description: "Official sample tests for Class 7th, 8th, 9th and 11th cadet college admissions. Direct PDF downloads.", type: "papers" },
  { title: "Cadet College Entry Test Guide — Scribd", url: "https://www.scribd.com/document/307523448/Cadet-college-entry-test-preparation-sample-papers-questions", description: "Free download: sample papers and preparation questions for cadet college entry tests.", type: "papers" },
];

const CCH_RESOURCES: Resource[] = [
  { title: "CCH Official Syllabus", url: "https://cch.edu.pk/syllabus-for-entrance-exam/", description: "Official syllabus from Cadet College Hasanabdal website. Check for the latest admission requirements.", type: "notes" },
  { title: "CCH Sample Paper — StuDocu", url: "https://www.studocu.com/row/document/super-nova-school/physics/cch-sample-paper/106688468", description: "CCH entry test sample paper for Class 8 with Physics, Math and Science questions. Highly rated (311 reviews).", type: "papers" },
  { title: "CCH Entry Test Guide — Scribd", url: "https://www.scribd.com/document/937200840/Cadet-College-Hasan-Abdal-Sample-Test-Paper", description: "Sample entry test covering Mathematics, General Science, English, Islamiat and Urdu sections.", type: "papers" },
  { title: "CCH Topic-Wise Syllabus (Cadet College Prep)", url: "/colleges/cch/syllabus", description: "Our own complete topic-wise breakdown of the CCH syllabus with every topic listed.", type: "notes" },
];

const PAF_RESOURCES: Resource[] = [
  { title: "PAF Sargodha MCQs & Entry Test Guide", url: "https://tutorials.pakshaheens.com/paf-college-sargodha/", description: "Free PDF practice MCQs for the PAF College Sargodha initial academic test. Direct download.", type: "papers" },
  { title: "PAF Sargodha Complete Guide", url: "https://www.pakshaheens.com/sargodha-cadet-college/", description: "Free notes, MCQs, e-books and video lectures for PAF Sargodha preparation.", type: "website" },
  { title: "PAF IQ Test — 500+ MCQs", url: "https://www.mcquniverse.pk/pakistan-airforce-initial-iq-test/", description: "500+ verbal and non-verbal IQ test MCQs. PAF Sargodha tests analytical reasoning heavily.", type: "mcqs" },
];

const SHARED_SUBJECT: Resource[] = [
  { title: "English Grammar MCQs — 1000+ Questions", url: "https://www.shaheenleaderacademy.com/lat-english-mcqs/", description: "Synonyms, antonyms, prepositions, sentence correction. All common cadet college English topics.", type: "mcqs" },
  { title: "English MCQs with Answers — SlideShare", url: "https://www.slideshare.net/slideshow/english-1000-most-repeated-mcqs-by-testpointpk-pdf/257279038", description: "1000 most repeated English MCQs for entry tests. Prepositions, tenses, vocabulary.", type: "mcqs" },
  { title: "Math MCQs — Cadet College Entry Test", url: "https://www.scribd.com/document/434287144/Cadet-Colleges-Math-Online-Entry-Test-2-Preparation-Model-Sample-Papers-MCQs", description: "Math practice MCQs covering arithmetic, algebra, geometry. Free PDF download.", type: "mcqs" },
  { title: "Cadet College Math Practice — PakShaheens", url: "https://www.pakshaheens.com/cadet-colleges/", description: "Online math quiz with 8th class level MCQs. Instant scoring and explanations.", type: "mcqs" },
];

const TYPE_CONFIG = {
  notes: { icon: BookOpen, label: "Notes", color: "text-blue-400 bg-blue-500/10" },
  mcqs: { icon: FileText, label: "MCQs", color: "text-emerald-400 bg-emerald-500/10" },
  papers: { icon: FileText, label: "Exam Papers", color: "text-amber-400 bg-amber-500/10" },
  website: { icon: Globe, label: "Website", color: "text-purple-400 bg-purple-500/10" },
};

function ResourceCard({ resource }: { resource: Resource }) {
  const config = TYPE_CONFIG[resource.type];
  const Icon = config.icon;
  const isExternal = resource.url.startsWith("http");

  return (
    <a
      href={resource.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block bg-white/[0.06] border border-white/10 rounded-[var(--radius-lg)] p-5 hover:bg-white/[0.09] hover:border-white/15 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 flex items-center justify-center rounded-md ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{config.label}</span>
        </div>
        {isExternal && <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 shrink-0 mt-0.5" />}
      </div>
      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[var(--color-accent-light)] transition-colors leading-snug">
        {resource.title}
      </h3>
      <p className="text-xs text-white/60 leading-relaxed">{resource.description}</p>
    </a>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container-page relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Free Study <span className="text-[var(--color-accent-light)]">Resources</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Curated collection of free notes, MCQs and study materials organized by college and subject.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container-page space-y-16">
            {/* Shared Resources */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Resources for All Colleges</h2>
              <p className="text-sm text-white/60 mb-6">Useful for every cadet college aspirant regardless of target college.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHARED_RESOURCES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* Subject-Specific */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Subject-Wise Practice</h2>
              <p className="text-sm text-white/60 mb-6">Math, English and other subjects common across all colleges.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHARED_SUBJECT.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* CCH Specific */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">CCH Hasanabdal</h2>
              <p className="text-sm text-white/60 mb-6">Resources specifically for Cadet College Hasanabdal entry test.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CCH_RESOURCES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* PAF Specific */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">PAF College Sargodha</h2>
              <p className="text-sm text-white/60 mb-6">Resources specifically for PAF College Sargodha entry test.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAF_RESOURCES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-3">Want More Organized Practice?</h2>
              <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                Cadet College Prep has 500+ MCQs organized by subject, topic and college — with instant explanations and progress tracking.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-accent-light)] transition-colors">
                  Sign Up Free
                </Link>
                <Link href="/daily-quiz" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white/10 ring-1 ring-white/25 text-white font-bold hover:bg-white/20 transition-colors">
                  Try Daily Quiz
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
