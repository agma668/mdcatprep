'use client';

import { useState } from 'react';
import mcqsData from '../../data/mcqs.json';
import { ArrowRight, Check, GraduationCap, RefreshCw, Sparkles, Trophy, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

export function MCQDemoSection() {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [sub, setSub] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = mcqsData[idx];
  const total = mcqsData.length;
  const isLast = idx === total - 1;

  // Whether the question has been answered changes what an option *is*: before,
  // it is a control; after, it is a result. Kept in one function so the two
  // states can't drift apart.
  function optionClass(i: number) {
    const isSel = sel === i;
    const isCorr = i === q.correct;
    if (!sub) {
      return isSel
        ? 'border-[var(--signal-400)] bg-[var(--tint-signal)] font-semibold text-[var(--steel-100)]'
        : 'border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-200)] hover:border-[var(--line-3)] hover:bg-[var(--srf-2)]';
    }
    if (isCorr) return 'border-[var(--line-ok)] bg-[var(--tint-ok)] font-semibold text-[var(--ok)]';
    if (isSel) return 'border-[var(--line-danger)] bg-[var(--tint-danger)] font-semibold text-[var(--danger)]';
    // Receded, not faded out. The old rule was opacity-40 over white/80, which
    // put these three lines near 2.4:1; steel-400 steps back just as clearly
    // and still clears AA at 6:1.
    return 'border-[var(--line-1)] text-[var(--steel-400)]';
  }

  function reset() {
    setIdx(0);
    setSel(null);
    setSub(false);
    setScore(0);
    setDone(false);
  }

  function submit() {
    if (sel === null) return;
    setSub(true);
    if (sel === q.correct) setScore((s) => s + 1);
  }

  function advance() {
    if (isLast) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setSel(null);
    setSub(false);
  }

  function share() {
    const text = `🎯 I scored ${score}/${total} on the MED Prep demo quiz!\n\nCan you beat me? Try it free (no signup needed):\n${window.location.origin}`;
    // window.open does not imply noopener the way target="_blank" on an anchor
    // does, so the share tab would otherwise keep a handle on this one.
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section
      aria-labelledby="mcq-demo-heading"
      className="section-padding bg-mesh relative overflow-hidden"
    >
      <div className="container-page relative">
        <div className="mb-10 text-center">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Try Before You Sign Up
          </Badge>
          <h2 id="mcq-demo-heading" className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl">
            Test Your <span className="text-[var(--signal-200)]">Knowledge</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--steel-300)]">
            Try {total} sample MCQs across Biology, Chemistry, Physics and English.
          </p>
        </div>

        <div className="mx-auto max-w-2xl overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] shadow-[var(--shadow-lg)]">
          {/* A hairline rail on the card's top edge, filled from the count that
              was already printed below it. Position in a set of ten is worth
              seeing at a glance, not only reading — and it advances the moment
              an answer is submitted, so the fill answers the tap. */}
          <div aria-hidden="true" className="h-[3px] w-full bg-[var(--srf-3)]">
            <div
              className="h-full bg-[var(--signal-300)] transition-[width] duration-[var(--dur-3)] ease-[var(--ease-out-quart)]"
              style={{ width: `${done ? 100 : ((idx + (sub ? 1 : 0)) / total) * 100}%` }}
            />
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-[var(--line-2)] pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[var(--signal-300)]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[var(--steel-200)]">Practice Demo</span>
              </div>
              {!done && (
                <span className="text-xs tabular-nums text-[var(--steel-400)]">
                  Question {idx + 1} of {total}
                </span>
              )}
            </div>

            {/* reducedMotion="user" makes framer drop the transform half of every
                animation below when the OS asks for it, keeping the opacity
                cross-fade. Without it these slides ignored the preference. */}
            <MotionConfig reducedMotion="user">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    role="status"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    {/* The medal metal, on the one screen that hands out a
                        result. It replaces a 🏆 glyph that rendered in whatever
                        emoji font the device happened to ship. */}
                    <span
                      aria-hidden="true"
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line-brass)] bg-[var(--tint-champagne)] text-[var(--champagne)]"
                    >
                      <Trophy className="h-7 w-7" />
                    </span>
                    <div>
                      <h4 className="text-xl text-[var(--steel-100)]">Demo Complete!</h4>
                      <p className="mt-1 text-sm text-[var(--steel-300)]">
                        You got {score} out of {total} correct.
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                      <Button variant="secondary" size="sm" onClick={reset}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Try Again
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={share}
                        className="border-[var(--whatsapp)] text-[var(--whatsapp)] hover:border-[var(--whatsapp)] hover:bg-[var(--whatsapp)] hover:text-[var(--color-text-inverse)]"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Share on WhatsApp
                      </Button>
                      <Link href="/signup">
                        <Button size="sm">Sign Up Free</Button>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <span className="self-start rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-2.5 py-1 text-[11px] font-semibold text-[var(--signal-200)]">
                      {q.subject}
                    </span>
                    <h4 className="mb-2 text-base leading-relaxed font-medium text-[var(--steel-100)]">
                      {q.question}
                    </h4>
                    <div className="flex flex-col gap-3">
                      {q.options.map((opt, i) => {
                        const isCorr = i === q.correct;
                        const isSel = sel === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (!sub) setSel(i);
                            }}
                            disabled={sub}
                            aria-pressed={isSel}
                            className={`flex w-full items-center justify-between gap-3 rounded-[var(--r-2)] border px-5 py-3.5 text-left text-sm transition-[color,background-color,border-color] duration-[var(--dur-1)] ${optionClass(i)}`}
                          >
                            <span>{opt}</span>
                            {/* Right and wrong are carried by a mark and a word,
                                not by colour alone. */}
                            {sub && isCorr && (
                              <>
                                <span className="sr-only">Correct answer</span>
                                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                              </>
                            )}
                            {sub && isSel && !isCorr && (
                              <>
                                <span className="sr-only">Your answer, incorrect</span>
                                <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-end">
                      {!sub ? (
                        <Button size="sm" onClick={submit} disabled={sel === null}>
                          Submit Answer
                        </Button>
                      ) : (
                        <Button size="sm" onClick={advance}>
                          {isLast ? 'Finish Demo' : 'Next Question'}
                          {/* The arrow only means anything while there is a next
                              question to move to. */}
                          {!isLast && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                        </Button>
                      )}
                    </div>
                    {sub && (
                      <motion.div
                        role="status"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--srf-2)] p-4 text-xs leading-relaxed text-[var(--steel-300)]"
                      >
                        <strong className="mb-1 block font-bold text-[var(--signal-200)]">
                          Explanation:
                        </strong>
                        {q.explanation}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          </div>
        </div>
      </div>
    </section>
  );
}
