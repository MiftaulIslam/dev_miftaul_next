"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, X } from "lucide-react";

import { useDockVisible } from "@/lib/navShell";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS } from "./sections";

/**
 * Floating settings dial, bottom-right.
 *
 * A generic shell: it owns the trigger, the popover, focus handling and the
 * dismiss routes, and renders whatever `SETTINGS_SECTIONS` lists. Adding a new
 * preference never touches this file.
 *
 * The gear spins via the shared `.animate-spin-slow` utility, which
 * `globals.css` already neutralises under `prefers-reduced-motion`.
 */
export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const { visible: dockVisible, isMobile } = useDockVisible();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Dismiss on outside pointer or Escape. Escape returns focus to the trigger
  // so a keyboard visitor is not dropped at the top of the document.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus into the panel on open so Tab continues inside it.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed right-5 z-[60] flex flex-col items-end gap-3 transition-[bottom] duration-300 sm:right-8",
        // The dock spans almost the full width on a small screen, so the dial
        // steps up over it rather than sitting on top of the last item.
        dockVisible && isMobile ? "bottom-[6.5rem]" : "bottom-5 sm:bottom-8"
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Settings"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }
            }
            transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.7 }}
            style={{ transformOrigin: "bottom right" }}
            className={cn(
              "glass overflow-hidden rounded-2xl shadow-2xl focus:outline-none",
              // Wide enough for the transition rail to show several chips, but
              // never wider than the viewport on a small phone.
              "w-[min(calc(100vw-2.5rem),24rem)] sm:w-[28rem]"
            )}
          >
            <header className="flex items-center justify-between border-b border-foreground/10 px-5 py-3.5">
              <h2 className="text-base font-semibold text-foreground">Settings</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close settings"
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors",
                  "hover:bg-foreground/5 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
              {SETTINGS_SECTIONS.map(({ id, Section }) => (
                <Section key={id} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Settings"
        className={cn(
          "glass grid h-12 w-12 place-items-center rounded-full border border-foreground/10 text-foreground",
          "shadow-lg transition-all hover:scale-105 hover:border-primary/40 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <Settings className="h-5 w-5 animate-spin-slow text-primary" aria-hidden />
      </button>
    </div>
  );
}
