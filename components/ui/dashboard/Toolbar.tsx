import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/cn";
import { fieldClass } from "./fieldStyles";

/** Row above a list: search on the left, filters/actions on the right. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="relative block min-w-[200px] flex-1 sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dash-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(fieldClass, "h-9 pl-9")}
      />
    </label>
  );
}
