"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, Trophy, User, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Početna", icon: LayoutDashboard },
  { href: "/predictions", label: "Tipovi", icon: ListChecks },
  { href: "/leaderboard", label: "Tabela", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
];

export default function NavBar({
  username,
  role,
}: {
  username: string;
  role: "admin" | "user";
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-black text-primary text-xl tracking-tight">
            TIP LIGA
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{username}</span>
            {role === "admin" && (
              <Link
                href="/admin"
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Odjavi se"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background">
        <div className="max-w-2xl mx-auto grid grid-cols-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom nav */}
      <div className="h-16" aria-hidden />
    </>
  );
}