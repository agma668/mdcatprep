'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { PMA_QUESTIONS, pmaOptionFigure } from '@/lib/pma-questions';
import { PmaFigure } from '@/components/pma/PmaFigure';
import { TestPrepChooser } from '@/components/dashboard/TestPrepChooser';
import { usePrepChoice } from '@/lib/prep-choice';
import { getPrepTest } from '@/lib/prep-tests';

const CATEGORIES = ['All', 'Verbal', 'Non-Verbal', 'Academic'] as const;
type Category = (typeof CATEGORIES)[number];
type OptionKey = 'A' | 'B' | 'C' | 'D';

export default function PMAPracticePage() {
  const [selectedCat, setSelectedCat] = useState<Category>('All');

  // The portal's "Preparing for" choice also shapes this page: ISSB screens
  // on the intelligence sections only, so its Academic tab disappears and the
  // pool narrows to exactly what that screening actually tests. Observed
  // through the store hook — no state mirroring.
  const storedChoice = usePrepChoice('military');
  const prepTest = getPrepTest('military', storedChoice);
  const activeCats = prepTest
    ? CATEGORIES.filter((c) => c === 'All' || prepTest.subjects.includes(c))
    : [...CATEGORIES];
  // When the choice retires the tab a student was on (e.g. ISSB drops
  // Academic), fall back to the All paper purely by derivation — no reset
  // effect, the pool below simply recomputes.
  const activeCat: Category = activeCats.includes(selectedCat) ? selectedCat : 'All';
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [revealed, setRevealed] = useState<Record<string, true>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const timerRef = useRef<number | null>(null);

  // When a test is chosen, "All" means all of THAT test's sections — not the
  // full bank: an ISSB student's All-pool must not hand out Academic questions
  // their screening never asks.
  const pool =
    activeCat === 'All'
      ? prepTest
        ? PMA_QUESTIONS.filter((q) => activeCats.includes(q.category))
        : PMA_QUESTIONS
      : PMA_QUESTIONS.filter((q) => q.category === activeCat);
  const total = pool.length;
  const currentQ = pool[currentIdx] ?? pool[0];
  const userChoice = answers[currentQ.key];
  const isAnswered = userChoice !== undefined;
  const isRevealed = revealed[currentQ.key] === true;
  const showExplanation = isAnswered || isRevealed;
  const isCorrect = isAnswered && currentQ.correct_answer === userChoice;

  const answeredCount = pool.filter((q) => answers[q.key] !== undefined).length;
  const correctCount = pool.filter((q) => answers[q.key] === q.correct_answer).length;

  const optionFigures = currentQ.figure ? pmaOptionFigure(currentQ.figure) : null;

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  }

  // The clock is armed only by event handlers (start/select/navigate), so the
  // closure captures the on-screen question at arm time and is always fresh
  // when it expires. Expiry reveals the rationale; the student then reads it
  // and advances at their own pace.
  function startTimer() {
    stopTimer();
    setTimeRemaining(20);
    setTimerRunning(true);
    let remaining = 20;
    const key = currentQ.key;
    const wasAnswered = answers[key] !== undefined;
    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimerRunning(false);
        if (!wasAnswered) {
          setRevealed((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
        }
      }
    }, 1000);
  }

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setCurrentIdx(clamped);
      const target = pool[clamped];
      const needsClock = examStarted && answers[target.key] === undefined && !revealed[target.key];
      if (needsClock) startTimer();
      else stopTimer();
      setTimeRemaining(20);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startTimer/stopTimer are stable timers around setState
    [total, examStarted, answers, revealed, selectedCat]
  );

  function handleSelect(option: OptionKey) {
    setAnswers((prev) => ({ ...prev, [currentQ.key]: option }));
    stopTimer();
  }

  function startExam() {
    setExamStarted(true);
    startTimer();
  }

  function resetForCategory(cat: Category) {
    stopTimer();
    setSelectedCat(cat);
    setCurrentIdx(0);
    setAnswers({});
    setRevealed({});
    setExamStarted(false);
    setTimeRemaining(20);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      <div>
        {/* Navbar */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/portal/pma" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                &larr; PMA Portal
              </Link>
              <span className="text-border">/</span>
              <span className="font-extrabold text-sm text-foreground">Intelligence Practice</span>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0 w-[calc(100%-4.5rem)] sm:w-auto">
                <TestPrepChooser family="military" />
              </div>
              <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold shrink-0">
                {prepTest?.label ?? 'PMA Long Course'}
              </span>
            </div>
          </div>
        </header>

        {/* Timer Display */}
        {examStarted && (
          <div className="mt-6 text-center">
            <div className={`text-3xl font-bold ${timeRemaining <= 5 && timerRunning ? 'text-rose-400' : 'text-amber-400'}`}>
              {timeRemaining}
            </div>
            <div className="mt-1 text-sm text-amber-300">Seconds per question &mdash; the rationale is revealed if time runs out</div>
            <div className="mx-auto mt-2 h-1 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${timeRemaining <= 5 ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${(timeRemaining / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {!examStarted && (
          <div className="mt-8 text-center">
            <button
              onClick={startExam}
              className="px-6 py-3 rounded-xl bg-amber-600 text-amber-100 font-semibold text-sm hover:bg-amber-500 transition-colors"
            >
              Start Timed Practice
            </button>
          </div>
        )}

        {/* Main Workspace */}
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">PMA Long Course &mdash; Intelligence Practice</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Verbal &amp; non-verbal intelligence with 20-second timed questions. Original sample questions written in the
                PMA initial-test style &mdash; not official PMA papers.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Score: {correctCount} correct &middot; {answeredCount}/{total} answered
              </p>
            </div>

            {/* Category Tabs — narrowed by the "Preparing for" choice (ISSB drops Academic) */}
            <div className="flex flex-wrap gap-1.5 bg-secondary/50 p-1.5 rounded-xl border border-border">
              {activeCats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => resetForCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCat === cat
                      ? 'bg-amber-600 text-amber-100 shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          {total === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">No questions found for this category.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-bold">
                    {currentQ.category}
                  </span>
                  <span>&bull; Topic: {currentQ.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-medium uppercase text-[10px] ${
                    currentQ.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400' :
                    currentQ.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {currentQ.difficulty}
                  </span>
                  <span>Question {currentIdx + 1} of {total}</span>
                </div>
              </div>

              {/* Question Figure (non-verbal) */}
              {currentQ.figure && (
                <div className="flex justify-center py-2">
                  <PmaFigure spec={currentQ.figure} label="Question figure" className="h-28 w-28 text-foreground" />
                </div>
              )}

              {/* Question Text */}
              <div className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
                {currentQ.question_text}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const isSelected = userChoice === letter;
                  const isAnswer = currentQ.correct_answer === letter;
                  const settled = isAnswered || isRevealed;

                  let btnStyle = 'border-border bg-card/80 hover:bg-muted/50 text-foreground';
                  if (timerRunning && timeRemaining <= 5) {
                    btnStyle = 'border-rose-500/60 bg-rose-500/10 text-rose-300 font-semibold';
                  }
                  if (settled) {
                    if (isAnswer) btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                    else if (isSelected) btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold';
                  }

                  const optText = currentQ[`option_${letter.toLowerCase() as 'a' | 'b' | 'c' | 'd'}`];

                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelect(letter)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${btnStyle}`}
                    >
                      {optionFigures ? (
                        <span className="flex flex-col items-center gap-1 w-full">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{letter}</span>
                          <PmaFigure spec={optionFigures[letter]} label={`Option ${letter} figure`} className="h-16 w-16 text-foreground" />
                        </span>
                      ) : (
                        <>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-xs font-bold text-foreground">
                            {letter}
                          </span>
                          <span className="text-sm md:text-base">{optText}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {showExplanation && (
                <div className={`p-5 rounded-xl border mt-6 space-y-2 animate-fadeIn ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/5 border-rose-500/30 text-rose-200'
                    : 'bg-amber-500/5 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isAnswered ? (
                      isCorrect ? (
                        <span className="text-emerald-400">&#10003; Correct! Excellent grasp of the concept.</span>
                      ) : (
                        <span className="text-rose-400">&#10007; Incorrect. The correct answer is ({currentQ.correct_answer}).</span>
                      )
                    ) : (
                      <span className="text-amber-400">&#9201; Time expired &mdash; the correct answer is ({currentQ.correct_answer}).</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pt-1">
                    <strong className="text-foreground">Pedagogical Rationale:</strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => goTo(currentIdx - 1)}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  &larr; Previous
                </button>

                <div className="text-xs text-muted-foreground">
                  {examStarted && timerRunning ? `${timeRemaining}s remaining` : `Question ${currentIdx + 1} of ${total}`}
                </div>

                <button
                  disabled={currentIdx >= total - 1}
                  onClick={() => goTo(currentIdx + 1)}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-amber-100 font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {currentIdx >= total - 1 ? 'Review &rarr;' : 'Next Question &rarr;'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Apex Pakistan &mdash; PMA Intelligence Prep Engine.</p>
      </footer>
    </div>
  );
}
