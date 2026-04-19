import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ className, label, hint, error, children, ...props }: SelectProps) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</span> : null}
      <select
        {...props}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20",
          className,
        )}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

