"use client";

import { useState, useEffect } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { Button } from "@/components/ui/Button";
import { CompassLogo } from "@/components/landing/CompassLogo";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "All Tests", href: "/exams" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Past Papers", href: "#past-papers" },
  { label: "Free Flashcards", href: "/flashcards" },
  { label: "Daily Quiz", href: "/daily-quiz" },
  { label: "Founder", href: "/founder" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
] as const;

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Warm the client router cache for the auth routes: these buttons use
  // router.push (which never prefetches), so a click used to start the
  // page fetch from zero — on a high-latency link that read as "the sign-in
  // page is slow to open". With the prefetch done during idle time on the
  // landing page, the click navigates instantly (middleware no longer adds
  // a Supabase round trip for anonymous visitors either).
  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/signup");
  }, [router]);

  // Close on resize (breakpoint change) and on Escape — a panel with
  // role="dialog" that ignores Escape is a keyboard trap.
  useEffect(() => {
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header role="banner" className="fixed inset-x-0 top-0 z-50">
      {/* The navigation material: the one translucent layer on the page. It
          fades in on scroll instead of popping, and it is never stacked with
          another blurred surface (see .nav-material in globals.css, which also
          carries the opaque fallback for browsers without backdrop-filter and
          for prefers-reduced-transparency). */}
      <div
        aria-hidden="true"
        className="nav-material pointer-events-none absolute inset-0 transition-opacity duration-[var(--dur-3)] ease-[var(--ease-out-quart)]"
        style={{ opacity: isScrolled ? 1 : 0 }}
      />

      <div className="container-page nav-safe relative z-10">
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="flex items-center justify-between h-16 md:h-18"
        >
          {/* Logo — the compass mark is insignia, so it keeps the brass. */}
          <TrackedLink
            to="/"
            label="navbar-logo"
            aria-label="MED Prep — Home"
            className="group flex items-center gap-2.5 rounded-[var(--radius-md)]"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-brass)] bg-[var(--field-0)] shadow-[var(--glow-brass)] transition-transform duration-[var(--dur-2)] ease-[var(--ease-out-quart)] group-hover:-translate-y-px"
            >
              <CompassLogo size={25} />
            </span>
            <span className="text-xl font-bold tracking-[-0.02em] text-[var(--steel-100)]">
              MED Prep
            </span>
          </TrackedLink>

          {/* Desktop links. Plain anchors, no click handler: `html` already
              carries `scroll-behavior: smooth` and `scroll-padding-top`, so the
              browser eases to the section and stops clear of this bar. The
              handler that used to sit here called scrollIntoView({behavior:
              'smooth'}) after preventDefault, which fought Lenis's own anchor
              animation on desktop and left the URL without the hash, so a
              section could not be linked to or reached with the back button. */}
          <ul role="list" className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="nav-link px-3 py-2 text-sm font-medium">
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
              Get Started Free
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={[
              "tap-44 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-md)] md:hidden",
              "transition-colors hover:bg-[var(--srf-2)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-300)]",
            ].join(" ")}
          >
            <span
              className={[
                "block h-0.5 w-5 rounded-full bg-[var(--steel-100)] transition-all duration-[var(--dur-2)]",
                menuOpen ? "translate-y-2 rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block h-0.5 w-5 rounded-full bg-[var(--steel-100)] transition-all duration-[var(--dur-2)]",
                menuOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block h-0.5 w-5 rounded-full bg-[var(--steel-100)] transition-all duration-[var(--dur-2)]",
                menuOpen ? "-translate-y-2 -rotate-45" : "",
              ].join(" ")}
            />
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Mobile navigation"
          className="menu-in border-t border-[var(--line-2)] bg-[var(--field-0)] shadow-[var(--shadow-xl)] md:hidden"
        >
          <ul role="list" className="container-page nav-safe flex flex-col gap-1 py-4">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-[var(--steel-300)] transition-colors hover:bg-[var(--srf-2)] hover:text-[var(--steel-100)]"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="flex flex-col gap-2 border-t border-[var(--line-2)] pt-3">
              <div className="flex items-center justify-between">
                <span className="label px-1">Theme</span>
                <ThemeSwitcher />
              </div>
              <Button variant="secondary" size="md" fullWidth onClick={() => { setMenuOpen(false); router.push("/login"); }}>
                Sign In
              </Button>
              <Button variant="primary" size="md" fullWidth onClick={() => { setMenuOpen(false); router.push("/signup"); }}>
                Get Started Free
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
