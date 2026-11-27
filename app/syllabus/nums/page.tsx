import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { formatReviewedOn } from "@/lib/dated-claims";
import { getSiteUrl } from "@/lib/site";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";

/**
 * The NUMS MDCAT syllabus page.
 *
 * Every number below is transcribed from NUMS's own MDCAT-2026 documents, all
 * three held in the repo at data/papers/nums/:
 *   • 2026-syllabus.pdf — the Table of Specifications: Paper-I 150 MCQs in 2h45,
 *     Paper-II 50 MCQs in 15 min, Biology 37% (55), Chemistry 26.5% (40),
 *     Physics 26.5% (40), English 10% (15), psychological test listed at 5%,
 *     difficulty 20/60/20, recall/application 70/30.
 *   • 2026-advertisement.pdf — "There shall be no negative marking", and the
 *     150 + 50 structure with the 2h45 + 15 min timings.
 *   • 2026-admission-notice.pdf — 55% pass for MBBS, 50% for BDS, and the
 *     13 September 2026 sitting.
 *
 * What this page deliberately does NOT contain: a topic-by-topic weightage, a
 * merit formula, or a claim about what the psychological test asks. NUMS
 * publishes none of those: the TOS lists content areas and learning objectives
 * with no per-topic marks, leaves the psychological-test page blank, and its
 * weightage table labels a 50-question paper as 5% while counting it inside 200
 * questions — an inconsistency the page states rather than resolves by guessing.
 */

const siteUrl = getSiteUrl();
const CHECKED_ON = "2026-11-28";

const TOS_URL =
  "https://numspak.edu.pk/upload/media/2026-NUMS-Updated-MDCAT-TOS-2026_1779075557.pdf";
const AD_URL =
  "https://numspak.edu.pk/upload/media/2026-Advertisement-for-NUMS-MDCAT-2026_1779075470.pdf";
const ADMISSION_URL =
  "https://numspak.edu.pk/upload/media/2026-Ad-for-Centralized-Admission-MBBSBDS-Session-2026-27-2026-10-12_1791782114.pdf";

const PAPERS = [
  {
    name: "Biology",
    mcqs: 55,
    pct: 37,
    covers:
      "13 content areas: biodiversity, bioenergetics, biological molecules, cell structure and function, coordination and control, diversity among animals, enzymes, evolution, life processes in animals and plants, prokaryotes, reproduction, support and movement, variation and genetics.",
  },
  {
    name: "Chemistry",
    mcqs: 40,
    pct: 26.5,
    covers:
      "19 content areas, from fundamental concepts, atomic structure and bonding through gases, liquids, solids, equilibrium, kinetics, thermochemistry, electrochemistry, s- and p-block elements, and the organic sequence to macromolecules.",
  },
  {
    name: "Physics",
    mcqs: 40,
    pct: 26.5,
    covers:
      "13 content areas: force and motion, work and energy, rotational and circular motion, waves, thermodynamics, electrostatics, current electricity, electromagnetism, electromagnetic induction, electronics, modern physics, atomic spectra and nuclear physics.",
  },
  {
    name: "English",
    mcqs: 15,
    pct: 10,
    covers:
      "Six benchmarks: vocabulary in context, tenses and sentence structure, correct versus incorrect grammar and writing conventions, subject–verb agreement with articles and prepositions, error identification, and short-passage comprehension.",
  },
] as const;

export const metadata: Metadata = {
  title: "NUMS MDCAT Syllabus 2026 — Official Pattern, Weightage & Pass Marks",
  description:
    "NUMS's own MDCAT-2026 syllabus: 150 MCQs in 2h45 plus a 50-question psychological test in 15 minutes, Biology 37%, Chemistry 26.5%, Physics 26.5%, English 10%, no negative marking, 55% MBBS and 50% BDS pass marks.",
  keywords: [
    "NUMS MDCAT syllabus 2026",
    "NUMS syllabus 2026 pdf",
    "NUMS MDCAT pattern",
    "NUMS weightage",
    "NUMS psychological test",
    "NUMS passing marks",
  ],
  alternates: { canonical: "/syllabus/nums" },
  openGraph: {
    type: "article",
    url: `${siteUrl}/syllabus/nums`,
    title: "NUMS MDCAT Syllabus 2026 — Official Pattern, Weightage & Pass Marks",
    description:
      "The NUMS MDCAT-2026 pattern as NUMS publishes it: 200 MCQs across two papers, subject weightage, difficulty split, and the rules that affect your score.",
  },
};

