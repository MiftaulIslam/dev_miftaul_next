import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ className, label, hint, error, ...props }: TextareaProps) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</span> : null}
      <textarea
        {...props}
        className={cn(
          "min-h-[88px] w-full rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400/55 focus:ring-2 focus:ring-blue-500/20",
          className,
        )}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

