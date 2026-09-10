'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle, GraduationCap, Target, Trophy, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuizOptions } from '@/components/ui/QuizOptions'
import { recordAnswer } from '@/lib/offline-sync'
import { useQuizSession } from '@/lib/quiz-session'
import type { BankQuestion } from '@/lib/questions'

type AnswerRecord = {
  question: BankQuestion
  selected: string
  correct: string
}

type SubjectResult = {
  subject: string
  total: number
  correct: number
}

// Subject-strength guidance: what a strong/weak result in each MDCAT subject
// means for the student (medical context, no college recommendations).

export function DiagnosticPlayer({ questions }: { questions: BankQuestion[] }) {
  // Run state (index, pick, reveal, score, nav guard) lives in the shared
  // useQuizSession hook in "submit" mode. This surface keeps its review list
  // and results rendering; it does not bind keyboard shortcuts (unchanged).
  const session = useQuizSession({
    questions,
    mode: 'submit',
    bindKeys: false,
    onReveal: (i, letter) => {
      const q = questions[i]
      setReview(prev => [...prev, { question: q, selected: letter, correct: q.correct_answer }])
      // Queue-aware seam: guests stay local; signed-in answers record online
      // or queue on a network failure instead of silently vanishing.
      void recordAnswer(q.id, letter)
    },
  })
  const { index, current: q, answers, score, finished, revealed, pick, reveal, next, statusFor } = session

  const [review, setReview] = useState<AnswerRecord[]>([])

  // Empty-draw guard. An empty draw makes `current` undefined, so the live
  // branch below dereferences `q.subject` and throws; the finished branch
  // divides by questions.length and renders "NaN%". Both are reachable — the
  // bank query can come back empty (filters, a cold cache, a failed fetch that
  // falls back to []). Fail closed with an honest exit instead. Must sit after
  // every hook so hook order never changes between renders.
  if (!questions || questions.length === 0) {
    return (
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="text-center py-16">
          <Target className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Diagnostic Quiz</h1>
          <p className="text-sm text-[var(--steel-400)] max-w-sm mx-auto">
            No questions came back for this diagnostic. Reload to try again, or
            practise with the daily quiz in the meantime.
          </p>
          <Link
            href="/daily-quiz"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)] transition-colors"
          >
            Go to daily quiz
          </Link>
        </div>
      </div>
    )
  }

  // Compute results when finished
  if (finished) {
    const accuracy = Math.round((score / questions.length) * 100)

    // Subject breakdown
    const subjectMap = new Map<string, { total: number; correct: number }>()
    for (const a of review) {
      const subj = a.question.subject || 'Other'
      if (!subjectMap.has(subj)) subjectMap.set(subj, { total: 0, correct: 0 })
      const s = subjectMap.get(subj)!
      s.total++
      if (a.selected === a.correct) s.correct++
    }

    const subjectResults: SubjectResult[] = [...subjectMap.entries()]
      .map(([subject, data]) => ({ subject, ...data }))
      .sort((a, b) => (b.correct / b.total) - (a.correct / a.total))

    const strongest = subjectResults.length > 0 ? subjectResults[0].subject : null
    const weakest = subjectResults.length > 1 ? subjectResults[subjectResults.length - 1].subject : null


    const ResultIcon = accuracy >= 80 ? Trophy : accuracy >= 50 ? Target : BookOpen

    return (
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Score card */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-8 text-center mb-8">
          <ResultIcon className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent-light)]" />
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Your Diagnostic Results
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl font-extrabold text-[var(--color-accent-light)]">
              {score}
            </span>
            <span className="text-2xl text-white/40 font-bold">/</span>
            <span className="text-2xl text-white/60 font-bold">{questions.length}</span>
          </div>
          <p className="text-white/70 text-lg">
            {accuracy >= 80
              ? 'Excellent! You have a strong foundation.'
              : accuracy >= 50
                ? 'Good start — there\'s room to improve.'
                : 'Keep practicing — you\'ll get there!'}
          </p>
        </div>

        {/* Subject breakdown */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Subject Breakdown</h2>
          <div className="space-y-3">
            {subjectResults.map(s => {
              const pct = Math.round((s.correct / s.total) * 100)
              const isStrong = s.subject === strongest && subjectResults.length > 1
              const isWeak = s.subject === weakest && subjectResults.length > 1
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/80 flex items-center gap-2">
                      {s.subject}
                      {isStrong && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/15 px-1.5 py-0.5 rounded">STRONGEST</span>}
                      {isWeak && <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded">WEAKEST</span>}
                    </span>
                    <span className="text-sm font-bold text-white/60">
                      {s.correct}/{s.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommendation */}
        {strongest && (
          <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-[var(--radius-xl)] p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="icon-tile w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] shrink-0">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white mb-1">
                  {strongest ? `Strongest subject: ${strongest}` : 'See how you compare'}
                </h3>
                <p className="text-sm text-white/70">
                  {`A strong ${strongest} result is a real advantage in the MDCAT merit calculation — keep it sharp.`}
                </p>
                {weakest && (
                  <p className="text-sm text-white/50 mt-1">
                    Focus area: {weakest} — spend your first practice sessions here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wrong answers review */}
        {review.filter(a => a.selected !== a.correct).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">
              Review Mistakes ({review.filter(a => a.selected !== a.correct).length})
            </h2>
            <div className="space-y-4">
              {review
                .filter(a => a.selected !== a.correct)
                .map((a, i) => (
                  <div
                    key={a.question.id}
                    className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-lg)] p-5"
                  >
                    <p className="text-xs text-white/40 mb-1">
                      {[a.question.subject, a.question.topic].filter(Boolean).join(' · ')}
                    </p>
                    <h3 className="font-semibold text-white mb-3 leading-relaxed">
                      {i + 1}. {a.question.question_text}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm">
                      <p className="text-red-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Your answer: {a.selected}
                      </p>
                      <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Correct: {a.correct}
                      </p>
                    </div>
                    {a.question.explanation && (
                      <p className="text-sm text-white/50 mt-3 leading-relaxed border-t border-white/10 pt-3">
                        {a.question.explanation}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Want to save your results and keep practicing?
          </h2>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
            Create a free account to track your progress, unlock analytics, and continue your preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="font-bold px-8">
                Create Free Account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const answered = answers[index] !== undefined
  const isCorrect = answered && answers[index] === q.correct_answer

  // Quiz UI
  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            Diagnostic Quiz — Question {index + 1} of {questions.length}
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            {[q.subject, q.topic].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className="text-sm font-semibold text-[var(--color-accent-light)]">
          Score: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-6">
        <h2 className="text-lg font-semibold text-white mb-5 leading-relaxed">
          {q.question_text}
        </h2>

        <QuizOptions
          question={q}
          reveal={revealed}
          onChoose={pick}
          disabled={answered}
          status={statusFor}
        />

        {answered && (
          <div
            className={[
              'mt-5 p-4 rounded-[var(--radius-md)] border text-sm',
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300',
            ].join(' ')}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? 'Correct!' : `Not quite — the answer is ${q.correct_answer}.`}
            </p>
            {q.explanation && <p className="leading-relaxed text-white/70">{q.explanation}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="primary"
            disabled={!session.selected || answered}
            onClick={reveal}
          >
            Submit Answer
          </Button>
          {answered && (
            <Button
              variant="secondary"
              onClick={next}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {index + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}