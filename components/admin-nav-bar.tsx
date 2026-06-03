"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Gamepad2, Star, Trophy, LogOut } from "lucide-react";

const links = [
  { href: "/admin", label: "Pregled", icon: LayoutDashboard },
  { href: "/admin/users", label: "Igrači", icon: Users },
  { href: "/admin/games", label: "Utakmice", icon: Gamepad2 },
  { href: "/admin/results", label: "Rezultati", icon: Star },
  { href: "/admin/leaderboard", label: "Tabela", icon: Trophy },
];

export default function AdminNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-black text-primary text-lg tracking-tight mr-4">
            ADMIN
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] ${
                    active
                      ? "bg-primary/10 text-primary shadow-[0_0_12px_rgba(245,197,24,0.15)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Igrački prikaz
          </Link>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Odjavi se"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-border overflow-x-auto">
        <nav className="flex px-2 py-1 gap-1 min-w-max">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}