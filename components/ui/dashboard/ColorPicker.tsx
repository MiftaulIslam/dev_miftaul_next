"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/cn";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
};

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  function ColorPicker({ label, value, onChange, className, id }, ref) {
    const safe = /^#[0-9A-Fa-f]{6}$/.test(value?.trim() ?? "") ? value.trim() : "#3b82f6";
    return (
      <label className={cn("block space-y-1.5", className)} htmlFor={id}>
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</span>
        <div className="flex gap-2">
          <input
            ref={ref}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-blue-400/55 focus:ring-2 focus:ring-blue-500/20"
            placeholder="#3b82f6"
            autoComplete="off"
          />
          <input
            type="color"
            className="h-10 w-14 shrink-0 cursor-pointer rounded-xl border border-white/12 bg-slate-900/80 p-1 shadow-inner"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color`}
          />
        </div>
      </label>
    );
  },
);
