// Centralized admin identity and authentication.
//
// Admin identity is based solely on an email allowlist — never on a profiles
// row, role column, or RLS. This ensures admins can never be locked out by
// a missing or broken profile.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ─── Email allowlist ──────────────────────────────────────────
//
// Accounts signed up with one of these emails are always recognized as admins:
// they bypass the student approval flow, are auto-approved at signup, and are
// routed to /admin instead of /dashboard. This is the exception to the default
// `student` / `pending` role assigned by the `handle_new_user` trigger.
//
// Keep this list in sync with the `role` column in the `profiles` table.

const ADMIN_EMAILS: readonly string[] = ["67129@cch.edu.pk"];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ─── Server-side session checks ───────────────────────────────

/**
 * Returns the authenticated user if they are an allowlisted admin email,
 * otherwise null. Never throws.
 */
export async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/** Throws when the caller is not an allowlisted admin. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
