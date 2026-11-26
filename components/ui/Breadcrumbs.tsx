import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site";

/**
 * A visible breadcrumb trail and the BreadcrumbList that describes it.
 *
 * The two ship together on purpose: the SEO board's rule is to mark up
 * breadcrumbs that exist, never to emit structured data for a trail a reader
 * cannot see. Deep pages used to carry a single "← back" link, which gave a
 * reader no position and a crawler no path.
 */

export type Crumb = {
  name: string;
  /** Omitted on the last crumb — the current page is not a link. */
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol role="list" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--steel-600)]" aria-hidden="true" />
              )}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="font-medium text-[var(--signal-300)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="text-[var(--steel-400)]"
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
