import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-dash-fg">{title}</h2>
        {subtitle ? <p className="mt-1 text-[13px] leading-relaxed text-dash-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
