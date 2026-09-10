import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  CheckCircle,
  Target,
  User,
} from "lucide-react";
import { getStudentOverview } from "@/lib/analytics/index";
import { getStudentProfile } from "@/lib/student";
import { getCommunityProofStats } from "@/lib/public-stats";
import { getSelfRank } from "@/lib/leaderboard";
import { getWhatsAppLink } from "@/lib/site";
import { getMyDuels } from "@/app/actions/duels";
import { getMyRaces } from "@/app/actions/races";
import { ShareProgressCard } from "@/components/dashboard/ShareProgressCard";
import { DuelsCard } from "@/components/duels/DuelsCard";
import { RacesCard } from "@/components/races/RacesCard";
import { ReferralBanner } from "@/components/dashboard/ReferralBanner";
import { SocialProof } from "@/components/dashboard/SocialProof";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { DailyGoal } from "@/components/dashboard/DailyGoal";
import { SubjectMastery } from "@/components/dashboard/SubjectMastery";
import { StudyPlan } from "@/components/dashboard/StudyPlan";
import { OfflineToggle } from "@/components/dashboard/OfflineToggle";
import { NotificationPrompt } from "@/components/dashboard/NotificationPrompt";
import { WhatsAppSharePopup } from "@/components/dashboard/WhatsAppSharePopup";
const ExamCountdown = dynamicImport(() => import("@/components/dashboard/ExamCountdown").then(m => ({ default: m.ExamCountdown })), { loading: () => null });

export const metadata: Metadata = { title: "Overview" };

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  suspended: "Suspended",
};

