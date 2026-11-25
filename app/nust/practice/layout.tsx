import type { Metadata } from "next";

/**
 * The drill itself is a client component, so it cannot export metadata. This
 * layout exists only to give the page a real title and canonical: before it,
 * /nust/practice served the generic site title, which made one of the
 * highest-intent pages invisible as a page.
 */
export const metadata: Metadata = {
  title: "NUST NET, GIKI & LUMS Practice — Free Engineering Entry Test Drill",
  description:
    "Free exam-style practice for NUST NET, GIKI and LUMS engineering admissions: maths, physics, chemistry and English with step-by-step explanations after every answer.",
  alternates: { canonical: "/nust/practice" },
};

export default function NustPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
