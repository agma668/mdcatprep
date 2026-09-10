'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Swords, Trophy, Hourglass, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QuizOptions } from '@/components/ui/QuizOptions'
import { QuizKeyLegend } from '@/components/ui/QuizKeyLegend'
import { useQuizSession } from '@/lib/quiz-session'
import { formatClock, formatCountdown } from './time'
import { getDuelPlay, submitDuelAnswer, rematchDuel, type DuelPlayData } from '@/app/actions/duels'
import type { DuelResult } from '@/lib/duels-repo'

/** My side of the scoreboard from a map of questionId → my pick. */
function myScoreboard(
  questions: DuelPlayData['questions'],
  mine: Record<string, { selectedAnswer: string; timeSeconds: number }>
) {
  let score = 0
  let timeSeconds = 0
  for (const q of questions) {
    if (!q.id) continue
    const record = mine[q.id]
    if (!record) continue
    if (record.selectedAnswer === q.correct_answer) score++
    timeSeconds += record.timeSeconds
  }
  return { score, timeSeconds }
}

function OutcomeCard({ result, myId, total, opponentName, onRematch }: {
  result: DuelResult
  myId: string
  total: number
  opponentName: string
  onRematch: () => void
}) {
  const amChallenger = result.challenger.studentId === myId
  const me = amChallenger ? result.challenger : result.opponent
  const them = amChallenger ? result.opponent : result.challenger
  const won = (amChallenger && result.winner === 'challenger') || (!amChallenger && result.winner === 'opponent')
  const forfeit = result.forfeit

  return (
    <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/30">
        {result.winner === 'draw' ? (
          <Hourglass className="h-7 w-7 text-[var(--color-primary-light)]" aria-hidden="true" />
        ) : (
          <Trophy className={`h-7 w-7 ${won ? 'text-[var(--color-primary-light)]' : 'text-white/40'}`} aria-hidden="true" />
        )}
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {result.winner === 'draw'
          ? "It's a draw!"
          : forfeit
            ? won
              ? 'You won by forfeit!'
              : 'You lost by forfeit'
            : won
              ? 'You won the duel!'
              : 'You lost this duel'}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        {forfeit ? (
          won ? (
            <>
              <span className="font-bold text-white">{opponentName}</span> didn&apos;t finish their 10 questions within 48 hours — you win{' '}
              <span className="font-bold text-white">{me.score}–{them.score}</span>.
            </>
          ) : (
            <>
              You didn&apos;t finish your 10 questions within 48 hours — <span className="font-bold text-white">{opponentName}</span> wins{' '}
              <span className="font-bold text-white">{them.score}–{me.score}</span>.
            </>
          )
        ) : (
          <>
            {me.score}–{them.score} against <span className="font-bold text-white">{opponentName}</span>
            {me.score === them.score && (
              <span> (you were faster{me.timeSeconds <= them.timeSeconds ? ' ✓' : ''})</span>
            )}
          </>
        )}
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">You</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-white">
            {me.score} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ {total}</span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">{formatClock(me.timeSeconds)}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-4">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{opponentName}</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-white">{them.score}</p>
          <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">{formatClock(them.timeSeconds)}</p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button variant="primary" onClick={onRematch}>
          <RefreshCw className="h-4 w-4" /> Rematch
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export function DuelPlayer({ data, myId }: { data: DuelPlayData; myId: string }) {
  const router = useRouter()
  const { duel, questions, opponentName, myAnswers, myFinished, expired } = data

  // Live expiry countdown (set in an effect — Date.now() never runs during
  // render). The duel expires 48h after creation, computed at read time.
  const [countdown, setCountdown] = useState<string>("…")
  useEffect(() => {
    const update = () =>
      setCountdown(
        formatCountdown(new Date(duel.created_at).getTime() + 48 * 60 * 60 * 1000 - Date.now())
      )
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [duel.created_at])

  const [submitError, setSubmitError] = useState<string | null>(null)
  // Answers recorded in THIS session (myAnswers in the prop only covers
  // answers that existed when the page loaded — e.g. a revisit).
  const [localRecords, setLocalRecords] = useState<Record<string, { selectedAnswer: string; timeSeconds: number }>>({})
  const [result, setResult] = useState<DuelResult | null | undefined>(data.result)
  const [rematching, setRematching] = useState(false)
  const questionStartTime = useRef(0)
  // One client-unique attempt key per duel question, stable across retries —
  // the anchor that makes a wifi-flicker retry impossible to double-record
  // (recordAttempt is idempotent by this key; the duel row by its unique
  // (duel, student, question) constraint).
  const attemptKeys = useRef<Record<string, string>>({})

  const stampQuestionStart = () => {
    questionStartTime.current = Date.now()
  }

  const session = useQuizSession({
    questions,
    mode: 'instant',
    escHref: '/dashboard',
    onReveal: (i, letter) => {
      const q = questions[i]
      if (!q?.id) return
      // Same lazy stamping as the drill player: the first question's start is
      // its reveal moment (≈0s, floored to 1s); later questions re-stamp on
      // advance.
      if (questionStartTime.current === 0) stampQuestionStart()
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime.current) / 1000))
      setLocalRecords((prev) => ({ ...prev, [q.id!]: { selectedAnswer: letter, timeSeconds: timeSpent } }))
      const key =
        attemptKeys.current[q.id] ??
        (attemptKeys.current[q.id] =
          crypto.randomUUID?.() ?? `duel-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      void submitDuelAnswer(duel.id, q.id, letter, timeSpent, key).then((res) => {
        if (res && 'error' in res) setSubmitError(res.error)
      })
    },
  })
  const { index, current: q, answers, score, finished, revealed, pick, next, statusFor } = session

  const advance = () => {
    next()
    questionStartTime.current = Date.now()
  }

  // While finished and the opponent hasn't finished, poll for the result.
  useEffect(() => {
    if (!finished) return
    let alive = true
    const poll = async () => {
      const fresh = await getDuelPlay(duel.id)
      if (alive && 'data' in fresh && fresh.data.result) setResult(fresh.data.result)
    }
    void poll()
    const timer = setInterval(poll, 10000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [finished, duel.id])

  const handleRematch = useCallback(async () => {
    setRematching(true)
    const res = await rematchDuel(duel.id)
    if ('error' in res) {
      setSubmitError(res.error)
      setRematching(false)
      return
    }
    router.push(`/dashboard/duels/${res.duelId}`)
  }, [duel.id, router])

  // A terminal result — both players finished, or a FORFEIT (one side
  // finished all 10, the other lapsed past expiry) — renders the outcome
  // card. Branch order matters: the result branch comes FIRST so a finished
  // player of an expired duel sees their forfeit win/loss, never the waiting
  // view and never the "expired, nothing to score" view.
  if (result) {
    return (
      <div className="space-y-6">
        <OutcomeCard result={result} myId={myId} total={questions.length} opponentName={opponentName} onRematch={handleRematch} />
        {submitError && (
          <p className="flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {submitError}
          </p>
        )}
      </div>
    )
  }

  // Finished but no terminal result yet: the opponent is still playing (or
  // the local result state is a beat behind — the poll below lands it). The
  // run never restarts.
  if (finished || myFinished) {
    const mine = myScoreboard(questions, { ...myAnswers, ...localRecords })

    return (
      <div className="space-y-6">
        <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-8 text-center sm:p-10">
          <Hourglass className="mx-auto h-12 w-12 text-[var(--color-primary-light)]/80" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">You&apos;re done — waiting for {opponentName}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
            You scored <span className="font-bold tabular-nums text-[var(--color-primary-light)]">{mine.score}</span>/{questions.length} in{' '}
            <span className="font-bold tabular-nums">{formatClock(mine.timeSeconds)}</span>. The result appears as soon as {opponentName} finishes
            {expired
              ? ' — the challenge has expired, so if they never finished you win by forfeit (being fetched now).'
              : ' (they have up to 48h from the challenge).'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                void getDuelPlay(duel.id).then((f) => {
                  if ('data' in f && f.data.result) setResult(f.data.result)
                })
              }}
            >
              <RefreshCw className="h-4 w-4" /> Check for result
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
          {rematching && <p className="mt-4 text-xs text-[var(--color-text-muted)]">Preparing your rematch…</p>}
        </div>
        {submitError && (
          <p className="flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {submitError}
          </p>
        )}
      </div>
    )
  }

  // Expired with NOBODY having finished: no forfeit, nothing to play or
  // score — honest terminal state.
  if (expired) {
    return (
      <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-10 text-center">
        <Hourglass className="mx-auto h-12 w-12 text-white/40" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-extrabold text-white">This challenge has expired</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
          Neither of you finished within 48 hours, so there&apos;s nothing to play or score. Challenge each other again for a fresh set.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/leaderboard">
            <Button variant="primary">Find an opponent</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const answered = answers[index] !== undefined
  const isCorrect = answered && answers[index] === q.correct_answer

  return (
    <div>
      {/* Header: opponent + subject + expiry */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <Swords className="h-3.5 w-3.5 text-[var(--color-primary-light)]" /> Duel · {duel.subject}
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-tight text-white">vs {opponentName}</h1>
          <p className="mt-0.5 text-xs tabular-nums text-[var(--color-text-muted)]">
            {expired ? 'expired' : `expires in ${countdown}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-xs tabular-nums text-[var(--color-text-muted)]">
            Question <span className="font-bold text-white">{index + 1}</span> of {questions.length}
          </p>
          <span className="rounded-[var(--radius-md)] border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1.5 text-sm font-bold tabular-nums text-[var(--color-primary-light)]">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <QuizKeyLegend
        className="mb-5"
        items={[
          { keys: "1–4", label: "choose answer" },
          { keys: "← →", label: "previous / next" },
          { keys: "Enter", label: "next question" },
          { keys: "Esc", label: "exit duel" },
        ]}
      />

      {submitError && (
        <p className="mb-5 flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {submitError}
        </p>
      )}

      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary-light)]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          {q.subject}
        </span>
        <p className="mb-6 text-lg font-medium leading-relaxed text-white">{q.question_text}</p>

        <QuizOptions question={q} onChoose={pick} status={statusFor} />

        {answered && (
          <div
            className={`mt-5 rounded-[var(--radius-md)] border p-4 text-sm ${
              isCorrect
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/25 bg-amber-500/10 text-amber-300'
            }`}
          >
            <p className="font-semibold">
              {isCorrect ? 'Correct!' : `Not quite — the correct answer is ${q.correct_answer}.`}
            </p>
            {q.explanation && <p className="mt-1 leading-relaxed">{q.explanation}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link href="/dashboard">
            <Button variant="ghost">Exit</Button>
          </Link>
          <Button variant="primary" disabled={!answered} onClick={advance}>
            {index + 1 >= questions.length ? 'See Results' : 'Next Question →'}
          </Button>
        </div>
      </div>
    </div>
  )
}