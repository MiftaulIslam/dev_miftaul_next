import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  headerSlot?: ReactNode;
}

export function Card({ title, subtitle, className, children, headerSlot }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_20px_60px_rgba(2,8,30,0.25)]",
        className,
      )}
    >
      {(title || subtitle || headerSlot) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-sm font-semibold text-white">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
          </div>
          {headerSlot}
        </header>
      )}
      {children}
    </section>
  );
}

