import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border-strong px-6 py-12 text-center">
      {Icon ? (
        <span className="mb-3 grid size-10 place-items-center rounded-lg bg-dash-raised text-dash-muted">
          <Icon className="size-5" aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-dash-fg">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-dash-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
