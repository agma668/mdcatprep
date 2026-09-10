import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { Calendar, ArrowRight } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Blog — MDCAT & NUMS Preparation Tips & Guides",
  description:
    "Expert MDCAT and NUMS preparation guides for students in Pakistan: exam patterns, syllabus breakdowns, subject-wise strategy and the latest official dates.",
  keywords: [
    "MDCAT blog",
    "MDCAT preparation tips",
    "NUMS entry test guide",
    "MDCAT 2026 guide",
    "MDCAT biology preparation",
    "MDCAT chemistry preparation",
    "MDCAT study plan",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog — MDCAT & NUMS Preparation Tips | MED Prep",
    description:
      "Expert tips, preparation guides and the latest information for MDCAT and NUMS in Pakistan.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MED Prep Blog — MDCAT & NUMS Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | MED Prep",
    description: "Expert MDCAT and NUMS preparation guides.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/blog" },
};

const ARTICLES = [
  {
    slug: "mdcat-guide",
    title: "MDCAT 2026 Complete Guide — Pattern, Syllabus & Study Plan",
    description:
      "Everything about MDCAT 2026: the official PMDC marks distribution (Biology 68, Chemistry 56, Physics 56, English 20), the syllabus units that matter, and a week-by-week study plan.",
    date: "September 2026",
    readTime: "8 min read",
    tag: "MDCAT",
  },
  {
    slug: "nums-guide",
    title: "NUMS Entry Test 2026 Guide — Date, Colleges & How to Prepare",
    description:
      "NUMS runs its own entrance test for Army Medical College and its network. The 2026 date, which colleges accept it, and how to prepare for both NUMS and PMDC MDCAT at once.",
    date: "September 2026",
    readTime: "7 min read",
    tag: "NUMS",
  },
  {
    slug: "mdcat-biology-guide",
    title: "How to Prepare MDCAT Biology — The 68-Mark Subject",
    description:
      "Biology is the biggest section of MDCAT. Which PMDC syllabus units carry the most weight, the facts that repeat every year, and how to revise them.",
    date: "September 2026",
    readTime: "6 min read",
    tag: "Biology",
  },
  {
    slug: "mdcat-chemistry-guide",
    title: "How to Prepare MDCAT Chemistry — Physical, Organic & Inorganic",
    description:
      "A chemistry plan that matches the PMDC syllabus: what to master in physical, organic and inorganic chemistry, and which numerical types actually appear.",
    date: "September 2026",
    readTime: "6 min read",
    tag: "Chemistry",
  },
  {
    slug: "mdcat-physics-guide",
    title: "How to Prepare MDCAT Physics — Numericals Without Panic",
    description:
      "MDCAT Physics rewards concept over calculation. The formula families to memorize, how to practice numericals fast, and the topics students skip at their peril.",
    date: "September 2026",
    readTime: "6 min read",
    tag: "Physics",
  },
  {
    slug: "mdcat-english-guide",
    title: "MDCAT English: The 20 Marks Everyone Wastes",
    description:
      "Only 20 marks, but they decide merit lists. Grammar rules, vocabulary strategy and comprehension technique for the MDCAT English section.",
    date: "September 2026",
    readTime: "5 min read",
    tag: "English",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-field font-sans text-white antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container-page relative z-10">
            <Badge variant="accent" className="mb-4">MED Prep Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              MDCAT &amp; NUMS <span className="text-[var(--color-accent-light)]">Guides</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Preparation tips, syllabus breakdowns and strategies for the MDCAT and NUMS entrance tests in Pakistan.
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
