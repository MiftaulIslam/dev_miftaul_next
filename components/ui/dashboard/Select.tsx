import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { errorClass, fieldClass, hintClass, labelClass } from "./fieldStyles";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ className, label, hint, error, children, ...props }: SelectProps) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className={labelClass}>{label}</span> : null}
      <select
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, "h-9 cursor-pointer [color-scheme:dark]", className)}
      >
        {children}
      </select>
      {error ? <span className={cn("block", errorClass)}>{error}</span> : null}
      {hint && !error ? <span className={cn("block", hintClass)}>{hint}</span> : null}
    </label>
  );
}
