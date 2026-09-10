export default function DailyQuizLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 pt-24">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
              <div className="w-3.5 h-3.5 rounded-full bg-white/10 animate-pulse" />
              <div className="w-24 h-3 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="w-48 h-8 rounded bg-white/10 animate-pulse mx-auto mb-2" />
            <div className="w-32 h-4 rounded bg-white/5 animate-pulse mx-auto" />
          </div>

          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-[var(--radius-xl)] p-6 sm:p-8">
            <div className="w-full h-6 rounded bg-white/10 animate-pulse mb-6" />
            <div className="w-3/4 h-6 rounded bg-white/10 animate-pulse mb-8" />

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-lg)] border border-white/5 bg-white/[0.02]"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse shrink-0" />
                  <div className="flex-1 h-4 rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="mt-6 w-full h-12 rounded-[var(--radius-md)] bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
