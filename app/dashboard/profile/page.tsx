import type { Metadata } from "next";
import { getStudentProfile } from "@/lib/student";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileEditor } from "./ProfileEditor";
import { PrivacyPreferences } from "./PrivacyPreferences";
import { DeleteAccountSection } from "./DeleteAccountSection";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { profile } = await getStudentProfile();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <PageHeader
        eyebrow="Account & application"
        title="Profile"
        description="Your account and application details."
      />

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden mb-6">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark)_55%,var(--color-navy))] px-6 py-6">
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-8 w-48 h-48 rounded-full bg-[var(--tint-signal)] blur-3xl"
          />
          <div className="relative flex items-center gap-4">
            {/* The one measured contrast failure left in the dashboard: white
                on a signal-300 -> signal-200 disc is under 2:1, because that
                pair is the LIGHT end of the ramp — accent type on a dark field,
                not a fill to put ink on. signal-600 -> -700 is the fill that
                was measured for white (5.9:1 / 8.6:1). Same disc, same avatar,
                readable initial. */}
            <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,var(--signal-600),var(--signal-700))] flex items-center justify-center text-[var(--on-cta)] font-extrabold text-xl shadow-[var(--glow-signal-md)] ring-2 ring-[var(--line-signal)]">
              {(profile?.full_name || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-lg">
                {profile?.full_name || "Student"}
              </p>
              <p className="text-sm text-white/70 capitalize">
                {profile?.status || "—"}
              </p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-[var(--color-border)]">
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-[var(--color-text-muted)]">Email</dt>
            <dd className="text-sm font-medium text-[var(--color-text-primary)]">
              {profile?.email || "—"}
            </dd>
          </div>
        </dl>
      </div>

      <ProfileEditor
        initial={{
          full_name: profile?.full_name ?? null,
          phone: profile?.phone ?? null,
          exam_target: profile?.exam_target ?? null,
        }}
      />

      <PrivacyPreferences />

      <div className="mt-6">
        <DeleteAccountSection />
      </div>
    </div>
  );
}
