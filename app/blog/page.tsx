import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getSiteUrl } from "@/lib/site";
import { ArrowRight } from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  // Broad category in the title; the published library is named honestly in the
  // description rather than promising guides that do not exist.
  title: "Blog — Entry-Test Guides for MDCAT, NUMS & More",
  description:
    "Preparation guides for Pakistani entry tests: exam patterns, syllabus breakdowns and subject strategy. An MDCAT guide is published; the NUMS, NUST, USAT and PMA guides are being written.",
  keywords: [
    "MDCAT blog",
    "MDCAT preparation tips",
    "NUMS entry test guide",
    "MDCAT 2026 guide",
    "MDCAT biology preparation",
    "MDCAT chemistry preparation",
    "MDCAT study plan",
    "entry test preparation Pakistan",
    "NUST NET guide",
    "PMA Long Course guide",
  ],
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog — Entry-Test Guides | MED Prep",
    description:
      "Preparation guides for MDCAT, NUMS and the entry tests being added next.",
    siteName: "MED Prep",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MED Prep Blog — Entry-Test Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | MED Prep",
    description: "Preparation guides for MDCAT, NUMS and the entry tests being added next.",
    images: [`${siteUrl}/og.png`],
  },
  alternates: { canonical: "/blog" },
};

// Only slugs with a real page under app/blog/<slug>/ may be linked. The other cards were rendered as
// links to routes that do not exist, so five of the six posts on /blog were 404s — a dead end on the
// most crawlable content page of the site.
const LIVE_SLUGS = new Set(["mdcat-guide"]);

const ARTICLES = [
  {
    slug: "mdcat-guide",
    title: "MDCAT 2026 Complete Guide — Pattern, Syllabus & Study Plan",
    description:
      "Everything about MDCAT 2026: the PMDC pattern (180 MCQs in 3 hours, no negative marking), the syllabus units that matter, and a week-by-week study plan.",
    tag: "MDCAT",
  },
  {
    slug: "nums-guide",
    title: "NUMS Entry Test 2026 Guide — Date, Colleges & How to Prepare",
    description:
      "NUMS runs its own entrance test for Army Medical College and its network. The 2026 date, which colleges accept it, and how to prepare for both NUMS and PMDC MDCAT at once.",
    tag: "NUMS",
  },
  {
    slug: "mdcat-biology-guide",
    title: "How to Prepare MDCAT Biology — The 81-Mark Subject",
    description:
      "Biology is the biggest section of MDCAT. Which PMDC syllabus units carry the most weight, the facts that repeat every year, and how to revise them.",
    tag: "Biology",
  },
  {
    slug: "mdcat-chemistry-guide",
    title: "How to Prepare MDCAT Chemistry — Physical, Organic & Inorganic",
    description:
      "A chemistry plan that matches the PMDC syllabus: what to master in physical, organic and inorganic chemistry, and which numerical types actually appear.",
    tag: "Chemistry",
  },
  {
    slug: "mdcat-physics-guide",
    title: "How to Prepare MDCAT Physics — Numericals Without Panic",
    description:
      "MDCAT Physics rewards concept over calculation. The formula families to memorize, how to practice numericals fast, and the topics students skip at their peril.",
    tag: "Physics",
  },
  {
    slug: "mdcat-english-guide",
    title: "MDCAT English: The 20 Marks Everyone Wastes",
    description:
      "Only 20 marks, but they decide merit lists. Grammar rules, vocabulary strategy and comprehension technique for the MDCAT English section.",
    tag: "English",
  },
];

export default function BlogPage() {
  // Deliberately a dark canvas in both modes: the cards, dates and badges below
  // are built on hard-coded white-on-black values, and `bg-field` follows light
  // mode — which made every headline white on ivory.
  return (
    <div className="dark-surface min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container-page relative z-10">
            <Badge variant="accent" className="mb-4">MED Prep Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Entry-Test <span className="text-[var(--color-accent-light)]">Guides</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Exam patterns, syllabus breakdowns and subject strategy. One guide is published so
              far — the MDCAT one below. The NUMS, NUST, USAT and PMA guides are still being
              written, and nothing unpublished is linked or dated.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Only published guides render. Five cards reading "Not published yet"
                  above the one real guide made the blog read as abandoned; the
                  planned topics stay in ARTICLES so each has one place to land
                  when it ships. */}
              {ARTICLES.filter((article) => LIVE_SLUGS.has(article.slug)).map((article) => {
                const live = LIVE_SLUGS.has(article.slug);
                const card = (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="glass">{article.tag}</Badge>
                      {/* These cards used to print a date and a read time that
                          nobody had measured — invented facts on an unfinished
                          card. The single status label below replaces them. */}
                    </div>
                    <h2 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--color-accent-light)] transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-sm text-white/60 leading-relaxed flex-1 mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-[var(--steel-400)]">
                        {live ? "Written by us" : "Not written yet"}
                      </span>
                      {live ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent-light)] group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : (
                        // Honest state: planned, not published. Rendered as a plain card, so there is
                        // no href for a crawler to follow and nothing for a student to click into a 404.
                        <span className="text-xs font-semibold text-[var(--steel-400)]">Not published yet</span>
                      )}
                    </div>
                  </>
                );
                return live ? (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="group bg-white/[0.06] border border-white/10 rounded-[var(--radius-xl)] p-6 flex flex-col hover:bg-white/[0.09] hover:border-white/20 transition-all"
                  >
                    {card}
                  </Link>
                ) : (
                  <div
                    key={article.slug}
                    className="bg-white/[0.04] border border-dashed border-white/10 rounded-[var(--radius-xl)] p-6 flex flex-col"
                  >
                    {card}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
