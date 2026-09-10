"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";
import { PracticeSetup } from "./PracticeSetup";
import { CollegeSelector } from "./CollegeSelector";
import { getSubjectsForCollege } from "@/lib/subjects";

export function PracticeClient({
  allSubjects,
  countsBySubject,
  totalCount,
  initialCollege,
  bankCountsBySubject,
}: {
  allSubjects: string[]
  countsBySubject: Record<string, number>
  totalCount: number
  initialCollege: string | null
  bankCountsBySubject: Record<string, number>
}) {
  const [selectedCollege, setSelectedCollege] = useState(initialCollege)

  // ?college=… keeps the selected college when the session route hands the
  // student back to this page (Exit / done).
  const collegeQuery = selectedCollege
    ? `college=${encodeURIComponent(selectedCollege.toLowerCase())}`
    : ""

  const filteredSubjects = useMemo(
    () => getSubjectsForCollege(selectedCollege, allSubjects),
    [selectedCollege, allSubjects]
  )

  const bankTotal = Object.values(bankCountsBySubject).reduce((a, b) => a + b, 0)
  const fullRunHref = collegeQuery ? `/practice/session?${collegeQuery}` : "/practice/session"

  return (
    <div className="space-y-10">
      <CollegeSelector selectedCollege={selectedCollege} onSelect={setSelectedCollege} />

      {/* One list of subjects — each subject appears exactly once on this page.
          The Full Entry-Test Run is the curated exam-style paper for the
          selected college; every subject card below drills the full published
          bank with a topic chooser, filtered to the same college. */}
      <section>
        <h2 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-3">
          Entry-Test Practice
        </h2>

        <Link
          href={fullRunHref}
          className="group glass-tile-glow border border-[var(--color-primary)]/25 rounded-[var(--radius-lg)] p-6 flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-gradient-to-br from-[var(--color-primary)]/[0.08] to-transparent"
        >
          <span
            aria-hidden="true"
            className="icon-tile w-12 h-12 rounded-[var(--radius-md)] text-2xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/25 flex items-center justify-center shrink-0"
          >
            <Timer className="w-5 h-5 text-[var(--color-primary-light)]" />
          </span>
          <span className="flex-1">
            <span className="block font-bold text-[var(--color-text-primary)] text-lg">
              Full Entry-Test Run
            </span>
            <span className="block text-sm text-[var(--color-text-muted)] mt-1">
              Exam-style questions across every subject, one after another — closest to the real paper.
            </span>
          </span>
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
            {bankTotal} Qs
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
            Start
            <ArrowRight className="w-4 h-4 transition-transform duration-[var(--transition-fast)] group-hover:translate-x-1" />
          </span>
        </Link>

        <PracticeSetup
          subjects={filteredSubjects}
          countsBySubject={countsBySubject}
          totalCount={totalCount}
          collegeName={selectedCollege || undefined}
        />
      </section>
    </div>
  )
}
