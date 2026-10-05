import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const styles: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "border-dash-accent/35 bg-dash-accent-soft text-[#c7d8ff]", icon: Info },
  success: { box: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", icon: CheckCircle2 },
  warning: { box: "border-amber-400/30 bg-amber-400/10 text-amber-200", icon: AlertTriangle },
  danger: { box: "border-red-400/35 bg-red-500/10 text-red-200", icon: XCircle },
};

/** Inline status message. Errors use role="alert" so screen readers announce them. */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = styles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className={cn("leading-relaxed", title && "mt-0.5 opacity-90")}>{children}</div> : null}
      </div>
      {action}
    </div>
  );
}