export default function NumsSyllabusPage() {
  const totalMcqs = PAPERS.reduce((n, p) => n + p.mcqs, 0);
  const totalPct = PAPERS.reduce((n, p) => n + p.pct, 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Official syllabus · transcribed from NUMS&apos;s MDCAT-2026 TOS
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            NUMS MDCAT syllabus and paper pattern
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            NUMS runs its own test, separately from the PM&amp;DC national MDCAT, with its own
            syllabus and its own weightings. It is two papers on one day: a 150-question subject
            paper and a 50-question psychological test. This page transcribes the 2026 Table of
            Specifications and says where the document is silent.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "Questions", v: "200" },
              { k: "Time", v: "180 min" },
              { k: "Negative marking", v: "None" },
              { k: "Pass marks", v: "55% / 50%" },
            ].map((item) => (
              <div key={item.k} className="rounded-2xl border border-border bg-card p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.k}
                </dt>
                <dd className="mt-1 text-2xl font-extrabold tabular-nums">{item.v}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-bold">Subject weightage</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Paper-I is 150 MCQs in 2 hours 45 minutes. Biology alone is more than a third of it, so
              a weak Biology area costs more than a weak English one.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Section
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      MCQs
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PAPERS.map((p) => (
                    <tr key={p.name} className="border-t border-border align-top">
                      <th scope="row" className="px-4 py-3 font-semibold">
                        {p.name}
                        <p className="mt-1 max-w-md text-xs font-normal leading-relaxed text-muted-foreground">
                          {p.covers}
                        </p>
                      </th>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{p.mcqs}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {p.pct}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-card/60">
                    <th scope="row" className="px-4 py-3 font-extrabold">
                      Paper-I total
                    </th>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">
                      {totalMcqs}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">
                      {totalPct}%
                    </td>
                  </tr>
                  <tr className="border-t border-border align-top">
                    <th scope="row" className="px-4 py-3 font-semibold">
                      Psychological test (Paper-II)
                      <p className="mt-1 max-w-md text-xs font-normal leading-relaxed text-muted-foreground">
                        50 one-best-answer MCQs in 15 minutes. NUMS&apos;s table prints this as 5%,
                        but 50 questions is 25% of the 200-question total — see the note below.
                      </p>
                    </th>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">50</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">5%*</td>
                  </tr>
                  <tr className="border-t border-border bg-card/60">
                    <th scope="row" className="px-4 py-3 font-extrabold">
                      Both papers
                    </th>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">200</td>
                    <td className="px-4 py-3 text-right font-extrabold tabular-nums">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              *The TOS table gives Paper-II a 5% weightage while also counting its 50 questions
              inside a 200-question total, and then prints &ldquo;Total 100 200&rdquo;. Those three
              things cannot all be true in the same scheme, and the document does not explain how the
              psychological test enters merit. We print the 5% because NUMS prints it — not as a
              claim about how your final merit is calculated.
            </p>
          </section>

          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-bold">Difficulty split</h2>
              <ul className="mt-3 space-y-3">
                {[
                  { label: "Easy", pct: 20 },
                  { label: "Moderate", pct: 60 },
                  { label: "Hard", pct: 20 },
                ].map((d) => (
                  <li key={d.label}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold">{d.label}</span>
                      <span className="font-bold tabular-nums">{d.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${d.pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                In Biology, Chemistry and Physics, NUMS separately states that 70% of questions are
                recall and 30% application level. That is a different split from the easy/moderate/hard
                one — both are in the document, and neither is a per-chapter number.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Rules that affect your score
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">No negative marking.</strong> Stated in the
                  2026 admission advertisement: never leave a question blank.
                </li>
                <li>
                  <strong className="text-foreground">55% to pass for MBBS, 50% for BDS.</strong>{" "}
                  From NUMS&apos;s centralised-admission notice for 2026-27. A pass is an eligibility
                  gate, not a seat.
                </li>
                <li>
                  <strong className="text-foreground">
                    The psychological test is a real paper, not a formality.
                  </strong>{" "}
                  50 MCQs in 15 minutes — 18 seconds a question. It sits in the same sitting as
                  Paper-I.
                </li>
                <li>
                  <strong className="text-foreground">Logical reasoning is not NUMS content.</strong>{" "}
                  The TOS carries a logical-reasoning section labelled &ldquo;for National MDCAT
                  only&rdquo;, and it is absent from the NUMS weightage table. Do not study it for
                  NUMS on the strength of that section.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Which syllabus applies right now</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is the <strong className="text-foreground">NUMS MDCAT-2026 syllabus</strong>, the
              Table of Specifications for the sitting held on 13 September 2026 — NUMS postponed it
              from 23 August and said so in a public notice. NUMS has published no 2027 syllabus; when
              it does, this page is out of date until it is rewritten. The official PDF linked below
              is always the authority.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Beware last year&apos;s numbers.</strong> The 2025
              NUMS TOS gave Biology 65, Chemistry 40, Physics 30 and English 15, with a 15/70/15
              difficulty split. The 2026 document changes the Biology and Physics counts and moves to
              20/60/20. A page or PDF quoting 65 Biology MCQs is describing 2025, not this paper.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <a
                href={TOS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
              >
                Official 2026 TOS (NUMS) <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <a
                href={AD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
              >
                Admission advertisement <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <a
                href={ADMISSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
              >
                Pass marks notice <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-muted-foreground">
                Transcribed and last checked {formatReviewedOn(CHECKED_ON)}.
              </span>
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-dashed border-border p-5 sm:p-6">
            <h2 className="text-base font-bold">What this page does not claim</h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">No topic-level weightage.</strong> NUMS lists
                content areas and learning objectives for Biology, Chemistry, Physics and English; it
                publishes no marks per chapter. Any &ldquo;8 MCQs from this chapter&rdquo; figure is
                someone&apos;s inference from past papers, not the syllabus.
              </li>
              <li>
                <strong className="text-foreground">No psychological-test blueprint.</strong> Section
                5 of the TOS is a blank page reference. NUMS states the length and timing and nothing
                about the constructs, so we cannot tell you what it asks beyond that.
              </li>
              <li>
                <strong className="text-foreground">No merit formula.</strong> Neither the TOS nor the
                advertisement gives the weight of NUMS MDCAT against FSc marks in the final merit list.
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The site holds the source PDFs in <code>data/papers/nums/</code> so these numbers can be
              re-checked against the document rather than against another website.
            </p>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/topicals"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Practice</div>
              <div className="mt-1 font-bold">Chapter-wise drills</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Biology, Chemistry and Physics questions with explanations on.
              </p>
            </Link>
            <Link
              href="/past-papers/nums-mdcat"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Papers</div>
              <div className="mt-1 font-bold">NUMS sittings</div>
              <p className="mt-1 text-xs text-muted-foreground">
                What NUMS has released, and the answer keys that exist.
              </p>
            </Link>
            <Link
              href="/dashboard/nums-psych"
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Paper-II</div>
              <div className="mt-1 font-bold">Psychological practice</div>
              <p className="mt-1 text-xs text-muted-foreground">
                A short simulator paced like the 15-minute section. Needs a free account to open.
              </p>
            </Link>
          </section>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            Sitting the national test too? Read the{" "}
            <Link href="/syllabus/mdcat" className="font-semibold text-accent underline underline-offset-4">
              PM&amp;DC MDCAT syllabus
            </Link>{" "}
            — it is a different paper with different weightings, and NUMS does not follow it.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
