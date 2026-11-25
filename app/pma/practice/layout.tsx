import type { Metadata } from "next";

/** Metadata for the client-rendered PMA drill (see app/nust/practice/layout.tsx). */
export const metadata: Metadata = {
  title: "PMA Long Course Practice — Verbal, Non-Verbal & Academic Drills",
  description:
    "Free PMA Long Course initial-test practice: verbal and non-verbal intelligence plus academic questions, timed at 20 seconds each, with explanations and ISSB-style reasoning drills.",
  alternates: { canonical: "/pma/practice" },
};

export default function PmaPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
