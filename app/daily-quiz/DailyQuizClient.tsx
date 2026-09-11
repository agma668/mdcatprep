"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Share2, Image as ImageIcon, CheckCircle as CheckIcon, RotateCcw } from "lucide-react";
import { ProgressShareCardBody } from "@/components/dashboard/ProgressShareCardBody";
import { QuizKeyLegend } from "@/components/ui/QuizKeyLegend";
import { QuizOptions } from "@/components/ui/QuizOptions";
import { recordAnswer } from "@/lib/offline-sync";
import { getHabitSnapshot, type HabitSnapshot } from "@/app/actions/habit";
import { createClient } from "@/lib/supabase/client";
import { useQuizSession } from "@/lib/quiz-session";
import type { BankQuestion } from "@/lib/questions";

const DAILY_TIPS = [
  { subject: "Essay Writing", tip: "Start with a hook — a question, quote, or bold statement. Your opening sentence sets the tone for the entire essay." },
  { subject: "General Science", tip: "Mitochondria = powerhouse of the cell. This is one of the most frequently tested biology topics in MDCAT." },
  { subject: "Mathematics", tip: "When solving algebra, always isolate the variable first. Practice rearranging equations until it becomes second nature." },
  { subject: "English Grammar", tip: "Active voice is stronger than passive. 'The teacher graded the papers' reads better than 'The papers were graded by the teacher.'" },
  { subject: "Islamiat", tip: "Know the chronological order of the major battles: Badr (2 AH), Uhud (3 AH), and the Trench (5 AH). Dates are often tested." },
  { subject: "Urdu", tip: "اعراب (diacritical marks) are crucial in Urdu grammar. Practice identifying اسم فاعل, اسم مفعول, and اسم اضافی." },
  { subject: "General Knowledge", tip: "Pakistan's founding year is 1947. The Lahore Resolution was passed on 23 March 1940. Know your key dates cold." },
  { subject: "Intelligence / IQ", tip: "For number patterns, always check the differences between consecutive terms. If differences increase by a constant, it's a quadratic sequence." },
];

