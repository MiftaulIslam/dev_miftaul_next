import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { errorClass, fieldClass, hintClass, labelClass } from "./fieldStyles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ className, label, hint, error, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className={labelClass}>{label}</span> : null}
      <input {...props} aria-invalid={error ? true : undefined} className={cn(fieldClass, "h-9", className)} />
      {error ? <span className={cn("block", errorClass)}>{error}</span> : null}
      {hint && !error ? <span className={cn("block", hintClass)}>{hint}</span> : null}
    </label>
  );
}
