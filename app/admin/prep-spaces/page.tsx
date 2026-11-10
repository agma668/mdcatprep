import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { resolveAdminContext, ServiceKeyNotice } from "@/lib/admin-context";
import { PREP_SPACES, type PrepSpaceReadiness } from "@/lib/prep-space-registry";

export const metadata: Metadata = { title: "Prep Space Inventory" };
export const dynamic = "force-dynamic";

const STATUS: Record<PrepSpaceReadiness, { label: string; tone: string }> = {
  beta: { label: "Beta", tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  content_in_progress: { label: "In progress", tone: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
  coming_soon: { label: "Coming soon", tone: "border-white/10 bg-white/[0.05] text-white/55" },
};

export default async function AdminPrepSpacesPage() {
  const ctx = await resolveAdminContext();
  if (ctx.kind !== "ok") return <ServiceKeyNotice kind={ctx.kind} />;

  const groups = [
    { category: "medical", title: "Medical" },
    { category: "engineering", title: "Engineering" },
    { category: "scholarship", title: "Scholarship" },
    { category: "defence", title: "Defence" },
  ] as const;

  const betaCount = PREP_SPACES.filter((space) => space.readiness === "beta").length;
  const inProgressCount = PREP_SPACES.filter((space) => space.readiness === "content_in_progress").length;
  const comingSoonCount = PREP_SPACES.filter((space) => space.readiness === "coming_soon").length;

  return (
    <main className="mx-auto w-full max-w-6xl p-5 sm:p-8">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
          Product operations
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Prep Space inventory</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Read-only view of the canonical exam catalogue. Use it to plan content and verify what the student-facing hub currently communicates. Status changes still require a reviewed code change.
        </p>
      </header>

      <section aria-label="Readiness summary" className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "Beta spaces", value: betaCount, tone: "text-emerald-300" },
          { label: "In development", value: inProgressCount, tone: "text-amber-300" },
          { label: "Coming soon", value: comingSoonCount, tone: "text-white/70" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className={`text-2xl font-extrabold tabular-nums ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-xs text-white/45">{item.label}</p>
          </div>
        ))}
      </section>

      <div className="space-y-8">
        {groups.map((group) => {
          const spaces = PREP_SPACES.filter((space) => space.category === group.category);
          return (
            <section key={group.category} aria-labelledby={`inventory-${group.category}`}>
              <h2 id={`inventory-${group.category}`} className="mb-3 text-lg font-bold text-white">{group.title}</h2>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {spaces.map((space, index) => {
                  const status = STATUS[space.readiness];
                  return (
                    <article key={space.id} className={`grid gap-3 bg-white/[0.025] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${index ? "border-t border-white/10" : ""}`}>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{space.name}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.tone}`}>{status.label}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-white/50">{space.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {space.capabilities.length ? space.capabilities.map((capability) => (
                            <span key={capability} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-white/55">{capability.replaceAll("_", " ")}</span>
                          )) : <span className="text-[10px] text-white/35">No capabilities released</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40 sm:justify-end">
                        <code>{space.id}</code>
                        {space.legacyRoute && (
                          <Link href={space.legacyRoute} className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary)] hover:underline">
                            Legacy route <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-relaxed text-amber-200/75">
        This page is an inventory, not a content-quality certification. Before promoting a space from beta, verify its exam blueprint, question coverage, answer explanations, progress persistence and student-facing routes.
      </p>
    </main>
  );
}
