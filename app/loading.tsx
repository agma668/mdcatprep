export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent)] animate-spin" />
        </div>
        <p className="text-sm text-white/50 font-medium">Loading…</p>
      </div>
    </div>
  );
}
