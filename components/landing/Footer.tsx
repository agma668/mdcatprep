import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { CompassLogo } from "@/components/landing/CompassLogo";
import { getTelLink, getWhatsAppLink } from "@/lib/site";

const FOOTER_LINKS = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Universities", href: "#cadet-colleges" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#cta" },
  ],
  Prepare: [
    { label: "Daily Quiz", href: "/daily-quiz" },
    { label: "Diagnostic Test", href: "/diagnostic" },
    { label: "Resources & Notes", href: "/resources" },
    { label: "MDCAT Guide", href: "/blog/mdcat-guide" },
  ],
  Company: [
    { label: "Founder", href: "/founder" },
    { label: "Blog", href: "/blog" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Copyright & Terms", href: "/copyright" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--line-2)] bg-[var(--field-0)] text-[var(--steel-200)]"
    >
      <div className="container-page py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              aria-label="MED Prep — Home"
              className="group mb-4 inline-flex items-center gap-2"
            >
              {/* Brass, here and on the nav mark only: the insignia is the one
                  place the metal is allowed. */}
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-brass)] bg-[var(--field-0)] shadow-[var(--glow-brass)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:-translate-y-px">
                <CompassLogo size={25} />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-[var(--steel-100)]">
                MED Prep
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--steel-300)]">
              A non-profit community initiative helping students across Pakistan prepare for MDCAT and NUMS — built with the mission of making quality education accessible to everyone.
            </p>
            <p className="mt-4 text-sm text-[var(--steel-300)]">
              <span className="font-semibold text-[var(--steel-100)]">Questions?</span> Call/WhatsApp:{" "}
              <a href={getTelLink()} className="text-[var(--signal-200)] hover:underline">
                0319-3051175
              </a>
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="tap-44 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-2)] bg-[var(--srf-1)] text-[var(--steel-200)] transition-colors duration-[var(--dur-1)] hover:bg-[var(--whatsapp)] hover:text-[var(--color-text-inverse)]"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-[var(--steel-100)]">
                {title}
              </h3>
              <ul role="list" className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-[var(--steel-300)] transition-colors duration-[var(--dur-1)] hover:text-[var(--steel-100)]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--line-2)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--steel-400)]">
            &copy; {year} MED Prep. All rights reserved.{" "}
            <Link href="/copyright" className="underline hover:text-[var(--steel-200)]">
              Copyright &amp; Terms
            </Link>
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-[var(--steel-400)] transition-colors duration-[var(--dur-1)] hover:text-[var(--steel-200)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/faq"
              className="text-xs text-[var(--steel-400)] transition-colors duration-[var(--dur-1)] hover:text-[var(--steel-200)]"
            >
              Help &amp; FAQ
            </Link>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--steel-400)] transition-colors duration-[var(--dur-1)] hover:text-[var(--steel-200)]"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
