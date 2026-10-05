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
        <span className="text-[13px] font-medium text-dash-fg-2">{label}</span>
        <div className="flex gap-2">
          <input
            ref={ref}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-dash-border-strong bg-dash-field px-3 font-mono text-sm text-dash-fg outline-none transition-colors placeholder:text-dash-muted focus:border-dash-accent focus:ring-2 focus:ring-dash-accent/25"
            placeholder="#3b82f6"
            autoComplete="off"
          />
          <input
            type="color"
            className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-dash-border-strong bg-dash-field p-1"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color`}
          />
        </div>
      </label>
    );
  },
);
