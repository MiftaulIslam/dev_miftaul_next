"use client";

import { useEffect, useState } from "react";
import { Activity, Briefcase, Film, Inbox, Layers3, MessageSquare, NotepadText, Sparkles, Star } from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Card } from "@/components/ui/dashboard/Card";
import type { DashboardOverview, PortfolioSettings } from "@/lib/dashboard/types";

const kpiConfig = [
  {
    key: "projects" as const,
    label: "Projects (v1)",
    icon: Briefcase,
    gradient: "from-blue-500/25 to-blue-600/5",
    ring: "shadow-[0_0_0_1px_rgba(59,130,246,0.25)]",
    iconBg: "bg-blue-500/15 text-blue-300",
  },
  {
    key: "v2Projects" as const,
    label: "Reel projects (v2)",
    icon: Film,
    gradient: "from-indigo-500/22 to-indigo-600/5",
    ring: "shadow-[0_0_0_1px_rgba(99,102,241,0.22)]",
    iconBg: "bg-indigo-500/15 text-indigo-300",
  },
  {
    key: "reviews" as const,
    label: "Reviews",
    icon: Star,
    gradient: "from-amber-500/20 to-amber-600/5",
    ring: "shadow-[0_0_0_1px_rgba(245,158,11,0.22)]",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  {
    key: "experiences" as const,
    label: "Experience",
    icon: Activity,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    ring: "shadow-[0_0_0_1px_rgba(16,185,129,0.22)]",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  {
    key: "skills" as const,
    label: "Stack categories",
    icon: Layers3,
    gradient: "from-violet-500/22 to-violet-600/5",
    ring: "shadow-[0_0_0_1px_rgba(139,92,246,0.22)]",
    iconBg: "bg-violet-500/15 text-violet-300",
  },
  {
    key: "blogPosts" as const,
    label: "Blog posts",
    icon: NotepadText,
    gradient: "from-cyan-500/20 to-cyan-600/5",
    ring: "shadow-[0_0_0_1px_rgba(34,211,238,0.2)]",
    iconBg: "bg-cyan-500/15 text-cyan-300",
  },
  {
    key: "stackTools" as const,
    label: "Tools in stacks",
    icon: MessageSquare,
    gradient: "from-pink-500/18 to-pink-600/5",
    ring: "shadow-[0_0_0_1px_rgba(236,72,153,0.2)]",
    iconBg: "bg-pink-500/15 text-pink-300",
  },
  {
    key: "messages" as const,
    label: "Messages",
    icon: Inbox,
    gradient: "from-sky-500/20 to-sky-600/5",
    ring: "shadow-[0_0_0_1px_rgba(14,165,233,0.24)]",
    iconBg: "bg-sky-500/15 text-sky-300",
  },
] as const;

export default function OverviewPanel() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const [overviewData, settingsData] = await Promise.all([
          requestJson<DashboardOverview>("/api/dashboard/overview"),
          requestJson<PortfolioSettings>("/api/dashboard/settings"),
        ]);
        setOverview(overviewData);
        setSettings(settingsData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Overview</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Live counts and profile snapshot — keep content in sync with your public site.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            {overview?.lastUpdated
              ? `Last activity ${new Date(overview.lastUpdated).toLocaleString()}`
              : "No activity yet"}
          </div>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-500/30 bg-rose-950/30">
          <p className="text-sm text-rose-300">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiConfig.map((item) => {
          const Icon = item.icon;
          const val = overview ? overview[item.key] : null;
          return (
            <div
              key={item.key}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${item.gradient} p-5 ${item.ring}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-white">
                    {val === null ? "—" : val}
                  </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Profile"
          subtitle="Pulled from Settings — what visitors see in hero & about."
          className="border-white/10 bg-slate-950/40"
        >
          <div className="space-y-3 text-sm">
            <p className="text-slate-200">
              <span className="text-slate-500">Name · </span>
              {settings?.name ?? "…"}
            </p>
            <p className="text-slate-200">
              <span className="text-slate-500">Availability · </span>
              {settings?.availability ?? "…"}
            </p>
            <p className="text-slate-200">
              <span className="text-slate-500">Focused on · </span>
              {(settings?.currentlyFocusedOn ?? []).join(", ") || "—"}
            </p>
          </div>
        </Card>

        <Card title="Quick tips" subtitle="Ship a cohesive portfolio." className="border-white/10 bg-slate-950/40">
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-mono text-xs text-cyan-400/90">01</span>
              Sync Projects & Experience so the landing page stories match.
            </li>
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-mono text-xs text-cyan-400/90">02</span>
              Update Settings when contact info or avatars change.
            </li>
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-mono text-xs text-cyan-400/90">03</span>
              Use stack colors & tech icons for consistent visual branding.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
