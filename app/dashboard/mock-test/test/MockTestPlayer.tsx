'use client'

import { TrackedLink } from '@/components/TrackedLink';
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuizKeyLegend } from '@/components/ui/QuizKeyLegend'
import { QuizOptions } from '@/components/ui/QuizOptions'
import { recordAnswer } from '@/lib/offline-sync'
import { recordAttemptByQuestionKey } from '@/app/actions/practice'
import { useQuizSession } from '@/lib/quiz-session'
import { ScoreRing, AnimatedNumber } from '@/components/ui/ScoreRing'
import type { QuizQuestion, OptionLetter } from '@/lib/questions'
import type { PmaFigure as PmaFigureSpec } from '@/lib/pma-questions'
import { PmaFigure } from '@/components/pma/PmaFigure'

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockTestPlayer({
  questions,
  durationMinutes,
  format,
  figureSpec,
}: {
  // QuizQuestion (not BankQuestion): the HEC USAT-M paper is assembled from
  // the bundled USAT bank, whose questions carry a `key` instead of a DB id.
  questions: QuizQuestion[]
  durationMinutes: number
  format: string
  figureSpec?: (q: QuizQuestion) => {
    stem: PmaFigureSpec
    options: Record<OptionLetter, PmaFigureSpec>
  } | null
}) {
  // All run state (index, picks, navigation guard, keyboard) lives in the
  // shared useQuizSession hook in "exam" mode — picking never reveals, the
  // verdict appears at submit. This component only owns the countdown timer
  // and the results/review rendering.
  // Esc is NOT handed to the shared hook (escHref null): an instant exit
  // would destroy the run without a word. This component intercepts Esc and
  // stray internal navs itself and routes them through an end-test confirm
  // that records the run before leaving.
  const session = useQuizSession({
    questions,
    mode: 'exam',
    onFinish: (answers) => {
      // Record every answered question exactly once, at submit (the hook's
      // finishedRef makes a double-submit a no-op). Each answer goes through
      // the queue-aware seam: online it records directly; if the origin is
      // down at submit the batch queues entry-by-entry (one client id per
      // answer) and the drain syncs each exactly once — never silently
      // dropped, never double-recorded on a retry.
      for (let i = 0; i < questions.length; i++) {
        const letter = answers[i]
        if (!letter) continue
        const q = questions[i]
        // One recording rule per origin: DB rows record by id exactly as
        // before; the bundled USAT bank has no ids, so its attempts record
        // by stable key — the same path practice sessions use — never
        // dropped, never double-recorded.
        if (q.id) void recordAnswer(q.id, letter).catch(() => {})
        else if (q.key) void recordAttemptByQuestionKey(q.key, letter, q.question_text).catch(() => {})
      }
    },
  })
  const { index, current: q, answers, finished, pick, next, prev, statusFor, finish } = session
  // Per-question figure pair (PMA non-verbal): null for every text-only
  // question, so neither the stem figure nor the figure option rows appear.
  const figures = figureSpec ? figureSpec(q) : null

  const router = useRouter()
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60)
  const [showReview, setShowReview] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const endConfirmOpenRef = useRef(false)
  const pendingHrefRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = durationMinutes * 60
  const pct = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0
  const isLow = remainingSeconds <= 300 // 5 minutes
  const isCritical = remainingSeconds <= 60

  // A reload or tab close mid-test silently discards the whole run (exam runs
  // live in memory — no resume). Warn before the browser tears the page down.
  useEffect(() => {
    if (finished) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [finished]);

  const openEndConfirm = useCallback((href: string | null) => {
    pendingHrefRef.current = href;
    endConfirmOpenRef.current = true;
    setShowEndConfirm(true);
  }, []);

  const closeEndConfirm = useCallback(() => {
    pendingHrefRef.current = null;
    endConfirmOpenRef.current = false;
    setShowEndConfirm(false);
  }, []);

  // A confirmed "End test" records the run through the same batch path as a
  // natural submit — answered questions exactly once, the rest count as
  // skipped (no rows) — then leaves. finish() is idempotent (finishedRef), so
  // this can never double-record against the timer or the Submit button.
  const confirmEnd = useCallback(() => {
    const href = pendingHrefRef.current ?? '/dashboard/mock-test'
    pendingHrefRef.current = null
    endConfirmOpenRef.current = false
    setShowEndConfirm(false)
    finish()
    router.push(href)
  }, [finish, router])

  // Esc + stray same-tab internal navs (sidebar links, header links) used to
  // exit instantly and silently discard the run. Both now open the end-test
  // confirm instead; capture phase so the run's own key bindings and the
  // confirm's Escape-close can't race it. While the confirm is open, quiz
  // keys (1–4, arrows, Enter) must not answer the question underneath — Tab is
  // left alone so focus stays usable.
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (endConfirmOpenRef.current) {
        if (e.key === 'Tab') return
        e.stopPropagation()
        if (e.key === 'Escape') closeEndConfirm()
        return
      }
      if (e.key === 'Escape') {
        e.stopPropagation()
        openEndConfirm(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [finished, openEndConfirm, closeEndConfirm])

  useEffect(() => {
    if (finished) return
    const onClick = (e: MouseEvent) => {
      if (endConfirmOpenRef.current) return
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      let el = e.target as HTMLElement | null
      while (el && el.tagName !== 'A') el = el.parentElement
      if (!el || el.tagName !== 'A') return
      const a = el as HTMLAnchorElement
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('#')) return
      e.preventDefault()
      e.stopPropagation()
      openEndConfirm(href)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [finished, openEndConfirm])

  // Countdown → auto-submit. The hook's finish() is stable and guarded, so a
  // timeout racing the Submit button can never double-record.
  useEffect(() => {
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
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [finish])

  // Empty-draw guard. An empty draw makes `current` undefined, so the live
  // branch below dereferences `q.subject` and throws; the finished branch
  // divides by questions.length and renders "NaN%". This surface has a third
  // hazard — the countdown above runs regardless and would auto-submit an
  // empty paper — so the guard has to sit ahead of the `finished` branch, not
  // just ahead of the live one. Must also sit after every hook so hook order
  // never changes between renders.
  if (!questions || questions.length === 0) {
    return (
      <div>
        <div className="text-center py-16">
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            This mock test has no questions
          </h1>
          <p className="text-sm text-[var(--steel-400)] max-w-sm mx-auto">
            The paper came back empty, so there is nothing to time. Pick a
            format again — nothing has been recorded against your attempt.
          </p>
          <TrackedLink
            to="/dashboard/mock-test"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)] transition-colors"
           label="mock-player">
            Back to mock tests
          </TrackedLink>
        </div>
      </div>
    )
  }

  if (finished) {
    const score = session.correctCount
    const accuracy = Math.round((score / questions.length) * 100)
    const verdict =
      accuracy >= 90
        ? 'Outstanding — you are entry-test ready.'
        : accuracy >= 70
          ? 'Strong work — keep drilling your weaker subjects.'
          : accuracy >= 50
            ? 'Solid effort — review your answers and try again.'
            : 'Every attempt counts — review below and go again.'
    const bySubject: Record<string, { total: number; correct: number }> = {}
    for (let i = 0; i < questions.length; i++) {
      const sub = questions[i].subject
      if (!bySubject[sub]) bySubject[sub] = { total: 0, correct: 0 }
      bySubject[sub].total++
      if (answers[i] === questions[i].correct_answer) bySubject[sub].correct++
    }

    return (
      <div>
        <div className="glass-tile-glow relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 p-8 text-center sm:p-10">
          <div className="mx-auto">
            <ScoreRing value={accuracy} size={168} stroke={12}>
              <span className="text-[2.75rem] font-extrabold leading-none tabular-nums text-gradient-brand">
                <AnimatedNumber value={accuracy} />
              </span>
              <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                accuracy
              </span>
            </ScoreRing>
          </div>
          <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Mock test complete
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            You answered{' '}
            <span className="font-bold tabular-nums text-[var(--color-primary-light)]">
              <AnimatedNumber value={score} />
            </span>
            {' '}of{' '}
            <span className="font-bold tabular-nums text-white">{questions.length}</span>
            {' '}questions correctly
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{verdict}</p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {format.toUpperCase()} Mock Test • {durationMinutes} minutes
          </p>

          {/* Subject breakdown */}
          {Object.keys(bySubject).length > 1 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(bySubject).map(([subject, data]) => {
                const subPct = Math.round((data.correct / data.total) * 100)
                return (
                  <div key={subject} className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-3 text-left">
                    <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {subject}
                    </p>
                    <p className="mt-1 text-lg font-extrabold tabular-nums text-[var(--color-primary-light)]">
                      {data.correct}<span className="text-sm text-[var(--color-text-muted)]">/{data.total}</span>
                    </p>
                    <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${subPct}%`,
                          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink to="/dashboard/mock-test" label="mock-player">
              <Button variant="outline">Try Another Test</Button>
            </TrackedLink>
            <Button variant="primary" onClick={() => setShowReview(!showReview)}>
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Button>
          </div>
        </div>

        {/* Answer review */}
        {showReview && (
          <div className="mt-6 space-y-4">
            {questions.map((q, i) => {
              const userAnswer = answers[i]
              const isCorrect = userAnswer === q.correct_answer
              const skipped = !userAnswer
              return (
                <div key={q.id ?? q.key ?? i} className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
                  <div className="mb-2 flex items-center gap-2.5">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-[var(--color-primary-light)]" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    )}
                    <span className="text-xs text-[var(--color-text-muted)]">{q.subject} • Q{i + 1}</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCorrect
                          ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                          : skipped
                            ? 'bg-white/[0.06] text-[var(--color-text-muted)]'
                            : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct' : skipped ? 'Skipped' : 'Wrong'}
                    </span>
                  </div>
                  <p className="mb-3 text-sm font-medium text-white">{q.question_text}</p>
                  <div className="space-y-1 text-xs">
                    {!skipped && (
                      <p className={isCorrect ? 'text-[var(--color-primary-light)]' : 'text-rose-300'}>
                        Your answer: {userAnswer} {isCorrect ? '✓' : '✗'}
                      </p>
                    )}
                    {!isCorrect && (
                      <p className="text-[var(--color-text-secondary)]">
                        Correct answer:{' '}
                        <span className="font-bold text-[var(--color-primary-light)]">{q.correct_answer}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 leading-relaxed text-[var(--color-text-muted)]">{q.explanation}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Timer header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-white">Mock Test</h1>
          <p className="text-xs tabular-nums text-[var(--color-text-muted)]">
            Question {index + 1} <span className="text-white/40">of {questions.length}</span>
          </p>
        </div>
        <div className={`flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-bold tabular-nums ${
          isCritical ? 'border border-rose-500/25 bg-rose-500/15 text-rose-400' :
          isLow ? 'border border-amber-500/25 bg-amber-500/15 text-amber-400' :
          'border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]'
        }`}>
          <Clock className="h-4 w-4" />
          {formatTime(remainingSeconds)}
        </div>
      </div>

      {/* Time progress bar */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : ''
          }`}
          style={{
            width: `${pct}%`,
            // The one bar in the app that moves on its own, so it is the one
            // that gets beacon: cyan while there is time, --warn under the low
            // threshold, --danger under the critical one. Progress bars that
            // only move when the student acts stay signal blue.
            background: !isCritical && !isLow
              ? 'linear-gradient(90deg, var(--beacon-600), var(--beacon-400))'
              : undefined,
            boxShadow: isCritical
              ? '0 0 10px rgba(248, 113, 113, 0.5)'
              : isLow
                ? '0 0 10px rgba(251, 191, 36, 0.5)'
                : '0 0 10px rgba(95, 211, 228, 0.5)',
          }}
        />
      </div>

      {/* Key-role legend — desktop only (keys are a laptop/web surface) */}
      <QuizKeyLegend
        className="mb-5"
        items={[
          { keys: "1–4", label: "choose answer" },
          { keys: "← →", label: "previous / next" },
          { keys: "Enter", label: "next question" },
          { keys: "Space", label: "or" },
          { keys: "Esc", label: "exit test" },
        ]}
      />

      {/* Question */}
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          {q.subject}
        </span>
        <p className="mb-6 text-lg font-medium leading-relaxed text-white">{q.question_text}</p>
        {/* PMA non-verbal paper: the stem is the figure itself. */}
        {figures && (
          <div className="mb-6 flex justify-center">
            <PmaFigure
              spec={figures.stem}
              label="Question figure"
              className="h-28 w-28 text-white"
            />
          </div>
        )}

        <QuizOptions
          question={q}
          figures={figures?.options ?? null}
          onChoose={pick}
          status={statusFor}
        />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Previous
        </button>

        {index < questions.length - 1 ? (
          <button
            onClick={next}
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-cta)] transition-all duration-[var(--transition-fast)] hover:bg-[var(--color-primary-light)]"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={next}
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-cta)] transition-all duration-[var(--transition-fast)] hover:bg-[var(--color-primary-light)]"
          >
            Submit Test
          </button>
        )}
      </div>

      {/* End-test confirm — the one honest exit from a live run. Reached by
          Esc or by clicking an in-app link (sidebar/header); cancel keeps
          everything, End records the run through the batch path and leaves. */}
      {showEndConfirm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="End test"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeEndConfirm}
          />
          <div className="relative w-full max-w-sm rounded-[var(--radius-xl)] border border-white/10 bg-[#141414] p-6 shadow-[var(--shadow-lg)]">
            <h2 className="text-lg font-bold text-white">End test now?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Unanswered questions will count as skipped. Your answered
              questions are recorded to your progress before you leave.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeEndConfirm}
                className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                Keep testing
              </button>
              <button
                onClick={confirmEnd}
                className="rounded-[var(--radius-md)] bg-rose-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-400"
              >
                End test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}