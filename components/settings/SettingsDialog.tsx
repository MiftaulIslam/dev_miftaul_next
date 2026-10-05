"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Modal used by settings sections that need more room than the panel — e.g.
 * configuring one cursor's options.
 *
 * Deliberately *not* portalled to `document.body`: the settings panel closes on
 * any pointerdown outside its own subtree, so a portalled dialog would dismiss
 * the panel underneath it the moment you touched a slider. Rendering it inside
 * the panel's tree keeps that logic honest while `fixed inset-0` still centres
 * it over the page.
 */
export default function SettingsDialog({
  open,
  title,
  onClose,
  children,
  footer,
  size = "default",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** "wide" suits dialogs with tabs or side-by-side controls. */
  size?: "default" | "wide";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Stays true through the exit animation, so the dialog can animate out.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Stop the settings panel's own Escape handler from also firing, so one
      // press closes one layer.
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!shown) return null;

  // Enter/exit are CSS (`.ui-fade`, `.ui-pop` in globals.css); the dialog stays
  // mounted through "closing" so the exit can play.
  const state = open ? "open" : "closing";
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      {/* Blur signals that tapping the backdrop dismisses. */}
      <div
        data-state={state}
        onClick={onClose}
        className="ui-fade absolute inset-0 bg-background/60 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-state={state}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && !open) setShown(false);
        }}
        className={cn(
          "ui-pop glass relative overflow-hidden rounded-2xl shadow-2xl focus:outline-none",
          size === "wide"
            ? "w-[min(calc(100vw-2rem),32rem)]"
            : "w-[min(calc(100vw-2rem),24rem)]"
        )}
      >
        <header className="flex items-center justify-between border-b border-foreground/10 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-foreground/5 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="max-h-[min(70vh,26rem)] overflow-y-auto px-5 py-3">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-foreground/10 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