export default async function DashboardOverviewPage() {
  const [{ user, profile }, analytics, proof, duels, races] = await Promise.all([
    getStudentProfile(),
    getStudentOverview(),
    getCommunityProofStats(),
    // Duels fail OPEN: while the duels table isn't applied (or on any read
    // error) the card renders the honest "no duels yet" state, never an
    // error or a crash.
    getMyDuels().catch(() => ({ error: "unavailable" })),
    // Races fail OPEN the same way — honest empty state until the table exists.
    getMyRaces().catch(() => ({ entries: [] })),
  ]);
  // The share card's rank comes from the SAME ranked rows as the board
  // (lib/leaderboard.ts) — fails open to null, never a guessed number.
  const rankSpot = user ? await getSelfRank(user.id).catch(() => null) : null;
  const displayName = profile?.full_name?.trim() || "Student";
  const s = analytics?.summary;
  const hasPractice = (s?.totalQuestionsAttempted ?? 0) > 0;

  const stats = [
    {
      label: "Overall Accuracy",
      value: hasPractice ? `${s!.overallAccuracy}%` : "—",
      sub: hasPractice ? "all-time average" : "no attempts yet",
      icon: Target,
      tint: "bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/15",
    },
    {
      label: "Questions Done",
      value: s ? s.totalQuestionsAttempted.toLocaleString() : "—",
      sub: "across every subject",
      icon: CheckCircle,
      tint: "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-400 ring-1 ring-indigo-500/15",
    },
    {
      label: "Study Streak",
      value: s && s.currentStreak > 0 ? `${s.currentStreak} days` : "—",
      sub: s && s.longestStreak > 0 ? `best: ${s.longestStreak} days` : "keep it going",
      icon: Target,
      tint: "bg-gradient-to-br from-orange-500/10 to-orange-500/5 text-orange-400 ring-1 ring-orange-500/15",
    },
  ] as const;

  const quickActions = [
    {
      href: "/dashboard/practice",
      title: "Practice MCQs",
      desc: "Pick a subject and answer real CCH-style questions.",
      icon: Target,
      tint: "bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/15",
    },
    {
      href: "/dashboard/notes",
      title: "Important Notes",
      desc: "Official notes, syllabus and your own uploads.",
      icon: BookOpen,
      tint: "bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-400 ring-1 ring-purple-500/15",
    },
    {
      href: "/dashboard/analytics",
      title: "View Analytics",
      desc: "Accuracy trends, subject performance and streaks.",
      icon: BarChart3,
      tint: "bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/15",
    },
    {
      href: "/dashboard/profile",
      title: "Edit Profile",
      desc: "Update your name, phone and exam target.",
      icon: User,
      tint: "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-400 ring-1 ring-indigo-500/15",
    },
  ] as const;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <WhatsAppSharePopup
        questionsAnswered={s?.totalQuestionsAttempted ?? 0}
        streak={s?.currentStreak ?? 0}
        accuracy={s?.overallAccuracy ?? 0}
      />
      {/* ── Referral banner (non-dismissible, at the very top, above welcome) */}
      <ReferralBanner />
      {/* ── Welcome banner */}
      <section
        aria-label="Welcome"
        className="group glass-tile-glow rounded-[var(--radius-xl)] p-6 sm:p-8 text-center hover:translate-y-[-2px] transition-all duration-300"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            {profile?.exam_target || "Cadet College Entry Test Prep"}
          </span>
          {profile?.status && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/10">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              {STATUS_LABEL[profile.status] ?? profile.status}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-brand">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 text-white/50 max-w-xl mx-auto text-sm sm:text-base group-hover:text-white/65 transition-colors">
          {hasPractice
            ? "You have answered " + s!.totalQuestionsAttempted.toLocaleString() + " questions. Keep going."
            : "Start your first practice session to unlock analytics, streaks and accuracy tracking."}
        </p>

        <Link
          href="/dashboard/practice"
          className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary-light)] text-sm font-bold hover:bg-[var(--color-primary)]/25 hover:border-[var(--color-primary)]/50 transition-all"
        >
          <Target className="w-4 h-4" />
          Start practicing
        </Link>
      </section>

      {/* ── Social proof (real community totals; hides when unverifiable) */}
      <div className="mt-4">
        <SocialProof stats={proof} />
      </div>

      {/* ── Recommended next action / first-run onboarding */}
      <section aria-label="Recommended next action" className="mt-6">
        {!hasPractice ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Take the diagnostic",
                desc: "10 questions across 5 subjects — find your level in under 2 minutes.",
                href: "/diagnostic",
              },
              {
                step: "02",
                title: "Answer your first MCQs",
                desc: "Practice exam-style questions with instant explanations.",
                href: "/dashboard/practice",
              },
              {
                step: "03",
                title: "Join the community",
                desc: "Ask questions and get guidance in the WhatsApp group.",
                href: "https://chat.whatsapp.com/HYkBmANpvm1BD4awon23Rw",
                external: true,
              },
            ].map(({ step, title, desc, href, external }) => (
              <Link
                key={step}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group glass-tile-glow rounded-[var(--radius-lg)] p-5 text-left hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-4 text-6xl font-extrabold text-white/[0.04] select-none"
                >
                  {step}
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--line-signal)] text-xs font-extrabold text-[var(--color-primary-light)] mb-3">
                  {step}
                </span>
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm group-hover:text-[var(--color-primary-light)] transition-colors">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href="/dashboard/practice"
            className="group block glass-tile-glow rounded-[var(--radius-lg)] p-5 text-center hover:translate-y-[-2px] transition-all duration-300"
          >
            <p className="text-lg font-extrabold text-[var(--color-primary-light)]">
              {s!.overallAccuracy < 60
                ? "Focus on weak areas"
                : s!.currentStreak === 0
                  ? "Start a new streak today"
                  : "Keep it up — try a new subject"}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5 group-hover:text-white/60 transition-colors">
              {s!.overallAccuracy < 60
                ? "Targeted practice will help you improve fast"
                : s!.currentStreak === 0
                  ? "One session today brings your streak back"
                  : s!.currentStreak + " day streak · " + s!.overallAccuracy + "% accuracy"}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
              Start practicing
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
      </section>

      {/* ── Exam countdown. The margin lives here rather than on the component:
             the landing page places the same countdown inside its own padded
             band, where an extra top margin would push it off centre. */}
      <div className="mt-6">
        <ExamCountdown />
      </div>

      {/* ── Achievement badges */}
      <section aria-label="Achievements" className="mt-6">
        <AchievementBadges
          questionsAnswered={s?.totalQuestionsAttempted ?? 0}
          currentStreak={s?.currentStreak ?? 0}
          accuracy={s?.overallAccuracy ?? 0}
        />
      </section>

      {/* ── Daily goal + Study plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DailyGoal
          questionsAnsweredToday={s?.questionsAnsweredToday ?? 0}
          currentStreak={s?.currentStreak ?? 0}
        />
        <StudyPlan
          weakAreas={[]}
          hasPractice={hasPractice}
          currentStreak={s?.currentStreak ?? 0}
        />
      </div>

      {/* ── Duels inbox (fails open to "no duels yet" until the table exists) */}
      <div className="mt-6">
        <DuelsCard entries={"entries" in duels ? duels.entries : []} />
      </div>

      {/* ── Races inbox (fails open to "no races yet" until the table exists) */}
      <div className="mt-6">
        <RacesCard entries={"entries" in races ? races.entries : []} />
      </div>

      {/* ── Subject mastery */}
      <section aria-label="Subject mastery" className="mt-6">
        <SubjectMastery
          subjects={(analytics?.subjectPerformance ?? []).map(sp => ({
            subject: sp.subject,
            questionsAttempted: sp.totalQuestions,
            accuracy: sp.accuracy,
            icon: sp.subject === 'Mathematics' ? '📐' :
                   sp.subject === 'English' ? '📖' :
                   sp.subject === 'General Science' ? '🔬' :
                   sp.subject === 'General Knowledge' ? '🌍' :
                   sp.subject === 'Islamiat' ? '🕌' :
                   sp.subject === 'Urdu' ? '📝' :
                   sp.subject === 'Intelligence Test' ? '🧠' : '📚',
          }))}
        />
      </section>

      {/* ── Offline + Notifications ──────────────────────────── */}
      <section aria-label="Offline and notifications" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <OfflineToggle />
        <NotificationPrompt />
      </section>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <section aria-label="Quick statistics" className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, tint }) => (
            <div
              key={label}
              className="glass-tile-glow rounded-[var(--radius-lg)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {label}
                </p>
                <span className={`icon-tile ${tint}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-gradient-brand">
                {value}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Share your progress (real stats → shareable card) ── */}
      {hasPractice && s && (
        <div className="mt-8">
          <ShareProgressCard
            name={displayName}
            rank={rankSpot?.rank ?? null}
            streak={s.currentStreak}
            accuracy={s.overallAccuracy}
            questions={s.totalQuestionsAttempted}
          />
        </div>
      )}

      {/* ── Quick actions ───────────────────────────────────── */}
      <section aria-label="Quick actions" className="mt-8">
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">
          Jump back in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ href, title, desc, icon: Icon, tint }) => (
            <Link
              key={href}
              href={href}
              className="group glass-tile-glow rounded-[var(--radius-lg)] p-5 flex flex-col"
            >
              <span className={`icon-tile w-11 h-11 ${tint}`}>
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                {title}
                <ArrowRight className="w-4 h-4 text-[var(--color-primary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Contact tile ────────────────────────────────────── */}
      <section aria-label="Contact" className="mt-8">
        <a
          href={getWhatsAppLink("Hi Sir Haziq, I need help with Cadet College Prep")}
          target="_blank"
          rel="noopener noreferrer"
          className="group block glass-tile-glow rounded-[var(--radius-xl)] p-6 sm:p-8 text-center hover:translate-y-[-2px] transition-all duration-300"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--whatsapp)]/15 ring-1 ring-[var(--whatsapp)]/25 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-[var(--whatsapp)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <p className="text-base sm:text-lg font-bold text-white group-hover:text-[var(--whatsapp)] transition-colors duration-300">
            Need help? Contact Sir Haziq
          </p>
          <p className="text-sm text-white/45 mt-1.5 group-hover:text-white/60 transition-colors">
            Questions, feedback, or problems — I&apos;m here for you on WhatsApp
          </p>
          <span className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--whatsapp)]/15 border border-[var(--whatsapp)]/30 text-[var(--whatsapp)] text-sm font-bold group-hover:bg-[var(--whatsapp)]/25 group-hover:border-[var(--whatsapp)]/50 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </span>
        </a>
      </section>
    </div>
  );
}
