import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotesPaperShield } from "@/components/dashboard/NotesPaperShield";
import {
  MCAT_NOTES_PREAMBLE,
  MCAT_NOTES_SECTIONS,
  MCAT_DEEP_SECTIONS,
  type NoteBlock,
  type NoteSection,
} from "@/lib/mcat-notes";

export const metadata: Metadata = { title: "Master Notes — Protected Reader" }
export const dynamic = 'force-dynamic'

function BlockText({ block }: { block: NoteBlock }) {
  if (block.type === 'bullet') {
    return (
      <li className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-800">
        <span className="text-[var(--signal-600)] font-bold mt-0.5" aria-hidden="true">•</span>
        <span>{block.text}</span>
      </li>
    );
  }
  return <p className="text-[13.5px] leading-relaxed text-slate-800">{block.text}</p>;
}

/** White "paper" section — the print-look the founder asked for. */
function PaperSection({ section }: { section: NoteSection }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-300 pb-2 mb-4">
        {section.title}
      </h2>
      <div className="space-y-4">
        {section.topics.map((topic, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-md px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            {topic.title && <h3 className="text-sm font-bold text-slate-900 mb-2">{topic.title}</h3>}
            <div className="space-y-2">
              {topic.blocks.map((block, j) =>
                block.type === 'bullet' ? (
                  <ul key={j} className="space-y-1.5"><BlockText block={block} /></ul>
                ) : (
                  <BlockText key={j} block={block} />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function MasterNotesReaderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Per-user watermark: any leak is traceable to this account. Prefer email,
  // fall back to the id fragment — never blank.
  const identity =
    user.email ?? `account ${user.id.slice(0, 8)}`;

  return (
    <div className="min-h-screen bg-[var(--field-1)]">
      <NotesPaperShield watermark={identity} />

      {/* Reader chrome (inside the app shell look, outside the paper) */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--line-2)] bg-[var(--srf-1)] px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-[var(--steel-100)]">
            Master Notes — protected reader
          </p>
          <p className="text-xs text-[var(--steel-300)] mt-1">
            These pages are watermarked to <span className="font-semibold">{identity}</span> and
            are for your study only. Sharing, copying, or re-uploading them is a breach of your
            account terms. Screenshots and printing are discouraged and traced. There is no
            download — this reader is the only way in.
          </p>
        </div>

        {/* The paper itself: white sheet, print-grade typography, no-select.
            noprint class keeps browser print dialogs from producing a clean copy. */}
        <div className="notes-paper rounded-md bg-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] px-6 sm:px-12 py-10 select-none">
          <header className="text-center border-b-2 border-slate-900 pb-4 mb-8">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
              MED PREP — MDCAT MASTER CONCEPT NOTES
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Easy-language notes for Pre-Medical students · based on the PMDC MDCAT syllabus
            </p>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Personal copy — licensed to {identity}
            </p>
          </header>

          {MCAT_NOTES_PREAMBLE.length > 0 && (
            <div className="mb-8 bg-slate-50 border border-slate-200 rounded-md px-5 py-4">
              {MCAT_NOTES_PREAMBLE.map((block, i) => (
                <BlockText key={i} block={block} />
              ))}
            </div>
          )}

          {MCAT_NOTES_SECTIONS.map((section) => (
            <PaperSection key={section.title} section={section} />
          ))}

          <div className="my-10 border-t-2 border-slate-900 pt-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              Exam-Depth Master Notes
            </h2>
            <p className="text-[13px] text-slate-600 mb-6">
              Fact-level revision notes derived from the MDCAT past-paper corpus — every major
              unit, bucket by bucket. “×n” marks how many corpus questions ask the same fact
              (×3 = near-certain repeat).
            </p>
            {MCAT_DEEP_SECTIONS.map((section) => (
              <PaperSection key={section.title} section={section} />
            ))}
          </div>

          <footer className="border-t border-slate-300 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              © MED Prep · watermarked personal copy · licensed to {identity}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
