// Dashboard loading skeleton — dark glass tiles that match the real page
// (the previous light-grey blocks flashed white against the dark bg).

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      {/* Page-header skeleton — kicker, title bar, hairline hint */}
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-24 rounded-full bg-[var(--color-primary)]/15 animate-pulse" />
        <div className="h-8 w-60 max-w-full rounded-[var(--radius-sm)] bg-white/[0.08] animate-pulse" />
        <div className="h-3 w-80 max-w-full rounded-full bg-white/[0.05] animate-pulse" />
      </div>
      {/* Welcome hero skeleton */}
      <div className="h-52 rounded-[var(--radius-xl)] border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] animate-pulse" />
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
