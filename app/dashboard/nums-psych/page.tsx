'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NUMS_PSYCH_BANK } from '@/lib/nums-psych-bank';
import { ArrowLeft, CheckCircle2, Shield, Award } from 'lucide-react';

export default function NumsPsychPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = NUMS_PSYCH_BANK[currentIndex];

  const handleSelect = (optionId: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optionId });
  };

  const handleNext = () => {
    if (currentIndex < NUMS_PSYCH_BANK.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const totalScore = Object.entries(selectedAnswers).reduce((acc, [qId, optId]) => {
    const q = NUMS_PSYCH_BANK.find(item => item.id === qId);
    const opt = q?.options.find(o => o.id === optId);
    return acc + (opt?.score || 0);
  }, 0);

  const maxPossibleScore = NUMS_PSYCH_BANK.length * 5;
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-foreground min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">NUMS Paper-II Psychological & Aptitude Test</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exclusive situational judgment test for NUMS & Army Medical College (AMC) aspirants.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent">
          NUMS Exclusive
        </span>
      </div>

      {!showResults ? (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Scenario {currentIndex + 1} of {NUMS_PSYCH_BANK.length}</span>
            <span>Progress: {Math.round(((currentIndex + 1) / NUMS_PSYCH_BANK.length) * 100)}%</span>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {currentQ.scenario}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                      : 'border-border bg-background text-foreground hover:border-accent/50'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="mt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Select the most professional medical officer response.</span>
            <button
              disabled={!selectedAnswers[currentQ.id]}
              onClick={handleNext}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all ${
                selectedAnswers[currentQ.id]
                  ? 'bg-accent text-accent-foreground hover:opacity-90'
                  : 'bg-secondary text-secondary-foreground opacity-50 cursor-not-allowed'
              }`}
            >
              {currentIndex === NUMS_PSYCH_BANK.length - 1 ? 'Complete Assessment →' : 'Next Scenario →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">Psychological Assessment Complete</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your officer profile score for NUMS & AMC Selection Board:
            </p>
          </div>

          <div className="text-5xl font-black text-accent my-4">
            {percentage}%
          </div>

          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {percentage >= 80 
              ? 'Outstanding emotional maturity and clinical decision-making. You exhibit elite officer-like qualities required for NUMS and Army Medical College.'
              : 'Good baseline awareness. Review the rationale for each scenario to refine your professional medical response under pressure.'}
          </p>

          <div className="pt-6 border-t border-border flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswers({});
                setShowResults(false);
              }}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted"
            >
              Retake Assessment
            </button>
            <Link
              href="/portal/mdcat"
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider shadow"
            >
              Return to Medical Portal →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
