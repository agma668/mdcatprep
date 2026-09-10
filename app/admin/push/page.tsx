import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminEmail } from "@/lib/auth";
import { isVapidConfigured } from "@/lib/push";
import { SendPushForm } from "./SendPushForm";

export const metadata: Metadata = { title: "Push Notifications" };

export const dynamic = "force-dynamic";

export default async function AdminPushPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const service = createServiceClient();
  const { count } = await service
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true });

  const configured = isVapidConfigured();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)] mb-1">
          Owner only
        </p>
        <h1 className="text-2xl font-extrabold text-white">Push Notifications</h1>
        <p className="mt-1 text-sm text-white/50">
          Send a web push to every student who enabled practice reminders. Sends are
          deliberate — nothing here fires automatically. Expired subscriptions are
          cleaned up as the send goes through.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Subscribers</p>
          <p className="mt-1 text-2xl font-extrabold text-white tabular-nums">
            {count ?? 0}
          </p>
        </div>
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">VAPID keys</p>
          <p className={`mt-1 text-sm font-bold ${configured ? "text-emerald-400" : "text-amber-400"}`}>
            {configured ? "Configured ✓" : "Not set — sending disabled"}
          </p>
        </div>
      </div>

      <SendPushForm configured={configured} />
    </div>
  );
}