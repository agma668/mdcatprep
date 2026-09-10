import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InteractiveTile } from "@/components/landing/InteractiveTile";
import { Reveal } from "@/components/ui/Motion";

const MORE_COLLEGES = [
  {
    name: "Military College Jhelum",
    short: "MCJ",
    location: "Jhelum, Punjab",
    founded: "1925",
    class: "Class 8 Entry",
    subjects: ["Mathematics", "English", "Urdu", "General Science", "Islamiat"],
    highlight: "One of Pakistan's most prestigious institutions",
    gradient: "from-[#101c30] to-[#1a2b47]",
  },
  {
    name: "Military College Murree",
    short: "MCM",
    location: "Murree, Punjab",
    founded: "1947",
    class: "Class 8 Entry",
    subjects: ["Mathematics", "English", "Urdu", "Science", "IQ"],
    highlight: "Set in scenic Murree hills — highly sought after",
    gradient: "from-[#14263c] to-[#16302a]",
  },
  {
    name: "Aitchison College",
    short: "AC",
    location: "Lahore, Punjab",
    founded: "1886",
    class: "Various Entry Points",
    subjects: ["English", "Mathematics", "IQ", "General Knowledge"],
    highlight: "Highly competitive admission — one of the oldest",
    gradient: "from-[#15301f] to-[#1c4127]",
  },
  {
    name: "Lawrence College",
    short: "GCL",
    location: "Ghora Gali, Punjab",
    founded: "1860",
    class: "Class 6 / 9 Entry",
    subjects: ["Mathematics", "English", "IQ", "General Science"],
    highlight: "Historic hill station boarding school",
    gradient: "from-[#2e1c16] to-[#3d2a1d]",
  },
] as const;

export function MilitaryColleges() {
  return (
    <section
      id="military-colleges"
      aria-labelledby="military-colleges-heading"
      className="section-padding relative overflow-hidden bg-mesh"
    >
        <Reveal>
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(26,107,60,0.06)_0%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(200,151,42,0.05)_0%,transparent_62%)]"
      />
      <div className="container-page relative">
        <div className="text-center mb-14">
          <Badge variant="glass" className="mb-4">
            More Colleges
          </Badge>
          <h2
            id="military-colleges-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
          >
            Plus{" "}
            <span className="text-[var(--color-primary-light)]">More Colleges</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Beyond cadet colleges, Cadet College Prep prepares students for Pakistan&apos;s
            most prestigious boarding institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MORE_COLLEGES.map((college) => (
            <InteractiveTile key={college.short}>
            <Card
              variant="glass"
              padded={false}
              className="college-tile h-full overflow-hidden"
            >
              <div
                className={`bg-gradient-to-r ${college.gradient} p-6 text-white`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl font-extrabold font-mono opacity-90">
                    {college.short}
                  </span>
                  <Badge variant="accent">{college.class}</Badge>
                </div>
                <h3 className="text-lg font-bold leading-snug">
                  {college.name}
                </h3>
                <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {college.location} · Est. {college.founded}
                </p>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Entry Test Subjects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {college.subjects.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-white/10 border border-white/20 text-white/80 px-2 py-0.5 rounded-[var(--radius-sm)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-white/75 italic border-l-2 border-[var(--color-primary)] pl-3">
                  {college.highlight}
                </p>
              </div>
            </Card>
            </InteractiveTile>
          ))}
        </div>

        <p className="text-center text-sm text-white/50 mt-10">
          More institutions added regularly · Request your college below
        </p>
      </div>
            </Reveal>
      </section>
  );
}
