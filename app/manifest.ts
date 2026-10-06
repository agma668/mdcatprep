import type { MetadataRoute } from "next";

// PWA web manifest — makes the site installable ("Add to Home Screen") on
// Android/Chrome and iOS. Icons are the brand mark rasterized from the
// navbar SVG (navy square + gold emblem). The 512 icon is full-bleed so it
// also serves the maskable purpose (platforms crop it to their own shape).
// The service worker keeps its own versioned cache; this manifest adds no
// fetch behaviour.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MED Prep — Free Entry Test Preparation",
    short_name: "MED Prep",
    description:
      "Free preparation for Pakistan's major entry tests — MDCAT, NUMS, NUST NET, GIKI, LUMS, HEC USAT and PMA. Exam-style MCQs with explanations, daily quizzes, notes, analytics and streaks.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
