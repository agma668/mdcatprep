import type { MetadataRoute } from "next";

// PWA web manifest — makes the site installable ("Add to Home Screen") on
// Android/Chrome and iOS. Icons are the brand mark (navy square + gold
// compass-rose) rasterized from the navbar CompassLogo SVG. The 512 icon is
// full-bleed so it also serves the maskable purpose (platforms crop it to
// their own shape). Offline practice is untouched: the service worker keeps
// its own versioned cache and this manifest adds no fetch behaviour.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cadet College Prep — Free Entry Test Practice for Cadet Colleges",
    short_name: "Cadet Prep",
    description:
      "Free cadet college entry test preparation — exam-style MCQ practice, daily quizzes, analytics and streaks for CCH, PAF Sargodha, MCJ and more.",
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
