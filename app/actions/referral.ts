"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { MASTER_PDF_REFERRAL_GOAL, REFERRAL_GOAL } from "@/lib/referral";

/**
 * Current user's referral code + live progress toward the auto-approval goal.
 * The count is database-driven (referred_signups is maintained by a trigger
 * when a student is attributed to your link — see
 * 20260903000003_referral_signup_count.sql) — nothing here is tallied by hand.
 * Signing up through the link counts the moment it happens; nobody waits for
 * the friend's approval.
 */
export async function getReferralInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  try {
    const [{ data: profile }, { count: joinedCount }] = await Promise.all([
      service.from("profiles").select("referral_code, status").eq("id", user.id).maybeSingle(),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", user.id),
    ]);

    const joined = joinedCount ?? 0;
    return {
      code: profile?.referral_code || null,
      status: profile?.status || null,
      // Everyone who signed up through your link (approved or still waiting).
      joinedCount: joined,
      goal: REFERRAL_GOAL,
      // True when enough friends joined for instant access.
      autoApproved: joined >= REFERRAL_GOAL,
      // Founder's growth incentive: 5 friends → locked Master PDFs unlock.
      masterPdfGoal: MASTER_PDF_REFERRAL_GOAL,
      masterPdfUnlocked: joined >= MASTER_PDF_REFERRAL_GOAL,
    };
  } catch (err) {
    // Pre-migration (no referral columns yet): report nothing rather than break.
    console.error("getReferralInfo unavailable:", (err as Error).message);
    return { code: null, status: null, joinedCount: 0, goal: REFERRAL_GOAL, masterPdfGoal: MASTER_PDF_REFERRAL_GOAL, autoApproved: false, masterPdfUnlocked: false };
  }
}