export function DailyQuizClient({ questions }: { questions: BankQuestion[] }) {
  // Run state (index, pick, reveal, score, the 250 ms guard, keyboard) lives
  // in the shared useQuizSession hook. enterRevealsFirst gives this surface
  // its check-then-advance Enter behaviour: Enter reveals a picked answer,
  // then advances once revealed.
  const session = useQuizSession({
    questions,
    mode: "submit",
    enterRevealsFirst: true,
    escHref: "/",
    onReveal: (i, letter) => {
      // Queue-aware seam: records online, queues on failure so a dropped
      // connection never eats an answered question.
      void recordAnswer(questions[i].id, letter);
    },
  });
  const { index, current: question, score, finished, revealed, pick, reveal, next, restart, statusFor } = session;

  const [copied, setCopied] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [habit, setHabit] = useState<HabitSnapshot | null>(null);
  const [openShare, setOpenShare] = useState(false);
  const [currentTip] = useState(() => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)]);

  useEffect(() => {
    let alive = true;
    createClient()
      .then((supabase) => supabase.auth.getUser())
      .then(({ data }) => {
        if (alive) setIsSignedIn(!!data.user);
      })
      .catch(() => {
        if (alive) setIsSignedIn(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // The results strip reads the student's real recorded practice: fetched once
  // the run finishes (guests and failed reads show nothing).
  useEffect(() => {
    if (isSignedIn !== true || !finished) return;
    let alive = true;
    getHabitSnapshot().then((h) => {
      if (alive) setHabit(h);
    });
    return () => {
      alive = false;
    };
  }, [isSignedIn, finished]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.origin + "/daily-quiz" : "";
    const text = `🎯 MED Prep — Daily MCQ Challenge!\n\nI just answered ${questions.length} questions. Can you beat my score?\n\nTry it free (no signup needed):\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "MED Prep Daily Quiz", text });
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [questions.length]);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 pt-24">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white mb-2">Daily Quiz</h1>
          <p className="text-white/60">No questions available yet. Check back tomorrow!</p>
          <Link href="/signup" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-[var(--radius-md)] font-bold hover:bg-[var(--color-accent-light)] transition-colors">
            Sign Up Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 pt-24">
        <div className="w-full max-w-2xl">
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center rounded-full text-3xl mx-auto mb-4">
              🏆
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Challenge Complete!</h1>
            <p className="text-white/60 text-sm mb-1">
              You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{questions.length}</span> ({accuracy}% accuracy)
            </p>
            <p className="text-white/40 text-xs mb-6">Daily tips and {questions.length} fresh MCQs every day</p>

            {habit && (
              <div className="mb-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Your practice streak</p>
                  <p className="text-sm font-extrabold text-white">
                    {habit.streak > 0 ? <>🔥 {habit.streak}-day streak</> : "Start your streak today"}
                  </p>
                </div>
                {/* Last 7 days, oldest → newest. Today is highlighted. */}
                <div className="mt-3 flex items-center justify-between gap-1.5">
                  {habit.week.map((day, i) => {
                    const active = habit.activeDays.includes(day);
                    const isToday = i === habit.week.length - 1;
                    const label = new Date(day + "T00:00:00Z").toLocaleDateString("en", {
                      weekday: "narrow",
                      timeZone: "UTC",
                    });
                    return (
                      <div key={day} className="flex flex-1 flex-col items-center gap-1" aria-label={`${day}${active ? " — practised" : ""}`}>
                        <span
                          className={`flex h-7 w-full max-w-[28px] items-center justify-center rounded-md text-[10px] font-bold ${
                            active
                              ? "bg-[var(--signal-400)] text-[var(--color-text-inverse)]"
                              : "bg-white/[0.06] text-white/30"
                          } ${isToday ? "ring-1 ring-[var(--color-primary-light)]/60" : ""}`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-white/55">
                  {habit.todayCount > 0 ? (
                    <>
                      <span className="text-[var(--color-primary-light)] font-bold">✓ Practised today</span>{" "}
                      — {habit.todayCount} question{habit.todayCount === 1 ? "" : "s"} recorded. Come back tomorrow for a fresh set and keep the streak alive.
                    </>
                  ) : (
                    "Today isn\u2019t counted yet — finish a set and your streak starts."
                  )}
                </p>
              </div>
            )}

            {isSignedIn === true && habit && (
              <div className="mb-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4">
                <button
                  onClick={() => setOpenShare((v) => !v)}
                  className="mx-auto flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-bold text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/20 transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                  {openShare ? "Hide result card" : "Share today’s result"}
                </button>
                {openShare && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <ProgressShareCardBody
                      title="TODAY’S RESULT"
                      name={habit.name || "Student"}
                                            cells={[
                        { label: "Today’s score", value: `${score}/${questions.length}`, accent: true },
                        { label: "Accuracy", value: `${accuracy}%` },
                        { label: "Study streak", value: `${habit.streak} ${habit.streak === 1 ? "day" : "days"}` },
                        { label: "Leaderboard rank", value: habit.rank != null ? `#${habit.rank}` : "#—" },
                      ]}
                      shareText={`🎯 I scored ${score}/${questions.length} on today’s MED Prep daily quiz!`}

                      fileName="cadet-prep-daily-quiz.png"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)] border border-[var(--whatsapp)]/40 text-[var(--whatsapp)] font-bold text-sm hover:bg-[var(--whatsapp)]/10 transition-colors cursor-pointer"
              >
                {copied ? <><CheckIcon className="w-4 h-4" />Copied!</> : <><Share2 className="w-4 h-4" />Challenge a Friend</>}
              </button>
              <button
                onClick={restart}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)] border border-white/10 text-white/70 font-bold text-sm hover:border-white/25 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />Try Again
              </button>
              {isSignedIn ? (
                <Link href="/dashboard/practice" className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--color-accent-light)] transition-colors">
                  Full Practice <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link href="/signup" className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">
                  Sign Up Free <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 pt-24">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--color-accent-light)] mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Daily Challenge
          </span>
          <h1 className="text-3xl font-extrabold text-white mb-2">Today&apos;s Quiz</h1>
          <p className="text-white/60 text-sm">
            Question {index + 1} of {questions.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: ((index + (revealed ? 1 : 0)) / questions.length * 100) + "%" }}
          />
        </div>

        {/* Key-role legend — desktop only (keys are a laptop/web surface) */}
        <QuizKeyLegend
          className="mb-6"
          items={[
            { keys: "1–4", label: "choose answer" },
            { keys: "Enter", label: "check answer" },
            { keys: "Enter / Space", label: "next question" },
            { keys: "Esc", label: "exit" },
          ]}
        />

        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-6 sm:p-8">
          {/* Subject badge */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent-light)] border border-[var(--color-accent)]/20 px-2.5 py-1 rounded-full mb-4">
            {question.subject}
          </span>

          <p className="text-lg text-white font-medium leading-relaxed mb-6">
            {question.question_text}
          </p>

          <QuizOptions
            question={question}
            reveal={revealed}
            onChoose={pick}
            disabled={revealed}
            status={statusFor}
          />

          {!revealed ? (
            <button
              disabled={!session.selected}
              onClick={reveal}
              className="mt-6 w-full py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-accent-light)] transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <div className="mt-6 space-y-4">
              {question.explanation && (
                <div className="p-4 bg-white/[0.04] rounded-[var(--radius-lg)] border border-white/10">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Explanation</p>
                  <p className="text-sm text-white/80 leading-relaxed">{question.explanation}</p>
                </div>
              )}
              <button
                onClick={next}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] bg-white/[0.06] text-white font-bold text-sm hover:bg-white/[0.1] transition-colors"
              >
                {index < questions.length - 1 ? "Next Question" : "See Results"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Daily tip */}
        <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-[var(--radius-lg)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-light)] mb-1.5">
            💡 Tip of the Day — {currentTip.subject}
          </p>
          <p className="text-sm text-white/60 leading-relaxed">{currentTip.tip}</p>
        </div>

        {/* Share + CTA below */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-[var(--radius-md)] border border-[var(--whatsapp)]/30 text-[var(--whatsapp)] font-bold text-sm hover:bg-[var(--whatsapp)]/10 transition-colors cursor-pointer"
          >
            {copied ? <><CheckIcon className="w-4 h-4" />Link Copied!</> : <><Share2 className="w-4 h-4" />Challenge a Friend on WhatsApp</>}
          </button>
          {isSignedIn === false && (
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">
              Sign Up Free <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {isSignedIn === true && (
            <Link href="/dashboard/practice" className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--color-accent-light)] transition-colors">
              Full Practice <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}