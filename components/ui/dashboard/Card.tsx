import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  headerSlot?: ReactNode;
  /** Drop the body padding, e.g. for edge-to-edge lists and tables. */
  flush?: boolean;
}

export function Card({ title, subtitle, className, children, headerSlot, flush }: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerSlot);
  return (
    <section className={cn("rounded-xl border border-dash-border bg-dash-surface", !flush && "p-5", className)}>
      {hasHeader && (
        <header
          className={cn(
            "flex flex-wrap items-start justify-between gap-3",
            flush ? "border-b border-dash-border px-5 py-4" : "mb-4",
          )}
        >
          <div className="min-w-0">
            {title ? <h3 className="text-[15px] font-semibold text-dash-fg">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-[13px] leading-relaxed text-dash-muted">{subtitle}</p> : null}
          </div>
          {headerSlot}
        </header>
      )}
      {children}
    </section>
  );
}
