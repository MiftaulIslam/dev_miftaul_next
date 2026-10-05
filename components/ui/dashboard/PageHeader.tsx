import type { ReactNode } from "react";

/** Top of every dashboard page: title, one-line purpose, primary actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Small status line under the description, e.g. "Saved 2 min ago". */
  meta?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-dash-border pb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-dash-fg">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-dash-fg-2">{description}</p> : null}
        {meta ? <div className="mt-2 text-xs text-dash-muted">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
