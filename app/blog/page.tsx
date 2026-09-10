import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, ArrowRight } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Blog — Cadet College Entry Test Tips & Guides",
  description:
    "Expert tips, preparation guides and latest information for CCH, PAF Sargodha, MCJ and other cadet college entry tests in Pakistan.",
  keywords: [
    "cadet college blog",
    "CCH preparation tips",
    "cadet college entry test guide",
    "PAF Sargodha preparation tips",
    "military college admission guide",
    "cadet college exam tips Pakistan",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog — Cadet College Entry Test Tips & Guides | Cadet College Prep",
    description:
      "Expert tips, preparation guides and latest information for cadet college entry tests in Pakistan.",
    siteName: "Cadet College Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Cadet College Prep Blog — Cadet College Prep Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Cadet College Prep",
    description: "Expert tips and guides for cadet college entry tests.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: "/blog",
  },
};

const ARTICLES = [
  {
    slug: "kohat-preparation-guide",
    title: "Kohat Cadet College Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "The complete Cadet College Kohat entry test guide: the 200-mark, 4-section pattern, what each section covers, and a subject-wise preparation plan.",
    date: "September 2026",
    readTime: "7 min read",
    tag: "Kohat",
  },
  {
    slug: "mcj-preparation-guide",
    title: "MCJ Jhelum Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "The complete Military College Jhelum entry test guide: the 200-mark pattern, what each section covers, and how to prepare.",
    date: "September 2026",
    readTime: "7 min read",
    tag: "MCJ",
  },
  {
    slug: "cch-preparation-guide",
    title: "How to Prepare for CCH Hasanabdal Entry Test 2026 — Complete Guide",
    description:
      "A step-by-step guide to preparing for the Cadet College Hasanabdal entry test. Covers syllabus, subjects, study plan and exam-day tips.",
    date: "August 2026",
    readTime: "8 min read",
    tag: "CCH",
  },
  {
    slug: "cadet-vs-military-college",
    title: "Cadet College vs Military College — Which One Should You Choose?",
    description:
      "Understand the key differences between cadet colleges and military colleges in Pakistan. Admission process, fees, career paths and more.",
    date: "August 2026",
    readTime: "6 min read",
    tag: "Guide",
  },
  {
    slug: "paf-sargodha-preparation-tips",
    title: "PAF College Sargodha Entry Test Guide — Pattern, Syllabus & Preparation",
    description:
      "The complete PAF College Sargodha entry test guide: the 200-mark, 4-section pattern, the Analytical Reasoning section, and how to prepare for each part.",
    date: "September 2026",
    readTime: "8 min read",
    tag: "PAF Sargodha",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-field font-sans text-white antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container-page relative z-10">
            <Badge variant="accent" className="mb-4">Cadet College Prep Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Tips & <span className="text-[var(--color-accent-light)]">Guides</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Expert preparation tips, syllabus breakdowns and strategies for cadet and military college entry tests in Pakistan.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ARTICLES.map(({ slug, title, description, date, readTime, tag }) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group bg-white/[0.06] border border-white/10 rounded-[var(--radius-xl)] p-6 flex flex-col hover:bg-white/[0.09] hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="glass">{tag}</Badge>
                    <span className="flex items-center gap-1 text-xs text-[var(--steel-400)]">
                      <Calendar className="w-3 h-3" />
                      {date}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--color-accent-light)] transition-colors leading-snug">
                    {title}
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed flex-1 mb-4">
                    {description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-[var(--steel-400)]">{readTime}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent-light)] group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
