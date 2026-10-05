"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[min(96vw,1200px)]",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "lg",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[min(90vh,880px)] w-full flex-col overflow-hidden rounded-xl border border-dash-border-strong bg-dash-surface shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
          sizes[size],
          className,
        )}
      >
        {(title || description) && (
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-dash-border px-5 py-4">
            <div>
              {title ? (
                <h2 className="text-base font-semibold text-dash-fg">{title}</h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-dash-muted">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-m-1 rounded-lg p-2 text-dash-muted transition-colors hover:bg-dash-raised hover:text-dash-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
