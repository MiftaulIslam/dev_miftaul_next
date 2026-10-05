"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Film, Inbox, Layers, Layers3, NotepadText, Star, Wrench, Hammer, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { SectionTitle } from "@/components/ui/dashboard/SectionTitle";
import { Skeleton } from "@/components/ui/dashboard/Skeleton";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import type { DashboardOverview, PortfolioSettings } from "@/lib/dashboard/types";

type CountKey = Exclude<keyof DashboardOverview, "lastUpdated">;

type Stat = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omitted when the overview endpoint doesn't count this content. */
  key?: CountKey;
  hint?: string;
};

/** Current content, linked to the page that manages it (hrefs match DashboardShell). */
const primaryStats: Stat[] = [
  { key: "v2Projects", label: "Projects", href: "/dashboard/projects-v2", icon: Film },
  { label: "Skills", href: "/dashboard/skills-v2", icon: Layers, hint: "Manage sections and items" },
  { key: "experiences", label: "Experience", href: "/dashboard/experience", icon: Wrench },
  { key: "blogPosts", label: "Blog posts", href: "/dashboard/blog", icon: NotepadText },
  { key: "reviews", label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { key: "messages", label: "Messages", href: "/dashboard/messages", icon: Inbox },
];

const legacyStats: Stat[] = [
  { key: "projects", label: "Projects v1", href: "/dashboard/projects", icon: Briefcase },
  { key: "skills", label: "Stack categories", href: "/dashboard/skills", icon: Layers3 },
  { key: "stackTools", label: "Tools in stacks", href: "/dashboard/skills", icon: Hammer },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OverviewPanel() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [overviewData, settingsData] = await Promise.all([
        requestJson<DashboardOverview>("/api/dashboard/overview"),
        requestJson<PortfolioSettings>("/api/dashboard/settings"),
      ]);
      setOverview(overviewData);
      setSettings(settingsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /** null while loading (skeleton), "—" if the load failed or nothing is counted. */
  const valueFor = (stat: Stat) => {
    if (!stat.key) return "—";
    if (overview) return overview[stat.key];
    return loading ? null : "—";
  };

  const focus = settings?.currentlyFocusedOn ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Content counts and your profile at a glance. Select a card to manage that content."
        meta={
          loading && !overview ? (
            <Skeleton className="h-4 w-40" />
          ) : overview?.lastUpdated ? (
            <span className="tabular-nums">Last activity {formatDateTime(overview.lastUpdated)}</span>
          ) : (
            "No activity yet"
          )
        }
      />

      {error ? (
        <Alert
          tone="danger"
          title="Couldn't load the overview"
          action={
            <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <section aria-labelledby="overview-content">
        <h2 id="overview-content" className="sr-only">
          Content
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {primaryStats.map((stat) => (
            <StatCard
              key={stat.href}
              label={stat.label}
              value={valueFor(stat)}
              icon={stat.icon}
              href={stat.href}
              hint={stat.hint}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Legacy v1"
          subtitle="Older content kept for reference. The live site uses the pages above."
        />
        <ul className="grid gap-2 sm:grid-cols-3">
          {legacyStats.map((stat) => {
            const Icon = stat.icon;
            const value = valueFor(stat);
            return (
              <li key={stat.label}>
                <Link
                  href={stat.href}
                  className="flex items-center gap-3 rounded-lg border border-dash-border px-3 py-2.5 text-sm text-dash-fg-2 transition-colors hover:bg-dash-raised hover:text-dash-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
                >
                  <Icon className="size-4 shrink-0 text-dash-muted" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{stat.label}</span>
                  {value === null ? (
                    <Skeleton className="h-5 w-6" />
                  ) : (
                    <span className="font-medium text-dash-fg tabular-nums">{value}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Card
        title="Profile"
        subtitle="From Settings. This is what visitors see in the hero and about sections."
        headerSlot={
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-dash-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
          >
            Edit in Settings
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
      >
        {loading && !settings ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          <dl className="space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="text-[13px] text-dash-muted">Name</dt>
              <dd className="font-medium text-dash-fg">{settings?.name || "—"}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="text-[13px] text-dash-muted">Availability</dt>
              <dd className="text-dash-fg-2">{settings?.availability || "—"}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="text-[13px] text-dash-muted">Focused on</dt>
              <dd>
                {focus.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {focus.map((item, i) => (
                      <li key={`${item}-${i}`}>
                        <Badge>{item}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-dash-fg-2">—</span>
                )}
              </dd>
            </div>
          </dl>
        )}
      </Card>
    </div>
  );
}
