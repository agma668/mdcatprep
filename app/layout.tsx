import type { Metadata, Viewport } from "next";
import { Inter, Sora, Amiri } from "next/font/google";
import "./globals.css";
import { getSiteUrl, SITE_DESCRIPTION, getWhatsAppNumber } from "@/lib/site";
import { AntiCopy } from "@/components/AntiCopy";
import { Telemetry } from "@/components/Telemetry";
import FeedbackWidgetMount from "@/components/feedback/FeedbackWidgetMount";
import { OfflineSyncHarness } from "@/components/OfflineSyncHarness";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display face. Sora's flat-sided bowls and squared terminals read as
// engineered rather than friendly, which is the register this brand wants;
// Inter keeps the body copy neutral underneath it. The old --font-jakarta
// utility still resolves to this stack (see @theme in globals.css), so the
// eleven components already using font-jakarta need no edit.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

// Quranic face for the auth veil's ayah. Amiri is cut for Quran typesetting
// (full tashkeel support, naskh proportions); next/font self-hosts it like
// Inter and Sora, so the auth path still touches no third-party origin.
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});


const siteUrl = getSiteUrl();
const whatsapp = "+" + getWhatsAppNumber();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MED Prep — Free Preparation for Every Major Entry Test in Pakistan",
    template: "%s | MED Prep",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "MDCAT preparation",
    "MDCAT prep free",
    "MDCAT 2026",
    "MDCAT entry test Pakistan",
    "NUMS preparation",
    "NUMS entry test",
    "PMDC MDCAT syllabus",
    "MDCAT MCQs online free",
    "MDCAT practice questions free",
    "medical entry test preparation Pakistan",
    "MBBS admission test Pakistan",
    "BDS admission test",
    "MDCAT biology MCQs",
    "MDCAT chemistry MCQs",
    "MDCAT physics MCQs",
    "MDCAT english practice",
    "MDCAT notes free download",
    "MDCAT mock test online",
    "NUMS MDCAT past papers practice",
    "NUST NET preparation",
    "NUST NET past papers",
    "GIKI admission test preparation",
    "LUMS SBASSE entry test",
    "HEC USAT preparation",
    "USAT-E pre-engineering test",
    "PMA long course initial test preparation",
    "ISSB intelligence test practice",
    "online test preparation Pakistan",
    "free medical MCQ practice Pakistan",
    "MDCAT study material",
    "private medical college admission test",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MED Prep",
    title: "MED Prep — Free Preparation for Every Major Entry Test in Pakistan",
    description: SITE_DESCRIPTION,
    locale: "en_PK",
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "MED Prep — Free Entry Test Preparation for Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MED Prep — Free Preparation for Every Major Entry Test in Pakistan",
    description: SITE_DESCRIPTION,
    images: [`${siteUrl}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  // PWA installability: the manifest is served from app/manifest.ts; the
  // apple-touch icon and theme color make iOS/Android treat the site as an
  // installable app (offline practice keeps its own service-worker cache).
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "MED Prep",
    statusBarStyle: "black-translucent",
  },
};

// themeColor belongs on the viewport export, not metadata (Next warns and
// drops it otherwise). #090F1B is --field-1: the browser chrome, the PWA
// splash and the page now agree on one colour instead of three.
export const viewport: Viewport = {
  themeColor: "#090F1B",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "MED Prep",
  description: SITE_DESCRIPTION,
  url: siteUrl,
  telephone: whatsapp,
  areaServed: "PK",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Quetta",
    addressRegion: "Balochistan",
    addressCountry: "PK",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: whatsapp,
    availableLanguage: ["en", "ur"],
  },
  knowsAbout: [
    "MDCAT",
    "NUMS",
    "PMDC MDCAT Syllabus",
    "Medical College Entry Tests",
    "MBBS Admission",
    "NUST NET",
    "GIKI Admission Test",
    "LUMS SBASSE Admission",
    "HEC USAT",
    "PMA Long Course Initial Test",
    "ISSB Intelligence Test",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MED Prep",
  url: siteUrl,
  description: SITE_DESCRIPTION,
  inLanguage: ["en", "ur"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${amiri.variable}`}>
      <head>
        {/* No font preconnects: next/font self-hosts Inter and Sora from our
            own origin, so handshakes to fonts.googleapis/gstatic were two
            unused DNS+TLS round trips on every cold mobile load. */}
        {/* Theme: apply the saved palette before paint so there is never a
            flash of the wrong colours (FOUC). Runs in <head> before CSS is
            applied; the ThemeProvider keeps it live thereafter. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("med-prep-theme");var valid={midnight:1,paper:1};if(t&&valid[t]){document.documentElement.dataset.theme=t;window.__MED_PREP_THEME__=t;}else{document.documentElement.dataset.theme="midnight";window.__MED_PREP_THEME__="midnight";}}catch(e){}})();`,
          }}
        /><script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      {/* Colour lives in globals.css (html/body on --field-1 / --steel-100) so
          there is one source for it. The old selection:bg-primary/30 emitted
          nothing — `primary` is not a Tailwind colour here — and ::selection
          is now a real rule in globals.css. */}
      <body className="antialiased min-h-screen">
        <ThemeProvider>
        <AntiCopy />
        <FeedbackWidgetMount />
        <Telemetry />
        <OfflineSyncHarness />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
