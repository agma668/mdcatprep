import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { PendingReferralCard } from "@/components/auth/PendingReferralCard";

export const metadata = { title: "Application Pending" };

// Reads the live session every request — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function PendingPage() {
  // The page is reachable two ways: signed-out (a fresh signup following the
  // "check your status" link) and signed-in (middleware bounces a pending
  // student here from /dashboard, and login routes them here). Each state
  // needs a different way out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/[0.06] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-[var(--radius-md)] bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-white">Application Pending</h1>
        <p className="text-white/70 mt-3">
          Your application is under review. Once an admin approves it, simply
          log in to start preparing. No email is sent, so check back by signing
          in.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {user ? (
            <>
              {/* Logging out is how a pending student switches accounts — they
                  are signed in (that is how they reached this page), so a
                  "Back to Sign In" link would just bounce them straight back. */}
              <form action={logout}>
                <Button variant="primary" fullWidth type="submit">
                  Log out
                </Button>
              </form>
              <Link href="/">
                <Button variant="ghost" fullWidth>Back to Home</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="primary" fullWidth>Log in to check your status</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" fullWidth>Back to Home</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Community path: invite 10 friends → automatic approval (counted by the
          database, never by hand). Only shown to students who have a code. */}
      <div className="w-full max-w-md mt-5">
        <PendingReferralCard />
      </div>
    </div>
  );
}
