import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotesPaperShield } from "@/components/dashboard/NotesPaperShield";
import { listKbDocs, getKbDocSections } from "@/lib/kb-notes";
import type { NoteSection } from "@/lib/mcat-notes";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  const found = listKbDocs().find((d) => d.slug === doc);
  return { title: found ? `${found.title} — Protected Reader` : "Protected Reader" };
}

function BlockText({ block }: { block: NoteSection["topics"][number]["blocks"][number] }) {
  if (block.type === "bullet") {
    return (
      <li className="flex items-start gap-2 text-[13.5px] leading-relaxed text-slate-800">
        <span className="text-[var(--signal-600)] font-bold mt-0.5" aria-hidden="true">•</span>
        <span>{block.text}</span>
      </li>
    );
  }
  return <p className="text-[13.5px] leading-relaxed text-slate-800">{block.text}</p>;
}

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
                block.type === "bullet" ? (
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

export default async function KbDocReaderPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const identity = user.email ?? `account ${user.id.slice(0, 8)}`;

  const { doc } = await params;
  const meta = listKbDocs().find((d) => d.slug === doc);
  const sections = meta ? getKbDocSections(doc) : null;
  if (!meta || !sections) notFound();

  return (
    <div className="min-h-screen bg-[var(--field-1)]">
      <NotesPaperShield watermark={identity} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--line-2)] bg-[var(--srf-1)] px-5 py-4 mb-6">
          <Link href="/dashboard/notes/master-reader" className="text-xs text-[var(--steel-300)] underline underline-offset-2 hover:text-[var(--steel-100)]">
            ← All master notes
          </Link>
          <p className="text-sm font-semibold text-[var(--steel-100)] mt-1">{meta.title}</p>
          <p className="text-xs text-[var(--steel-300)] mt-1">
            Watermarked to <span className="font-semibold">{identity}</span> — for your study only.
            No download; sharing or re-uploading is a breach of your account terms.
          </p>
        </div>

        <div className="notes-paper rounded-md bg-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] px-6 sm:px-12 py-10 select-none">
          <header className="text-center border-b-2 border-slate-900 pb-4 mb-8">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">{meta.title}</p>
            <p className="text-xs text-slate-600 mt-1">
              MED Prep master notes{meta.subject ? ` · ${meta.subject}` : ""}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 italic">Personal copy — licensed to {identity}</p>
          </header>

          {sections.map((section) => (
            <PaperSection key={section.title} section={section} />
          ))}

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
