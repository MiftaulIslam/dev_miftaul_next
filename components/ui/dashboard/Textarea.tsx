import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { errorClass, fieldClass, hintClass, labelClass } from "./fieldStyles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ className, label, hint, error, ...props }: TextareaProps) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className={labelClass}>{label}</span> : null}
      <textarea
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, "min-h-[96px] py-2 leading-relaxed", className)}
      />
      {error ? <span className={cn("block", errorClass)}>{error}</span> : null}
      {hint && !error ? <span className={cn("block", hintClass)}>{hint}</span> : null}
    </label>
  );
}
