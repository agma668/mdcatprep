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
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    description: "Limited tools are available. Check the listed capabilities before starting.",
  },
  content_in_progress: {
    label: "In development",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    description: "This preparation space is being built and reviewed.",
  },
  coming_soon: {
    label: "Coming soon",
    className: "border-border bg-muted text-muted-foreground",
    description: "Not yet open for practice.",
  },
};

function CapabilityList({ space }: { space: PrepSpaceDefinition }) {
  if (space.capabilities.length === 0) {
    return <p className="text-xs text-muted-foreground">No learning tools are open yet.</p>;
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
        <li key={capability} className="rounded-lg border border-border/70 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
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
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
          {status.label}
        </span>
        {canEnter ? (
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug text-foreground">{space.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{space.summary}</p>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Available tools</p>
        <CapabilityList space={space} />
      </div>

      <div className="mt-auto pt-5">
        {canEnter ? (
          <Link
            href={space.legacyRoute!}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Enter ${space.name} preparation`}
          >
            Open Prep Space <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-muted-foreground" aria-label={status.description}>
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          One account · Multiple preparation spaces
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Choose your preparation space
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Choose the exam you are preparing for. Each space has its own tools and readiness status, while your Apex account stays the same.
        </p>
      </header>

      <div className="space-y-10">
        {GROUPS.map((group) => {
          const spaces = PREP_SPACES.filter((space) => space.category === group.category);
          if (spaces.length === 0) return null;

          return (
            <section key={group.category} aria-labelledby={`group-${group.category}`}>
              <div className="mb-4">
                <h2 id={`group-${group.category}`} className="text-xl font-bold text-foreground">{group.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {spaces.map((space) => <PrepSpaceCard key={space.id} space={space} />)}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
        Availability describes the tools currently released on Apex; it is not a claim of official exam endorsement or a guarantee that every exam topic is covered.
      </p>
    </div>
  );
}
