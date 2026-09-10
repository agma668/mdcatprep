import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin Dashboard | Cadet College Prep",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold text-sm">
            A
          </div>
          <span className="font-bold text-[var(--color-text-primary)] text-lg hidden md:block">
            Admin Control Panel
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AdminNav />
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hidden lg:block"
          >
            Student View
          </Link>
          <form action={async () => {
            'use server'
            const { logout } = await import('@/app/actions/auth')
            await logout()
          }}>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </form>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
