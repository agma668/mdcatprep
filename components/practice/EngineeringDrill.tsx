'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NUSTQuestion } from '@/lib/nust-questions';
import { TestPrepChooser } from '@/components/dashboard/TestPrepChooser';
import { Navbar } from '@/components/landing/Navbar';
import { SITE_NAME } from '@/lib/site';

/**
 * The engineering drill, shared by /nust/practice, /giki/practice and
 * /lums/practice.
 *
 * It used to be the body of /nust/practice with one heading calling itself
 * "NUST NET / GIKI / LUMS Interactive Drill" — one page for three tests that do
 * not share a paper. The split made the subjects a prop, because the official
 * patterns differ: NUST NET-Engineering is Mathematics 50% / Physics 30% /
 * English 20% with no chemistry section (lib/nust-mock.ts records the same
 * finding), and GIKI's published syllabus is Mathematics, Physics and English.
 * The bank still holds chemistry items written for other tracks; they are
 * filtered out here rather than shown as if they were on the paper.
 *
 * `subjects` is the exact set of bank subjects this test's paper covers. There
 * is deliberately no "Chemistry" option on either page: showing one would
 * imply a section neither institution publishes.
 */
export function EngineeringDrill({
  bank,
  subjects,
  testLabel,
  breadcrumb,
  signupExam,
  footerLabel,
  children,
}: {
  bank: readonly NUSTQuestion[];
  /** Exact bank subject names this test's paper contains. */
  subjects: readonly string[];
  /** Badge in the sub-bar, e.g. "NUST NET bank". */
  testLabel: string;
  breadcrumb: { href: string; label: string };
  /** Exam key used by the signup link, e.g. "nust". */
  signupExam: string;
  /** Footer sentence after the site name. */
  footerLabel: string;
  /** Verified-pattern section rendered above the drill. */
  children?: React.ReactNode;
}) {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  const allowed = bank.filter((q) => subjects.includes(q.subject));
  const filteredQuestions = selectedSubject === 'All'
    ? allowed
    : allowed.filter((q) => q.subject === selectedSubject);

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];
  const userChoice = currentQ ? selectedAnswers[currentQ.key] : undefined;

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.key]: option }));
  };

  const tabs = ['All', ...subjects];

  return (
    <div className="min-h-screen bg-[var(--field-1)] text-[var(--steel-100)] flex flex-col justify-between font-sans">
      <div>
        <Navbar />
        <div className="pt-16 md:pt-18 border-b border-[var(--line-2)] bg-[var(--srf-1)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Link href={breadcrumb.href} className="shrink-0 text-[var(--steel-400)] transition-colors hover:text-[var(--steel-100)]">
                ← {breadcrumb.label}
              </Link>
              <span className="text-[var(--line-2)]" aria-hidden="true">/</span>
              <span className="truncate font-extrabold text-[var(--steel-100)]">Practice</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TestPrepChooser family="engineering" />
              <span className="shrink-0 rounded-full bg-[var(--tint-signal)] px-3 py-1 text-xs font-bold text-[var(--signal-300)]">
                {testLabel}
              </span>
              <Link
                href={`/signup?exam=${signupExam}`}
                className="shrink-0 text-xs font-semibold text-[var(--steel-400)] underline underline-offset-4 transition-colors hover:text-[var(--steel-100)]"
              >
                Save progress
              </Link>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-4xl px-4 py-10 pb-28 sm:pb-10">
          {children}

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Start drilling</h2>
              <p className="text-sm text-[var(--steel-400)] mt-1">
                {allowed.length} questions in this bank for these subjects. Every answer shows the reasoning after you commit to one.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-[var(--srf-3)] p-1.5 rounded-xl border border-[var(--line-2)]">
              {tabs.map((sub) => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setCurrentIdx(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSubject === sub
                      ? 'bg-[var(--signal-500)] text-[var(--field-1)] shadow'
                      : 'text-[var(--steel-400)] hover:text-[var(--steel-100)]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {!currentQ ? (
            <div className="bg-[var(--srf-1)] border border-[var(--line-2)] rounded-2xl p-12 text-center">
              <p className="text-[var(--steel-400)]">No questions found for this category.</p>
            </div>
          ) : (
            <div className="bg-[var(--srf-1)] border border-[var(--line-2)] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between text-xs text-[var(--steel-400)] border-b border-[var(--line-2)] pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[var(--srf-3)] text-[var(--steel-300)] font-bold">
                    {currentQ.subject}
                  </span>
                  <span>• Topic: {currentQ.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-medium uppercase text-[10px] ${
                    currentQ.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400' :
                    currentQ.difficulty === 'medium' ? 'bg-[var(--signal-500)]/10 text-[var(--signal-300)]' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {currentQ.difficulty}
                  </span>
                  <span>Question {currentIdx + 1} of {filteredQuestions.length}</span>
                </div>
              </div>

              <div className="text-base md:text-lg font-semibold text-[var(--steel-100)] leading-relaxed">
                {currentQ.question_text}
              </div>

              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = currentQ[`option_${optKey.toLowerCase() as 'a' | 'b' | 'c' | 'd'}`];
                  const isSelected = userChoice === optKey;
                  const isCorrect = userChoice !== undefined && currentQ.correct_answer === optKey;

                  let btnStyle = 'border-[var(--line-2)] bg-[var(--srf-1)] hover:bg-[var(--srf-2)] text-[var(--steel-100)]';
                  if (userChoice) {
                    if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                    else if (isSelected && !isCorrect) btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-accent bg-[var(--tint-signal)] text-[var(--signal-300)] font-semibold';
                  }

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${btnStyle}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line-2)] bg-[var(--srf-3)] text-xs font-bold text-[var(--steel-100)]">
                        {optKey}
                      </span>
                      <span className="text-sm md:text-base">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {userChoice && (
                <div className={`p-5 rounded-xl border mt-6 space-y-2 animate-fadeIn ${
                  userChoice === currentQ.correct_answer
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/5 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {userChoice === currentQ.correct_answer ? (
                      <span className="text-emerald-400">✓ Correct.</span>
                    ) : (
                      <span className="text-rose-400">✕ Incorrect. The correct answer is ({currentQ.correct_answer}).</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-[var(--steel-400)] leading-relaxed pt-1">
                    <strong className="text-[var(--steel-100)]">Why:</strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--line-2)]">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-[var(--srf-3)] text-[var(--steel-300)] text-xs font-semibold disabled:opacity-40 hover:bg-[var(--srf-2)] transition-colors"
                >
                  ← Previous
                </button>

                <div className="text-xs text-[var(--steel-400)]">
                  Source: {currentQ.source}
                </div>

                <button
                  disabled={currentIdx === filteredQuestions.length - 1}
                  onClick={() => setCurrentIdx((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-[var(--signal-500)] text-[var(--field-1)] text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  Next Question →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-[var(--line-2)] py-8 text-center text-xs text-[var(--steel-400)]">
        <p>© {new Date().getFullYear()} {SITE_NAME} — {footerLabel}</p>
      </footer>
    </div>
  );
}
