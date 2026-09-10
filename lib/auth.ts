// Centralized admin identity and authentication.
//
// Admin identity is based solely on an email allowlist — never on a profiles
// row, role column, or RLS. This ensures admins can never be locked out by
// a missing or broken profile.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Email allowlist ──────────────────────────────────────────
//
// Accounts signed up with one of these emails are always recognized as admins:
// they bypass the student approval flow, are auto-approved at signup, and are
// routed to /admin instead of /dashboard. This is the exception to the default
// `student` / `pending` role assigned by the `handle_new_user` trigger.
//
// Keep this list in sync with the `role` column in the `profiles` table.

// TODO: put YOUR real admin email(s) here — whoever signs up with an email
// on this list becomes the site admin (auto-approved, routed to /admin).
const ADMIN_EMAILS: readonly string[] = [
  "admin@medprep.pk",
  "67129@cch.edu.pk", // site owner
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ─── Server-side session checks ───────────────────────────────

/**
 * Returns the authenticated user when they are an admin — by allowlisted
 * email OR by the profiles.role column (the source of truth the middleware
 * gate and login routing also honor). Never throws; unreadable profile just
 * means "not admin by role".
 */
export async function getAdminUser() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (isAdminEmail(user.email)) return user;

  // DB-assigned admin: profiles.role === 'admin' (same rule as the proxy).
  try {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return profile?.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

/** Throws when the caller is not an allowlisted admin. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
