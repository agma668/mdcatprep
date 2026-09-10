import type { Metadata } from "next";
import Link from "next/link";
import { getWhatsAppLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Cadet College Prep collects, uses and protects your data — practice records, account details, offline copies and telemetry.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Who we are",
    body: [
      "Cadet College Prep (“we”, “us”) is a non-profit community initiative helping students prepare for cadet and military college entry tests across Pakistan. This policy explains what we collect, why, and the choices you have — including deletion of your entire account.",
      "Questions about this policy can go to the founder directly on WhatsApp at 0319-3051175 (this is the same number printed across the site), or through the feedback button on any page.",
    ],
  },
  {
    heading: "Data you give us",
    body: [
      "Account and application data. When you sign up we store your full name, email address, phone number and chosen exam target (for example “CCH”) in our database (hosted with Supabase). These details are used to run the enrollment and approval process, to personalise your dashboard and study plan, and so we can contact you about your application. Passwords are stored by Supabase Auth in hashed form — we never see or store your plain password.",
      "Practice data. Your answers, scores, accuracy, streaks, mistakes and time spent are stored on your account so the analytics dashboard, mistake notebook and leaderboard can work. This is the core product data — it is yours, and it is deleted when you delete your account.",
      "Content you create. Study notes you upload are stored and shown to other students once approved; if you delete your account, published notes remain but lose the link to your name.",
      "Feedback. Messages sent through the feedback button are stored with the page you were on, and (if you were signed in) your account id so we can reply. Anonymous visitors send feedback without any identifier.",
    ],
  },
  {
    heading: "Data we collect automatically",
    body: [
      "Usage and error telemetry. We record page views and technical error reports (the error message and a technical stack trace, plus the page it happened on) in order to fix bugs and understand which features are used. Signed-in visits are linked to your account id so we can investigate an error you hit; anonymous visits are not linked to anyone. This is the web equivalent of crash reporting — it never includes your answers, inputs or private messages.",
      "You can opt out at any time from Profile → Privacy & preferences, which stops new page views and error reports immediately. Practice and analytics (your own account data) are unaffected.",
      "Notification subscriptions. If you allow push notifications we store the technical subscription endpoint so we can send you reminders. It is removed when your account is deleted.",
    ],
  },
  {
    heading: "What stays on your device",
    body: [
      "When you download the question bank for offline use, a copy of those questions is stored on your own device (in your browser’s IndexedDB and service-worker cache) so you can practise without internet. That offline copy never leaves your device on its own; only your answers are sent to us when you answer online. Clearing your browser’s site data removes the offline copy.",
      "We also use your browser’s local storage for small preferences (for example your telemetry opt-out choice and UI state) and standard session cookies for keeping you signed in. We do not use third-party advertising cookies or tracking pixels, and we never sell personal data to anyone.",
    ],
  },
  {
    heading: "Where data lives and how it is protected",
    body: [
      "Our database and authentication are managed by Supabase, which stores data in secure data centres and encrypts it in transit and at rest. Only the site administrators can access account data. You are never asked for more information than the service needs, and the student-facing dashboard shows you your own numbers at all times.",
      "The WhatsApp group and chats are separate: anything you send to our WhatsApp number or group is governed by WhatsApp/Meta’s privacy terms and is not part of this site’s database.",
    ],
  },
  {
    heading: "Sharing",
    body: [
      "We share only aggregate, non-identifying numbers publicly — for example total questions answered by the community or leaderboard summaries. Your name may appear on the practice leaderboard if you choose to take part; the leaderboard shows the name on your account together with your streak and accuracy.",
      "We never publish or sell individual students’ data, and we do not share data with advertisers (we have none).",
    ],
  },
  {
    heading: "Children",
    body: [
      "This service is built for students preparing for entry tests, many of whom are under 18. Because accounts are created through an enrollment process run directly with the founder, we ask that a parent or guardian be involved in signing up, paying any applicable enrollment dues, and in deciding to delete the account.",
    ],
  },
  {
    heading: "Retention and deletion",
    body: [
      "We keep your data for as long as your account is active. To delete your account permanently: Profile → Delete account (you will be asked to type DELETE to confirm). This removes your auth account, profile and, through database cascades, your answers, analytics, streaks, mistakes, quiz sessions and push subscriptions. Some published content (approved notes) stays up but no longer shows your name. Deletion is immediate and cannot be undone.",
      "If you ever have trouble deleting through the app, message the founder on WhatsApp at 0319-3051175 and we will delete the account manually. Backups may retain encrypted copies for a short period before they are purged.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If we change how we handle data we will update this page and note the change date below. Continued use of the service after a change means you accept the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div aria-hidden="true" className="hero-aurora">
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
      </div>
      <div aria-hidden="true" className="film-grain" />

      <div className="container-page relative py-16 md:py-24 max-w-3xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary-light)] mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Privacy{" "}
            <span className="text-liquid-gold">Policy</span>
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl mx-auto">
            Last updated: September 3, 2026. Plain language, no legalese — what
            we collect, why, and how to erase it.
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map(({ heading, body }) => (
            <section
              key={heading}
              className="glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-[var(--color-primary-light)] mb-3">
                {heading}
              </h2>
              {body.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    "text-sm leading-relaxed text-white/70 " +
                    (i < body.length - 1 ? "mb-3 " : "")
                  }
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-10 glass-tile-glow rounded-[var(--radius-lg)] p-6 sm:p-8 text-center">
          <h2 className="text-lg font-bold mb-2">Your data, your call</h2>
          <p className="text-sm text-white/60 mb-5">
            Delete everything from <Link href="/dashboard/profile" className="text-[var(--color-primary-light)] hover:underline">Profile → Delete account</Link>, or ask us
            on WhatsApp and we will do it for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/profile"
              className="px-6 py-2.5 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-[#0a0a0a] text-sm font-bold hover:brightness-110 transition-all"
            >
              Open my profile
            </Link>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-[var(--radius-md)] border border-white/15 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              WhatsApp the founder
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--steel-400)]">
          Cadet College Prep · non-profit community initiative · Quetta, Pakistan
        </p>
      </div>
    </div>
  );
}
