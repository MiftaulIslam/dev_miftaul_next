"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for settings sections.
 *
 * Every section in the panel is composed from these, so a new setting only has
 * to declare *what* it controls — the spacing rhythm, focus rings, selected
 * styling and ARIA semantics all come from here and stay consistent.
 */

/** Focus ring applied to every control in the panel (WCAG 2.2 focus appearance). */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ───────────────────────────── Section (collapsible) ──────────────────── */

export function SettingsSection({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();
  const bodyId = `settings-section-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="border-b border-foreground/10 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors",
            "hover:bg-foreground/5",
            FOCUS_RING
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            key="body"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {description && (
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground/80">
                  {description}
                </p>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ──────────────────────────────── Options ─────────────────────────────── */

export interface SettingsOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * Two-to-four mutually exclusive choices, shown side by side.
 * Uses `aria-pressed` buttons rather than a radiogroup so each option keeps its
 * own tab stop — there are few enough that arrow-key roving adds no value.
 */
export function SettingsSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
}: {
  label: string;
  options: SettingsOption<T>[];
  value: T;
  /** The clicked element is passed through so spatial effects can anchor to it. */
  onChange: (next: T, origin: HTMLButtonElement) => void;
  /** Show only the icon. The label still names the control for assistive tech. */
  iconOnly?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={(event) => onChange(option.value, event.currentTarget)}
            aria-pressed={active}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            className={cn(
              "flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
              FOCUS_RING,
              active
                ? "border-primary/50 bg-primary/15 text-foreground"
                : "border-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {option.icon}
            {!iconOnly && option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A single-choice list laid out as one horizontal rail, flanked by scroll
 * arrows on both sides.
 *
 * `role="radiogroup"` with a roving tabindex: only the selected chip is in the
 * tab order, and Left/Right move the selection — which is what a screen reader
 * and a keyboard user both expect from a horizontal single-choice control. The
 * arrow *buttons* are a separate pointer affordance and are hidden from the
 * accessibility tree, since they only scroll and never change the value.
 */
export function SettingsRail<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SettingsOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setCanScrollStart(track.scrollLeft > 1);
    setCanScrollEnd(track.scrollLeft < max - 1);
  }, []);

  // Measure before paint so the arrows never flash in the wrong state when the
  // section expands.
  useLayoutEffect(syncArrows, [syncArrows, options.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(syncArrows);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncArrows]);

  const scrollBy = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  const select = (index: number) => {
    const next = options[(index + options.length) % options.length];
    onChange(next.value);
    // Keep the newly selected chip in view and move focus with the selection.
    const track = trackRef.current;
    const chip = track?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`);
    chip?.focus();
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  const activeIndex = options.findIndex((option) => option.value === value);

  return (
    <div className="flex items-center gap-1.5">
      <RailArrow
        direction="start"
        disabled={!canScrollStart}
        onClick={() => scrollBy(-1)}
      />

      <div
        ref={trackRef}
        role="radiogroup"
        aria-label={label}
        onScroll={syncArrows}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            select(activeIndex + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            select(activeIndex - 1);
          }
        }}
        className={cn(
          "flex flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-1",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              data-value={option.value}
              aria-checked={active}
              tabIndex={active || (activeIndex === -1 && index === 0) ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-10 shrink-0 snap-start items-center gap-2 rounded-xl border px-3.5 py-2",
                "whitespace-nowrap text-sm transition-colors",
                FOCUS_RING,
                active
                  ? "border-primary/50 bg-primary/15 text-foreground"
                  : "border-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {/* Selection is carried by the dot too, not by colour alone. */}
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                  active ? "bg-primary" : "bg-foreground/20"
                )}
              />
              {option.label}
            </button>
          );
        })}
      </div>

      <RailArrow direction="end" disabled={!canScrollEnd} onClick={() => scrollBy(1)} />
    </div>
  );
}

function RailArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "start" | "end";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "start" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      // Pointer-only affordance: keyboard users move with Left/Right inside the
      // radiogroup, so exposing these would be a redundant tab stop.
      aria-hidden
      tabIndex={-1}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-9 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all",
        disabled
          ? "cursor-default opacity-25"
          : "hover:bg-foreground/5 hover:text-foreground active:scale-90"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
