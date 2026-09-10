export default function AdminLoading() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">
      <div className="h-8 w-48 rounded-[var(--radius-md)] bg-[var(--color-surface-3)] animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-surface-3)] animate-pulse"
          />
        ))}
      </div>
      <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--color-surface-3)] animate-pulse" />
    </div>
  );
}
