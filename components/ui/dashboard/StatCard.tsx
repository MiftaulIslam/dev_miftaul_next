import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

/** One KPI: big tabular number, label, optional link to where it is managed. */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: number | string | null;
  icon?: LucideIcon;
  href?: string;
  hint?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-dash-fg-2">{label}</span>
        {Icon ? <Icon className="size-4 text-dash-muted" aria-hidden /> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-dash-fg tabular-nums">
        {value === null ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-dash-raised align-middle" /> : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-dash-muted">{hint}</p> : null}
    </>
  );
  const box = "block rounded-xl border border-dash-border bg-dash-surface p-4";
  return href ? (
    <Link
      href={href}
      className={cn(
        box,
        "transition-colors hover:border-dash-border-strong hover:bg-dash-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}
