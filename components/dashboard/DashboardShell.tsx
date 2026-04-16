"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { cn } from "@/lib/cn";

const menus = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpenText },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquareMore },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/skills", label: "Skills", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/dashboard/experience", label: "Experience", icon: Wrench },
] as const;

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [logoutPending, setLogoutPending] = useState(false);
  const [error, setError] = useState("");

  const logout = async () => {
    setError("");
    setLogoutPending(true);
    try {
      await requestJson("/api/dashboard/auth", { method: "DELETE" });
      window.location.href = "/dashboard";
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Failed to logout.");
      setLogoutPending(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#020617] text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(59,130,246,0.22),transparent_50%),radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(139,92,246,0.12),transparent_45%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(16,185,129,0.08),transparent_40%)]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1">
        <aside className="flex w-[min(100%,288px)] shrink-0 flex-col border-r border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
          <div className="border-b border-white/[0.06] px-5 py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">Portfolio</h1>
            <p className="mt-0.5 text-xs text-slate-500">Control center</p>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = pathname === menu.href;
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    active
                      ? "bg-linear-to-r from-blue-500/20 to-cyan-500/10 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-cyan-300" : "text-slate-500")} />
                  {menu.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white"
              onClick={() => void logout()}
              disabled={logoutPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutPending ? "Logging out…" : "Logout"}
            </Button>
            {error ? <p className="mt-2 px-1 text-xs text-rose-300">{error}</p> : null}
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
