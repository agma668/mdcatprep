'use client';

import { useState, useEffect, useRef } from 'react';
import { USAT_ELITE_BANK } from '@/lib/usat-comprehensive-bank';
import Link from 'next/link';

export default function USATPracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
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

  // Timer state
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    setTimeRemaining(20);
    setTimerRunning(true);
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setQuestionSkipped(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.key]: option }));
    stopTimer();
    setQuestionSkipped(false);
  };

  const nextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswers({});
      setShowResults(false);
      setTimerRunning(false);
      setTimeRemaining(20);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedAnswers({});
      setShowResults(false);
      setTimerRunning(false);
      setTimeRemaining(20);
    }
  };

  // Auto-advance when timer runs out (no answer selected)
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswered && !questionSkipped) {
      nextQuestion();
    }
  }, [timeRemaining, isAnswered, questionSkipped, currentIdx]);

  const subjects = ['All', 'Quantitative', 'Verbal', 'Biology', 'Chemistry', 'Physics'];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      <div>
        {/* Navbar */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/portal/usat" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← USAT-M Portal
              </Link>
              <span className="text-border">/</span>
              <span className="font-extrabold text-sm text-foreground">Elite Practice & Drills</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-bold">
              USAT-M Master Bank
            </span>
          </div>
        </header>

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
        {examStarted && timerRunning && (
          <div className="mb-6 text-center">
            <div className="text-3xl font-bold text-purple-400">{timeRemaining}</div>
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
                  onClick={() => { setSelectedSubject(sub); setCurrentIdx(0); setExamStarted(false); setSelectedAnswers({}); setQuestionSkipped(false); stopTimer(); }}
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
                  if (timerRunning && timeRemaining <= 5) {
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

              {/* Timer Visual (overlay during active questions) */}
              {examStarted && timerRunning && !isAnswered && !questionSkipped && (
                <div className="absolute top-0 left-0 right-0 h-full bg-purple-500/10">
                  <div className="h-full bg-purple-500" style={{width: `${(timeRemaining / 20) * 100}%`}} />
                </div>
              )}

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
                  {examStarted && timerRunning ? `${timeRemaining}s remaining` : `Question ${currentIdx + 1} of ${filteredQuestions.length}`}
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
          <p>© {new Date().getFullYear()} Apex Pakistan — HEC USAT-M Elite Prep Engine.</p>
        </footer>
      </div>
    </div>
  );
}