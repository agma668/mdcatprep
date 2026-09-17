"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/telemetry";

/**
 * A Link that reports its own clicks as a `cta_click` telemetry event
 * (destination + optional label — nothing else, no PII). Works from server
 * components (it IS the client boundary), so any CTA on the site can carry
 * tracking with a one-line swap of <Link> → <TrackedLink>. Navigation is
 * never delayed or gated on the report: fire-and-forget, like all telemetry.
 */
export function TrackedLink({
  to,
  label,
  className,
  children,
  prefetch,
  onClick,
  ...rest
}: {
  to: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
  prefetch?: boolean;
  onClick?: () => void;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children" | "prefetch" | "onClick">) {
  return (
    <Link
      href={to}
      prefetch={prefetch}
      className={className}
      onClick={() => {
        trackEvent("cta_click", { to, ...(label ? { label } : {}) });
        onClick?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
