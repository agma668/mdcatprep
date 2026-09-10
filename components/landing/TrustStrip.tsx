import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { COLLEGES, COLLEGES_WITH_PAGES } from "@/lib/college-list";
import { getWhatsAppLink } from "@/lib/site";

// The five major colleges every prospective cadet knows by name. The strip is
// a compact inline proof of coverage under the hero — it lists the majors
// first, then a "+ more" link to the full carousel. The hero's "Colleges
// Covered" count comes from COLLEGES.length so the strip and the hero stat
// can never drift apart.

const PRIMARY_ORDER = ["cch", "paf-sargodha", "mcj", "kohat", "petaro"] as const;

export function TrustStrip() {
  const primary = PRIMARY_ORDER
    .map((slug) => COLLEGES.find((c) => c.slug === slug))
    .filter((c): c is (typeof COLLEGES)[number] => Boolean(c));
  const restCount = COLLEGES.length - primary.length;

  return (
    <section
      aria-label="Colleges covered"
      className="border-y border-[var(--line-2)] bg-[var(--field-2)] py-5"
    >
      <div className="container-page">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="label inline-flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-[var(--signal-300)]" />
            Pattern-based prep for every major cadet college in Pakistan
          </p>
          <ul
            role="list"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {primary.map((college) => {
              const hasPage = COLLEGES_WITH_PAGES.has(college.slug);
              const href = hasPage ? `/colleges/${college.slug}` : getWhatsAppLink();
              const target = hasPage ? undefined : "_blank";
              return (
                <li key={college.slug}>
                  <Link
                    href={href}
                    target={target}
                    rel={target ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--steel-200)] transition-colors hover:text-[var(--signal-200)]"
                  >
                    <span
                      aria-hidden="true"
                      className="relative h-6 w-6 overflow-hidden rounded-md bg-[var(--srf-2)] ring-1 ring-[var(--line-2)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:-translate-y-px"
                    >
                      <Image
                        src={college.logo}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-contain"
                      />
                    </span>
                    <span>{college.name}</span>
                  </Link>
                </li>
              );
            })}
            {restCount > 0 && (
              <li>
                <a
                  href="#cadet-colleges"
                  className="nav-link text-sm font-semibold"
                >
                  + {restCount} more colleges
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
