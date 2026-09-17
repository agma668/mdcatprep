'use client'

import { TrackedLink } from '@/components/TrackedLink';
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Target, Trophy, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuizOptions } from '@/components/ui/QuizOptions'
import { type BankQuestion } from '@/lib/questions'
import { recordAnswer } from '@/lib/offline-sync'
import { useQuizSession } from '@/lib/quiz-session'

type AnswerRecord = {
  question: BankQuestion
  selected: string
  correct: string
  timeSpentSeconds: number
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m + ':' + s.toString().padStart(2, '0')
}

function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  isTimed,
}: {
  remainingSeconds: number
  totalSeconds: number
  isTimed: boolean
}) {
  if (!isTimed) return null

  const pct = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0
  const isLow = remainingSeconds <= 60
  const isCritical = remainingSeconds <= 30

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-bold tabular-nums transition-colors duration-300',
          isCritical
            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
            : isLow
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
              : 'bg-white/[0.06] text-white border border-white/10',
        ].join(' ')}
      >
        {isCritical ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        <span>{formatTime(remainingSeconds)}</span>
      </div>
      <div className="hidden sm:block w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={[
            'h-full rounded-full transition-all duration-1000 ease-linear',
            isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500/15' : 'bg-[var(--color-primary)]',
          ].join(' ')}
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}

export function McqPlayer({
  questions,
  timeLimitMinutes = 0,
}: {
  questions: BankQuestion[]
  timeLimitMinutes?: number
}) {
  const isTimed = timeLimitMinutes > 0
  const totalSeconds = timeLimitMinutes * 60
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const questionStartTime = useRef(0)
  const sessionStartRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Stamp question start lazily on the first interaction path rather than at
  // render, so no impure call happens while React is rendering.
  const stampQuestionStart = () => {
    const now = Date.now()
    if (sessionStartRef.current === 0) sessionStartRef.current = now
    questionStartTime.current = now
  }

  const [review, setReview] = useState<AnswerRecord[]>([])
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0)

  // Run state (index, pick, reveal, score, nav guard) lives in the shared
  // useQuizSession hook in "submit" mode. This surface keeps its optional
  // countdown timer, the per-question timing stamps, and the wrong-answers
  // review list; it does not bind keyboard shortcuts (unchanged behaviour).
  const session = useQuizSession({
    questions,
    mode: 'submit',
    bindKeys: false,
    onReveal: (i, letter) => {
      const q = questions[i]
      // Stamp lazily like before: the first question's start is its submit
      // moment (≈0s, floored to 1s); later questions start at `advance()`.
      if (questionStartTime.current === 0) stampQuestionStart()
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime.current) / 1000))
      setReview(prev => [...prev, { question: q, selected: letter, correct: q.correct_answer, timeSpentSeconds: timeSpent }])
      // Queue-aware seam: records online, queues on a network failure so a
      // flickering connection never silently eats a scored answer.
      void recordAnswer(q.id, letter, timeSpent)
    },
    onFinish: () => {
      setTotalElapsedSeconds(
        Math.max(1, Math.round((Date.now() - (sessionStartRef.current || Date.now())) / 1000))
      )
    },
  })
  const { index, current: q, answers, score, finished, revealed, pick, reveal, next, statusFor, finish } = session

  useEffect(() => {
    if (!isTimed || finished) return

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => finish(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isTimed, finished, finish])

  // Advancing shows the next question — stamp its start time right there.
  const advance = () => {
    next()
    questionStartTime.current = Date.now()
  }

  // Empty-draw guard. An empty draw makes `current` undefined, so the live
  // branch below dereferences `q.subject` and throws; the finished branch
  // divides by questions.length and renders "NaN%". Reachable here through a
  // filter combination the bank has nothing for, or a failed fetch that falls
  // back to []. Fail closed and point back at the picker. Must sit after every
  // hook so hook order never changes between renders.
  if (!questions || questions.length === 0) {
    return (
      <div>
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            No questions match this practice set
          </h1>
          <p className="text-sm text-[var(--steel-400)] max-w-sm mx-auto">
            Nothing came back for these filters. Widen the subject or topic and
            start again.
          </p>
          <TrackedLink
            to="/dashboard/practice"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)] transition-colors"
           label="mcq-player">
            Change filters
          </TrackedLink>
        </div>
      </div>
    )
  }

  if (finished) {
    const accuracy = Math.round((score / questions.length) * 100)
    const wrongAnswers = review.filter(a => a.selected !== a.correct)
    const ResultIcon = accuracy >= 80 ? Trophy : accuracy >= 50 ? Target : BookOpen
    // Time-expiry finishes that raced the finish handler fall back to the
    // nominal duration; either way this is only ever displayed.
    const totalTimeSeconds = totalElapsedSeconds || totalSeconds
    const avgTimePerQ = review.length > 0
      ? Math.round(review.reduce((s, a) => s + a.timeSpentSeconds, 0) / review.length)
      : 0

    return (
      <div>
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-10 text-center">
          <ResultIcon
            className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
            Session Complete
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            You scored {score} out of {questions.length} ({accuracy}% accuracy)
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(totalTimeSeconds)} total
            </span>
            <span>·</span>
            <span>{avgTimePerQ}s avg per question</span>
            {isTimed && (
              <>
                <span>·</span>
                <span className={remainingSeconds <= 0 ? 'text-rose-400 font-semibold' : ''}>
                  {remainingSeconds <= 0 ? 'Time expired' : formatTime(remainingSeconds) + ' left'}
                </span>
              </>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <TrackedLink to="/dashboard/practice" label="mcq-player">
              <Button variant="outline">Practice Again</Button>
            </TrackedLink>
            <TrackedLink to="/dashboard/analytics" label="mcq-player">
              <Button variant="ghost">View Analytics</Button>
            </TrackedLink>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
              Review your mistakes ({wrongAnswers.length})
            </h2>
            <div className="flex flex-col gap-4">
              {wrongAnswers.map((a, i) => (
                <div
                  key={a.question.id}
                  className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {[a.question.subject, a.question.topic].filter(Boolean).join(' · ')}
                    </p>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {a.timeSpentSeconds}s
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 leading-relaxed">
                    {i + 1}. {a.question.question_text}
                  </h3>
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="text-rose-400">Your answer: {a.selected}</p>
                    <p className="text-emerald-400 font-medium">Correct answer: {a.correct}</p>
                  </div>
                  {a.question.explanation && (
                    <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed border-t border-[var(--color-border)] pt-3">
                      {a.question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const answered = answers[index] !== undefined
  const isCorrect = answered && answers[index] === q.correct_answer

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
            Question {index + 1} of {questions.length}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {[q.subject, q.topic, q.difficulty].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <TimerDisplay
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            isTimed={isTimed}
          />
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            Score: {score}
          </span>
        </div>
      </div>

      <div className="h-1.5 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-300"
          style={{ width: ((index + (revealed ? 1 : 0)) / questions.length * 100) + '%' }}
        />
      </div>

      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5 leading-relaxed">
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
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300',
            ].join(' ')}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? 'Correct!' : 'Not quite — the correct answer is ' + q.correct_answer + '.'}
            </p>
            {q.explanation && <p className="leading-relaxed">{q.explanation}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="primary" disabled={!session.selected || answered} onClick={reveal}>
            Submit Answer
          </Button>
          {answered && (
            <Button variant="outline" onClick={advance}>
              {index + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}