"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarLeaderboard } from "./SidebarLeaderboard";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { CompassLogo } from "@/components/landing/CompassLogo";
import {
  Home,
  BarChart3,
  Target,
  BookOpen,
  AlertTriangle,
  User,
  ChevronLeft,
  LogOut,
  ClipboardList,
  Trophy,
  Layers,
  Network,
} from "lucide-react";

// The icon well behind each nav glyph. This used to be two strings repeated
// verbatim on all eight items — sixteen copies of the same pair, so the config
// looked like it encoded something per destination and encoded nothing. Hoisted
// here, where changing the well is one edit instead of eight.
//
// One item did differ: Leaderboard shipped a signal-tinted well at REST, so its
// glyph read as selected on every other page. Colour is the only thing marking
// the current page in this rail, and a permanent false positive spends it.
const WELL_IDLE = "bg-[var(--srf-2)] text-[var(--steel-400)]";
const WELL_ACTIVE = "bg-[var(--signal-500)]/15 text-[var(--signal-200)]";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Overview", shortLabel: "Home" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", shortLabel: "Analytics" },
  { href: "/dashboard/practice", icon: Target, label: "Practice", shortLabel: "Practice" },
  { href: "/dashboard/mock-test", icon: ClipboardList, label: "Mock Test", shortLabel: "Mock Test" },
  { href: "/dashboard/notes", icon: BookOpen, label: "Important Notes", shortLabel: "Notes" },
  { href: "/dashboard/flashcards", icon: Layers, label: "Flashcards", shortLabel: "Cards" },
  { href: "/dashboard/diagrams", icon: Network, label: "Diagrams & Mindmaps", shortLabel: "Diagrams" },
  { href: "/dashboard/mistake-notebook", icon: AlertTriangle, label: "Mistake Notebook", shortLabel: "Mistakes" },
  { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard", shortLabel: "Ranks" },
  { href: "/dashboard/profile", icon: User, label: "Profile", shortLabel: "Profile" },
] as const;

type Profile = {
  full_name: string | null;
  email: string | null;
  exam_target: string | null;
  status: string | null;
} | null;

const COLLAPSE_KEY = "acma-sidebar-collapsed";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function LogoMark({ size = "md" }: { size?: "md" | "sm" }) {
  const tile =
    size === "md"
      ? "w-9 h-9 rounded-[var(--radius-md)]"
      : "w-8 h-8 rounded-[var(--radius-sm)]";
  return (
    <span
      className={`${tile} flex items-center justify-center shrink-0 bg-[var(--tint-brass)] ring-1 ring-[var(--line-brass)] shadow-[var(--glow-brass)]`}
    >
      <CompassLogo size={size === "md" ? 26 : 22} />
    </span>
  );
}

export function Sidebar({ profile, leaderboard }: { profile: Profile; leaderboard?: { entries: { rank: number; name: string; streak: number; accuracy: number; questions: number }[] } }) {
  const pathname = usePathname();
  const displayName = profile?.full_name?.trim() || "Student";
  const [collapsed, setCollapsed] = useState(false);

  // Restore the saved collapse state just after mount (never synchronously
  // in the effect body, so hydration and the linter stay happy).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const saved = localStorage.getItem(COLLAPSE_KEY);
      if (saved === "1") setCollapsed(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";

  return (
    <>
      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex flex-col ${sidebarWidth} shrink-0 sticky top-0 h-screen bg-[linear-gradient(180deg,var(--color-navy),#0a1a2e)] border-r border-white/[0.06] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out`}
        role="complementary"
        aria-label="Dashboard navigation"
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center border-b border-white/[0.07] ${collapsed ? "flex-col gap-3 px-2 py-4" : "gap-3 px-5 py-6"}`}>
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0" aria-label="MED Prep — Dashboard">
            <LogoMark />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block font-extrabold text-white text-lg tracking-tight leading-none">MED Prep</span>
                <span className="block text-[11px] text-white/45 font-medium mt-1 tracking-wide uppercase">MDCAT & NUMS Portal</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`${collapsed ? "mx-auto" : "ml-auto"} w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-colors cursor-pointer`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav role="navigation" aria-label="Dashboard menu" className="flex-1 py-5 px-3 space-y-6">
          <ul role="list" className="flex flex-col gap-1">
            {!collapsed && (
              <li className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Menu</li>
            )}
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    className={[
                      "group flex items-center gap-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                      active
                        ? "bg-[linear-gradient(135deg,var(--signal-500),var(--signal-600)_55%,var(--signal-700))] text-[var(--on-cta)] shadow-[var(--glow-signal-md)]"
                        : "text-[var(--steel-300)] hover:text-[var(--steel-100)] hover:bg-[var(--srf-2)]",
                    ].join(" ")}
                  >
                    <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${active ? "bg-black/20 text-[var(--on-cta)]" : WELL_IDLE} group-hover:scale-110`}>
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </span>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Leaderboard — hide when collapsed */}
        {!collapsed && leaderboard && leaderboard.entries.length > 0 && (
          <SidebarLeaderboard entries={leaderboard.entries} />
        )}

        {/* User */}
        <div className={`border-t border-white/[0.07] ${collapsed ? "px-2 py-4" : "px-4 py-5"}`}>
          <div className={`flex items-center rounded-[var(--radius-md)] bg-white/[0.04] ring-1 ring-white/[0.08] backdrop-blur-sm ${collapsed ? "justify-center p-2" : "gap-3 p-3"}`}>
            {/* signal-600 -> -700, not -300 -> -200. The lighter pair is accent
                TYPE on the dark field; filling a disc with it and setting ink
                on top is where the 1.95:1 pairings in this app came from. This
                pair is the measured white-ink fill (5.9:1 / 8.6:1). */}
            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-[var(--on-cta)] font-bold text-sm bg-[linear-gradient(135deg,var(--signal-600),var(--signal-700))] shadow-[var(--shadow-md)]">
              {initials(displayName)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-white/55 truncate">{profile?.exam_target || "Cadet College Prep"}</p>
              </div>
            )}
            {!collapsed && (
              <form action={logout}>
                <button type="submit" aria-label="Log out" title="Log out" className="p-1.5 -m-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </form>
            )}
          </div>
          {collapsed && (
            <form action={logout} className="mt-2 flex justify-center">
              <button type="submit" aria-label="Log out" title="Log out" className="p-1.5 -m-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-[linear-gradient(90deg,var(--color-navy),#0a1a2e)] border-b border-white/10 flex items-center justify-between px-4 h-14 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
        <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="MED Prep — Dashboard">
          <LogoMark size="sm" />
          <span className="font-extrabold text-white tracking-tight">MED Prep</span>
        </Link>
        <form action={logout}>
          <button type="submit" aria-label="Log out" className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </form>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[var(--field-2)] border-t border-[var(--line-2)] pb-[env(safe-area-inset-bottom)]" role="navigation" aria-label="Mobile dashboard navigation">
        <ul role="list" className="flex items-stretch justify-around gap-0 px-1 pt-1.5 [scrollbar-width:none]">
          {NAV_ITEMS.map(({ href, icon: Icon, shortLabel }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex-1 min-w-0">
                <Link href={href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1 px-1 py-1.5">
                  <span className={`flex items-center justify-center w-9 h-6 rounded-full transition-all duration-200 ${active ? WELL_ACTIVE : WELL_IDLE}`}>
                    <Icon className="w-[19px] h-[19px]" />
                  </span>
                  <span className={`text-[9.5px] font-semibold leading-tight text-center truncate w-full transition-colors ${active ? "text-[var(--steel-100)]" : "text-[var(--steel-400)]"}`}>
                    {shortLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
