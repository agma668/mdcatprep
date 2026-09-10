import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSiteUrl } from "@/lib/site";
import { ExternalLink, BookOpen, FileText, Globe } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Free MDCAT Study Resources — Notes, Past Papers & Official Links",
  description:
    "Free MDCAT and NUMS preparation resources for students in Pakistan: master notes in Biology and Chemistry, official PMDC/NUMS/UHS/SZABMU links, and exam-style MCQs.",
  keywords: [
    "MDCAT free notes",
    "MDCAT past papers",
    "MDCAT MCQs online free",
    "NUMS entry test preparation",
    "PMDC MDCAT syllabus",
    "MDCAT study material free",
    "MDCAT biology notes",
    "MDCAT chemistry notes",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/resources`,
    title: "Free MDCAT Study Resources | MED Prep",
    description:
      "Free notes, past papers and official links for MDCAT and NUMS preparation in Pakistan.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Free MDCAT Study Resources — MED Prep" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free MDCAT Study Resources | MED Prep",
    description: "Free notes and MCQs for MDCAT and NUMS preparation.",
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

/** Official sources — always the first place to check for dates, syllabus and registration. */
const OFFICIAL_RESOURCES: Resource[] = [
  {
    title: "PMDC — Pakistan Medical & Dental Council",
    url: "https://pmdc.pk/",
    description:
      "The regulator that runs MDCAT. Official MDCAT curriculum, syllabus updates and exam announcements are published here first.",
    type: "website",
  },
  {
    title: "NUMS — National University of Medical Sciences",
    url: "https://numspak.edu.pk/",
    description:
      "Runs its own MDCAT for NUMS-affiliated colleges. Registration, test schedule and official updates live on numspak.edu.pk.",
    type: "website",
  },
  {
    title: "UHS — University of Health Sciences, Lahore",
    url: "https://www.uhs.edu.pk/",
    description:
      "The public-sector medical university for Punjab. Check admission schedules and official announcements for UHS-affiliated colleges.",
    type: "website",
  },
  {
    title: "SZABMU — Shaheed Zulfiqar Ali Bhutto Medical University",
    url: "http://www.szabmu.edu.pk/",
    description:
      "Federal medical university in Islamabad (PIMS). Publishes its own entry-test news, admissions and results.",
    type: "website",
  },
];

/** Our own study material — free, no signup walls. */
const OWN_RESOURCES: Resource[] = [
  {
    title: "Biology Master Notes (PDF)",
    url: "/notes/Biology_Master_Notes.pdf",
    description:
      "Complete, easy-language Biology master notes covering the PMDC MDCAT syllabus unit by unit. Read online or download.",
    type: "notes",
  },
  {
    title: "Chemistry Master Notes (PDF)",
    url: "/notes/Chemistry_Master_Notes.pdf",
    description:
      "Complete Chemistry master notes built from the PMDC MDCAT syllabus — every chapter, explained simply.",
    type: "notes",
  },
  {
    title: "MDCAT Master Concept Notes (in-app)",
    url: "/dashboard/notes/mdcat-master-notes",
    description:
      "Biology, Chemistry, Physics and English notes inside the platform, with an exam-style practice session one click away. Free account needed.",
    type: "notes",
  },
  {
    title: "Spaced-Repetition Flashcards (no signup)",
    url: "/flashcards",
    description:
      "Ready-made decks across all four subjects with an Anki-style scheduler — rate Again/Hard/Good/Easy and weak cards return sooner. Study instantly, no account needed.",
    type: "notes",
  },
  {
    title: "Interactive Diagrams & Mindmaps (in-app)",
    url: "/dashboard/diagrams",
    description:
      "Tap-to-label diagrams (heart, nephron, digestive system, skeleton) plus collapsible chapter mindmaps — active recall instead of static posters. Free account needed.",
    type: "notes",
  },
  {
    title: "Exam-Style MCQ Practice",
    url: "/signup",
    description:
      "Biology, Chemistry, Physics and English MCQs with instant explanations, streaks and progress tracking — all free.",
    type: "mcqs",
  },
];

/** How to prepare — practical guidance on the platform. */
const PREP_GUIDES: Resource[] = [
  {
    title: "FAQ: MDCAT & NUMS Questions Answered",
    url: "/faq",
    description:
      "Marks distribution (68/56/56/20), minimum pass marks, eligibility and the current exam dates — all in one place.",
    type: "papers",
  },
  {
    title: "Mock Tests",
    url: "/signup",
    description:
      "Full-length timed mocks that mirror the real MDCAT section pattern, with analytics on what to fix before exam day.",
    type: "mcqs",
  },
  {
    title: "Referral Leaderboard",
    url: "/signup",
    description:
      "Invite friends, climb the leaderboard and unlock the full Master PDFs section. Free students grow the platform for everyone.",
    type: "website",
  },
];

const TYPE_CONFIG = {
  notes: { icon: BookOpen, label: "Notes", color: "text-blue-400 bg-blue-500/10" },
  mcqs: { icon: FileText, label: "MCQs", color: "text-emerald-400 bg-emerald-500/10" },
  papers: { icon: FileText, label: "Guide", color: "text-amber-400 bg-amber-500/10" },
  website: { icon: Globe, label: "Official", color: "text-purple-400 bg-purple-500/10" },
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
              Free MDCAT <span className="text-[var(--color-accent-light)]">Study Resources</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Notes, official links and practice material for MDCAT and NUMS aspirants — organized so you always know what to check first.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container-page space-y-16">
            {/* Official sources */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Official Sources</h2>
              <p className="text-sm text-white/60 mb-6">
                For exam dates, registration and the official curriculum, always trust these first. Everything else (academies, guides, YouTube) comes after.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OFFICIAL_RESOURCES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* Our own material */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Our Free Study Material</h2>
              <p className="text-sm text-white/60 mb-6">
                Built from the PMDC MDCAT syllabus and real past-paper patterns. Free, forever.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OWN_RESOURCES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* Prep guides */}
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Prepare Smarter</h2>
              <p className="text-sm text-white/60 mb-6">Everything else you need to plan your prep on the platform.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREP_GUIDES.map((r) => <ResourceCard key={r.url} resource={r} />)}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white/[0.06] border border-white/15 rounded-[var(--radius-xl)] p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-3">Want More Organized Practice?</h2>
              <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                MED Prep has exam-style MCQs across Biology, Chemistry, Physics and English — with instant explanations, streaks and progress tracking. 100% free.
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
