"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type Sample = {
  subject: string;
  q: string;
  options: string[];
  answer: number;
  why: string;
};

// Three original sample questions (not from any paper) so the hero can be
// answered, not just looked at. The card labels them as samples.
const SAMPLES: Sample[] = [
  {
    subject: "Biology",
    q: "Which enzyme joins Okazaki fragments on the lagging strand?",
    options: ["Helicase", "DNA ligase", "Primase", "Topoisomerase"],
    answer: 1,
    why: "DNA ligase seals the nicks between fragments. Primase only lays the RNA primers, and helicase unwinds the helix.",
  },
  {
    subject: "Chemistry",
    q: "What is the hybridisation of each carbon atom in ethene, C\u2082H\u2084?",
    options: ["sp", "sp\u00b2", "sp\u00b3", "sp\u00b3d"],
    answer: 1,
    why: "Each carbon forms three sigma bonds and one pi bond, so it uses three sp\u00b2 orbitals and keeps one unhybridised p orbital for the pi bond.",
  },
  {
    subject: "Physics",
    q: "A ball thrown straight up is at its highest point. What is true at that instant?",
    options: [
      "Velocity and acceleration are both zero",
      "Velocity is zero, acceleration is 9.8 m/s\u00b2 downward",
      "Velocity is maximum",
      "Acceleration points upward",
    ],
    answer: 1,
    why: "Velocity passes through zero as it changes direction, but gravity keeps acting, so acceleration stays 9.8 m/s\u00b2 downward.",
  },
];

const LETTERS = ["A", "B", "C", "D"];

export function ExamPaper() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const s = SAMPLES[idx];
  const done = picked !== null;
  const last = idx === SAMPLES.length - 1;

  function pick(i: number) {
    if (done) return;
    setPicked(i);
    if (i === s.answer) setScore((n) => n + 1);
  }

  function next() {
    setPicked(null);
    setIdx((n) => (last ? 0 : n + 1));
    if (last) setScore(0);
  }

  return (
    <div className="rounded-[var(--r-4)] border border-[var(--line-3)] bg-[var(--srf-2)] p-5 sm:p-7">
      <div className="flex items-baseline justify-between border-b border-dashed border-[var(--steel-600)] pb-3 text-sm text-[var(--steel-300)]">
        <span>
          Medical MCQ sample{" "}
          <span className="tabular-nums text-[var(--steel-100)]">
            {idx + 1}/{SAMPLES.length}
          </span>
        </span>
        <span>{s.subject}</span>
      </div>

      <p className="mt-5 text-lg font-semibold leading-snug text-[var(--steel-100)] sm:text-xl">{s.q}</p>

      <div role="group" aria-label="Answer options" className="mt-5 space-y-2">
        {s.options.map((opt, i) => {
          const isAnswer = i === s.answer;
          const isPicked = picked === i;
          const state = !done ? "idle" : isAnswer ? "right" : isPicked ? "wrong" : "dim";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => pick(i)}
              disabled={done}
              aria-pressed={isPicked}
              className={[
                "group flex min-h-[48px] w-full items-center gap-3 rounded-[var(--r-3)] border px-3 py-2 text-left text-[15px] transition-[border-color,background-color,transform] duration-[var(--dur-1)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]",
                state === "idle" && "border-[var(--line-2)] bg-[var(--srf-1)] hover:border-[var(--signal-400)] hover:bg-[var(--srf-3)]",
                state === "right" && "border-[var(--ok)] bg-[var(--srf-1)]",
                state === "wrong" && "border-[var(--danger)] bg-[var(--srf-1)]",
                state === "dim" && "border-[var(--line-1)] bg-[var(--srf-1)] opacity-60",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  state === "right"
                    ? "border-[var(--ok)] bg-[var(--ok)] text-[var(--color-text-inverse)]"
                    : state === "wrong"
                      ? "border-[var(--danger)] bg-[var(--danger)] text-[var(--color-text-inverse)]"
                      : "border-[var(--steel-500)] text-[var(--steel-200)] group-hover:border-[var(--signal-300)]",
                ].join(" ")}
              >
                {state === "right" ? <Check className="h-4 w-4" /> : state === "wrong" ? <X className="h-4 w-4" /> : LETTERS[i]}
              </span>
              <span className="text-[var(--steel-100)]">{opt}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-4 min-h-[88px]">
        {done ? (
          <>
            <p className="text-sm font-semibold text-[var(--steel-100)]">
              {picked === s.answer ? "Correct." : `Not quite. The answer is ${LETTERS[s.answer]}.`}
            </p>
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[var(--steel-300)]">{s.why}</p>
          </>
        ) : (
          <p className="text-sm text-[var(--steel-400)]">Pick an option. The explanation shows straight away.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--steel-300)]">
          Score <span className="tabular-nums text-[var(--steel-100)]">{score}</span>
        </span>
        {done && (
          <button type="button" onClick={next} className="btn-secondary min-h-[44px] px-5 text-sm">
            {last ? "Try again" : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}
