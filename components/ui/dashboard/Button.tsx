import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/40 shadow-[0_10px_30px_rgba(37,99,235,0.28)]",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/15",
  ghost: "bg-transparent text-slate-200 hover:bg-white/6 border border-white/12",
  danger: "bg-rose-600/90 text-white hover:bg-rose-500 border border-rose-400/40",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
    />
  );
}

