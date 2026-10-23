"use client";

import { TrackedLink } from "@/components/TrackedLink";
import { useState, useMemo } from "react";
import { ArrowRight, Timer } from "lucide-react";
import { PracticeSetup } from "./PracticeSetup";
import { TopicDrill } from "./TopicDrill";
import { CollegeSelector } from "./CollegeSelector";
import { UsatPaperPanel } from "./UsatPaperPanel";
import { UsatTopicDrill } from "./UsatTopicDrill";
import { getSubjectsForCollege, isUsatTarget } from "@/lib/subjects";

export function PracticeClient({
  allSubjects,
  countsBySubject,
  totalCount,
  initialCollege,
  bankCountsBySubject,
  bankTopicsBySubject,
  usatCountsBySubject,
  usatDrill,
}: {
  allSubjects: string[]
  countsBySubject: Record<string, number>
  totalCount: number
  initialCollege: string | null
  bankCountsBySubject: Record<string, number>
  bankTopicsBySubject: Record<string, Record<string, number>>
  usatCountsBySubject: Record<string, number>
  usatDrill: Record<string, { name: string; count: number; topics: string[] }[]>
}) {
  const [selectedCollege, setSelectedCollege] = useState(initialCollege)

  // The medical portal serves MDCAT-family boards (MDCAT/NUMS/UHS/SZABMU/ETEA)
  // AND the HEC USAT-M paper — different papers, different banks. Every line
  // below is derived from the choice so the two never blur together (a USAT
  // student signing in was previously handed the 888-question MDCAT bank
  // without any USAT option at all).
  const isUsat = isUsatTarget(selectedCollege)

  const activeBankCounts = isUsat ? usatCountsBySubject : bankCountsBySubject

  // ?college=… keeps the selected exam when the session route hands the
  // student back to this page (Exit / done).
  const collegeQuery = selectedCollege
    ? `college=${encodeURIComponent(selectedCollege.toLowerCase())}`
    : ""

  // One builder so the full run and any later links carry exactly the same
  // params as the session route expects (?bank=usat only when it is a USAT run).
  const sessionQuery = isUsat
    ? ['bank=usat', collegeQuery].filter(Boolean).join('&')
    : collegeQuery
  const sessionBase = `/practice/session${sessionQuery ? `?${sessionQuery}` : ""}`

  const filteredSubjects = useMemo(
    () => getSubjectsForCollege(selectedCollege, allSubjects),
    [selectedCollege, allSubjects]
  )

  const bankTotal = Object.values(activeBankCounts).reduce((a, b) => a + b, 0)

  const runTitle = isUsat ? "HEC USAT-M Paper Run" : "Full Entry-Test Run"
  const runDescription = isUsat
    ? "Every question in the USAT bank — verbal, quantitative and the science sections — one after another."
    : "Exam-style questions across every subject, one after another — closest to the real paper."

  return (
    <div className="space-y-10">
      <CollegeSelector selectedCollege={selectedCollege} onSelect={setSelectedCollege} />

      {/* One list of subjects — each subject appears exactly once on this page.
          The full run is the curated exam-style paper for the selected test;
          for the MDCAT boards every subject card below drills the full
          published bank with a topic chooser, filtered to the same board. */}
      <section>
        <h2 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-3">
          Entry-Test Practice
        </h2>

        <TrackedLink
          to={sessionBase}
          className="group glass-tile-glow border border-[var(--color-primary)]/25 rounded-[var(--radius-lg)] p-6 flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-gradient-to-br from-[var(--color-primary)]/[0.08] to-transparent"
         label="practice-full-run">
          <span
            aria-hidden="true"
            className="icon-tile w-12 h-12 rounded-[var(--radius-md)] text-2xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/25 flex items-center justify-center shrink-0"
          >
            <Timer className="w-5 h-5 text-[var(--color-primary-light)]" />
          </span>
          <span className="flex-1">
            <span className="block font-bold text-[var(--color-text-primary)] text-lg">
              {runTitle}
            </span>
            <span className="block text-sm text-[var(--color-text-muted)] mt-1">
              {runDescription}
            </span>
          </span>
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
            {bankTotal} Qs
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
            Start
            <ArrowRight className="w-4 h-4 transition-transform duration-[var(--transition-fast)] group-hover:translate-x-1" />
          </span>
        </TrackedLink>

        {isUsat ? (
          <UsatPaperPanel countsBySubject={usatCountsBySubject} collegeQuery={collegeQuery} />
        ) : (
          <PracticeSetup
            subjects={filteredSubjects}
            countsBySubject={countsBySubject}
            totalCount={totalCount}
            collegeName={selectedCollege || undefined}
          />
        )}
      </section>

      {/* Chapter-wise drill. The boards use the PMDC topic taxonomy; the USAT
          paper rotates fine categories instead, so it drills by chapter-style
          category families derived from the bank's own topic strings. */}
      {isUsat ? (
        <UsatTopicDrill drill={usatDrill} collegeQuery={collegeQuery} />
      ) : (
        <TopicDrill
          subjects={filteredSubjects}
          bankTopicsBySubject={bankTopicsBySubject}
          bankCountsBySubject={bankCountsBySubject}
        />
      )}
    </div>
  )
}
