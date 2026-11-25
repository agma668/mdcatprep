'use client';

import { useState, useEffect, useCallback } from 'react';
import { USAT_ELITE_BANK } from '@/lib/usat-comprehensive-bank';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { SITE_NAME } from '@/lib/site';

export default function USATPracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [questionSkipped, setQuestionSkipped] = useState(false);

  const filteredQuestions = selectedSubject === 'All'
    ? USAT_ELITE_BANK
    : USAT_ELITE_BANK.filter(q => q.subject === selectedSubject);

  const totalQuestions = filteredQuestions.length;
  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];
  const userChoice = selectedAnswers[currentQ.key];
  const isAnswered = userChoice !== undefined;
  const isCorrect = isAnswered && currentQ.correct_answer === userChoice;
  // The clock is derived, never mirrored into state: it runs while a timed question is unanswered.
  const showClock = examStarted && !isAnswered;

  // One effect owns the countdown. It restarts on every question change and stops the moment the
  // question is answered or time runs out, because its guard reads derived state rather than setting
  // any. Before this, startTimer() existed but was never called: "Start Timed Practice" set a flag
  // and no clock ever ran, so the timer and the auto-skip it advertises were dead controls.
  useEffect(() => {
    if (!examStarted || isAnswered || questionSkipped) return;
    const id = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          window.clearInterval(id);
          setQuestionSkipped(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [examStarted, isAnswered, questionSkipped, currentIdx]);

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.key]: option }));
    setQuestionSkipped(false);
  };

  const nextQuestion = useCallback(() => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswers({});
      setQuestionSkipped(false);
      setTimeRemaining(20);
    }
  }, [currentIdx, totalQuestions]);

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedAnswers({});
      setQuestionSkipped(false);
      setTimeRemaining(20);
    }
  };

  // Auto-advance when timer runs out (no answer selected)
  useEffect(() => {
    if (timeRemaining !== 0 || isAnswered || questionSkipped) return;
    const id = window.setTimeout(nextQuestion, 0);
    return () => window.clearTimeout(id);
  }, [timeRemaining, isAnswered, questionSkipped, nextQuestion]);

  const subjects = ['All', 'Quantitative', 'Verbal', 'Biology', 'Chemistry', 'Physics'];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      <div>
        {/* Shared site nav — same fix as the NUST and PMA drills, which had cloned this header. */}
        <Navbar />
        <div className="pt-16 md:pt-18 border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Link href="/portal/usat" className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                ← USAT-M Portal
              </Link>
              <span className="text-border" aria-hidden="true">/</span>
              <span className="truncate font-extrabold text-foreground">USAT-M Practice</span>
            </div>
            <span className="shrink-0 self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent sm:self-auto">
              USAT-M bank
            </span>
          </div>
        </div>

        {/* Timer & Progress Bar */}
        {!examStarted && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setExamStarted(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 text-purple-100 font-semibold text-sm hover:bg-purple-500 transition-colors"
            >
              Start Timed Practice
            </button>
          </div>
        )}

        {/* Timer Display */}
        {showClock && (
          <div className="mb-6 text-center">
            <div className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-rose-400' : 'text-purple-400'}`}>{timeRemaining}</div>
            <div className="mt-2 text-sm text-purple-300">Seconds per question — auto-skips if unanswered</div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">HEC USAT-M Interactive Drill</h1>
              <p className="text-sm text-muted-foreground mt-1">Rigorous questions with trap distractors and step-by-step pedagogical rationales.</p>
            </div>

            {/* Subject Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-secondary/50 p-1.5 rounded-xl border border-border">
              {subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setCurrentIdx(0); setExamStarted(false); setSelectedAnswers({}); setQuestionSkipped(false); setTimeRemaining(20); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSubject === sub
                      ? 'bg-accent text-accent-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">No questions found for this category.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-bold">
                    {currentQ.subject}
                  </span>
                  <span>• Topic: {currentQ.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-medium uppercase text-[10px] ${
                    currentQ.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400' :
                    currentQ.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {currentQ.difficulty}
                  </span>
                  <span>Question {currentIdx + 1} of {filteredQuestions.length}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
                {currentQ.question_text}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                  const optText = currentQ[`option_${optKey.toLowerCase() as 'a'|'b'|'c'|'d'}`];
                  const isSelected = userChoice === optKey;
                  const isCorrect = isAnswered && currentQ.correct_answer === optKey;

                  let btnStyle = 'border-border bg-card/80 hover:bg-muted/50 text-foreground';
                  if (showClock && timeRemaining <= 5) {
                    btnStyle = 'border-purple-500 bg-purple-500/20 text-purple-300 font-semibold';
                  }
                  if (userChoice) {
                    if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                    else if (isSelected && !isCorrect) btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-accent bg-accent/10 text-accent font-semibold';
                  }

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${btnStyle}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-xs font-bold text-foreground">
                        {optKey}
                      </span>
                      <span className="text-sm md:text-base">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {userChoice && (
                <div className={`p-5 rounded-xl border mt-6 space-y-2 animate-fadeIn ${
                  isCorrect
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/5 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCorrect ? (
                      <span className="text-emerald-400">✓ Correct! Excellent grasp of the concept.</span>
                    ) : (
                      <span className="text-rose-400">✕ Incorrect. The correct answer is ({currentQ.correct_answer}).</span>
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
                  disabled={currentIdx === 0 || !examStarted}
                  onClick={() => prevQuestion()}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  ← Previous
                </button>

                <div className="text-xs text-muted-foreground">
                  {showClock ? `${timeRemaining}s remaining` : `Question ${currentIdx + 1} of ${filteredQuestions.length}`}
                </div>

                <button
                  disabled={currentIdx >= filteredQuestions.length - 1 || !examStarted}
                  onClick={() => nextQuestion()}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-purple-100 font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {currentIdx >= filteredQuestions.length - 1 ? 'Review →' : 'Next Question →'}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME} — HEC USAT-M practice.</p>
        </footer>
      </div>
    </div>
  );
}