"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  BriefcaseBusiness,
  ExternalLink,
  Film,
  Layers,
  LayoutDashboard,
  LogOut,
  Mailbox,
  Menu,
  MessageSquareMore,
  Settings,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; icon: LucideIcon };

/** Grouped by what the owner is doing, with the frozen v1 editors set apart. */
const NAV: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Inbox",
    items: [
      { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/messages", label: "Messages", icon: Mailbox },
      { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquareMore },
    ],
  },
  {
    heading: "Portfolio",
    items: [
      { href: "/dashboard/projects-v2", label: "Projects", icon: Film },
      { href: "/dashboard/skills-v2", label: "Skills", icon: Layers },
      { href: "/dashboard/experience", label: "Experience", icon: Wrench },
      { href: "/dashboard/blog", label: "Blog", icon: BookOpenText },
    ],
  },
  {
    heading: "Site",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
  {
    heading: "Legacy (v1 site)",
    items: [
      { href: "/dashboard/projects", label: "Projects v1", icon: BriefcaseBusiness },
      { href: "/dashboard/skills", label: "Skills v1", icon: Sparkles },
    ],
  },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [logoutPending, setLogoutPending] = useState(false);
  const [error, setError] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const logout = async () => {
    setError("");
    setLogoutPending(true);
    try {
      await requestJson("/api/dashboard/auth", { method: "DELETE" });
      window.location.href = "/dashboard";
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Failed to log out.");
      setLogoutPending(false);
    }
  };

  const current = NAV.flatMap((g) => g.items).find((item) => item.href === pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-dash-border px-4">
        <span className="grid size-7 place-items-center rounded-md bg-dash-accent text-xs font-bold text-white">M</span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold text-dash-fg">Portfolio admin</p>
          <p className="text-xs text-dash-muted">miftaul.dev</p>
        </div>
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.heading}>
            <p className="mb-1.5 px-2.5 text-xs font-medium text-dash-muted">{group.heading}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60",
                        active
                          ? "bg-dash-raised text-dash-fg before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-dash-accent"
                          : "text-dash-fg-2 hover:bg-dash-raised/60 hover:text-dash-fg",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-dash-accent" : "text-dash-muted")} aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-dash-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-dash-fg-2 transition-colors hover:bg-dash-raised hover:text-dash-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
        >
          <ExternalLink className="size-4 text-dash-muted" aria-hidden />
          View live site
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={logoutPending}
          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-dash-fg-2 transition-colors hover:bg-dash-raised hover:text-dash-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60 disabled:opacity-50"
        >
          <LogOut className="size-4 text-dash-muted" aria-hidden />
          {logoutPending ? "Logging out…" : "Log out"}
        </button>
        {error ? <p className="px-2.5 pt-1 text-xs text-dash-danger">{error}</p> : null}
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-dash-bg text-dash-fg antialiased [color-scheme:dark]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-dash-border bg-dash-sidebar lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-dash-border bg-dash-sidebar shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
              className="absolute right-2 top-3 grid size-8 place-items-center rounded-lg text-dash-muted hover:bg-dash-raised hover:text-dash-fg"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-dash-border bg-dash-sidebar px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-dash-fg-2 hover:bg-dash-raised hover:text-dash-fg"
          >
            <Menu className="size-5" />
          </button>
          <p className="truncate text-sm font-semibold">{current?.label ?? "Dashboard"}</p>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-dash-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
