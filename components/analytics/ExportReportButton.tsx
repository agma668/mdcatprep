"use client";

import { useState } from "react";

export function ExportReportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    // Simulate brief processing then invoke browser print
    setTimeout(() => {
      setLoading(false);
      window.print();
    }, 800);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      aria-label="Export performance report as PDF"
      className={[
        "inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]",
        "text-sm font-semibold border transition-all",
        "border-white/10 bg-white/[0.04]",
        "text-[var(--color-text-primary)] hover:bg-white/[0.08]",
        "hover:border-white/15 shadow-[var(--shadow-sm)]",
        "disabled:opacity-60 disabled:pointer-events-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
      ].join(" ")}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Generating…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Export Report
        </>
      )}
    </button>
  );
}
