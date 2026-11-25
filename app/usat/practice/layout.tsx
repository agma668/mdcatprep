import type { Metadata } from "next";

/** Metadata for the client-rendered HEC USAT drill (see app/nust/practice/layout.tsx). */
export const metadata: Metadata = {
  title: "HEC USAT Practice — Quantitative, Verbal & Science Questions (Free)",
  description:
    "Free HEC USAT practice across quantitative, verbal and science sections, with trap-aware options and a step-by-step explanation after every question.",
  alternates: { canonical: "/usat/practice" },
};

export default function UsatPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
