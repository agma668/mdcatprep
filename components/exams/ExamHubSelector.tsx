import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, LockKeyhole } from "lucide-react";
import {
  PREP_SPACES,
  type PrepSpaceDefinition,
  type PrepSpaceReadiness,
} from "@/lib/prep-space-registry";

const GROUPS: {
  category: PrepSpaceDefinition["category"];
  title: string;
  description: string;
}[] = [
  { category: "medical", title: "Medical admissions", description: "Medical college entry-test preparation." },
  { category: "engineering", title: "Engineering admissions", description: "University-specific engineering admission tests." },
  { category: "scholarship", title: "Scholarship & aptitude tests", description: "Distinct scholarship and HEC aptitude pathways." },
  { category: "defence", title: "Defence selection", description: "Initial-test practice and selection preparation." },
];

const READINESS: Record<PrepSpaceReadiness, { label: string; className: string; description: string }> = {
  beta: {
    label: "Beta access",
    className: "border-[var(--line-ok)] bg-[var(--tint-ok)] text-[var(--ok)]",
    description: "Limited tools are available. Check the listed capabilities before starting.",
  },
  content_in_progress: {
    label: "In development",
    className: "border-[var(--line-warn)] bg-[var(--tint-warn)] text-[var(--warn)]",
    description: "This preparation space is being built and reviewed.",
  },
  coming_soon: {
    label: "Coming soon",
    className: "border-[var(--line-2)] bg-[var(--srf-2)] text-[var(--steel-300)]",
    description: "Not yet open for practice.",
  },
};

function CapabilityList({ space }: { space: PrepSpaceDefinition }) {
  if (space.capabilities.length === 0) {
    return <p className="text-xs leading-relaxed text-[var(--steel-400)]">No learning tools are open yet.</p>;
  }

  const labels: Record<PrepSpaceDefinition["capabilities"][number], string> = {
    mcq_practice: "MCQ practice",
    scaled_timed_mock: "Scaled timed mocks",
    flashcards: "Flashcards",
    concept_notes: "Concept notes",
    released_past_papers: "Released past papers",
    verbal_nonverbal_drills: "Verbal & non-verbal drills",
  };

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Available learning tools">
      {space.capabilities.map((capability) => (
        <li key={capability} className="rounded-[var(--r-1)] border border-[var(--line-2)] bg-[var(--srf-2)] px-2.5 py-1.5 text-xs text-[var(--steel-300)]">
          {labels[capability]}
        </li>
      ))}
    </ul>
  );
}

function PrepSpaceCard({ space }: { space: PrepSpaceDefinition }) {
  const status = READINESS[space.readiness];
  const canEnter = space.readiness === "beta" && Boolean(space.legacyRoute);

  return (
    <article className="group flex h-full flex-col border-t-2 border-[var(--line-3)] bg-[var(--srf-1)] px-5 pb-5 pt-4 transition-colors duration-[var(--dur-2)] hover:border-[var(--signal-400)] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center rounded-[var(--r-pill)] border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
          {status.label}
        </span>
        {canEnter ? (
          <BookOpen className="h-4 w-4 shrink-0 text-[var(--signal-300)]" aria-hidden="true" />
        ) : (
          <Clock3 className="h-4 w-4 shrink-0 text-[var(--steel-500)]" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-snug text-[var(--steel-100)]">{space.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-relaxed text-[var(--steel-300)]">{space.summary}</p>

      <div className="mt-5 border-t border-[var(--line-1)] pt-4">
        <p className="mb-3 text-xs font-semibold text-[var(--steel-400)]">Available tools</p>
        <CapabilityList space={space} />
      </div>

      <div className="mt-auto pt-6">
        {canEnter ? (
          <Link
            href={space.legacyRoute!}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--r-2)] bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] px-4 py-2.5 text-sm font-semibold text-[var(--on-cta)] shadow-[var(--shadow-cta)] transition-[filter,transform] duration-[var(--dur-1)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
            aria-label={`Enter ${space.name} preparation`}
          >
            Open Prep Space <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--r-2)] border border-[var(--line-2)] bg-[var(--srf-2)] px-4 py-2.5 text-sm font-medium text-[var(--steel-400)]" aria-label={status.description}>
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Not open for practice
          </div>
        )}
      </div>
    </article>
  );
}

export function ExamHubSelector() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="mb-14 grid gap-6 border-b border-[var(--line-2)] pb-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--signal-300)]">
            <span className="h-px w-7 bg-[var(--signal-400)]" aria-hidden="true" />
            One account · Distinct preparation spaces
          </p>
          <h1 className="max-w-[15ch] text-3xl font-bold leading-tight tracking-tight text-[var(--steel-100)] sm:text-5xl">
            Start with the exam. Build from there.
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--steel-300)] sm:text-base lg:justify-self-end">
          Choose the test you are preparing for. Each space lists the tools that are actually available, what is still being built, and where practice can begin.
        </p>
      </header>

      <div className="space-y-14">
        {GROUPS.map((group) => {
          const spaces = PREP_SPACES.filter((space) => space.category === group.category);
          if (spaces.length === 0) return null;

          return (
            <section key={group.category} aria-labelledby={`group-${group.category}`}>
              <div className="mb-5 flex flex-col gap-2 border-b border-[var(--line-1)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id={`group-${group.category}`} className="text-xl font-semibold text-[var(--steel-100)]">{group.title}</h2>
                  <p className="mt-1 text-sm text-[var(--steel-400)]">{group.description}</p>
                </div>
                <span className="text-xs text-[var(--steel-500)] tabular-nums">{spaces.length} {spaces.length === 1 ? "space" : "spaces"}</span>
              </div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
                {spaces.map((space) => <PrepSpaceCard key={space.id} space={space} />)}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mx-auto mt-12 max-w-3xl border-t border-[var(--line-1)] pt-6 text-xs leading-relaxed text-[var(--steel-400)]">
        Availability describes the tools currently released on MED Prep. It is not a claim of official exam endorsement or a guarantee that every exam topic is covered. Always check the current exam authority&apos;s syllabus and admission notice.
      </p>
    </div>
  );
}
