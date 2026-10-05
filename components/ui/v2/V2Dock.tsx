"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * v2: larger items from `sm` up (52px, was 44px), and items centred vertically in the
 * panel at rest — v1 bottom-aligned them with no padding, so they sat flush on
 * the panel's lower edge.
 *
 * macOS-style dock: items magnify as the pointer approaches.
 *
 * Changes from the upstream snippet, all deliberate:
 * - `DockItem` renders a real button. The original used a div with
 *   role="button" and aria-haspopup="true" — the first needs a manual
 *   Enter/Space handler to be operable, and the second is simply wrong: the
 *   label is a tooltip, not a popup.
 * - The base item size is 44px, not 40px, to clear the minimum touch target.
 * - Magnification is skipped under prefers-reduced-motion, and on coarse
 *   pointers where there is no hover to drive it.
 * - Colours come from the theme tokens rather than hard-coded grays, so the
 *   dock follows the site's light/dark themes.
 * - An active item shows a limelight beam, matching the navbar.
 * - No framer-motion: widths ease on GSAP (already on the page), the tooltip
 *   and icon sizing are CSS, and item centres are measured once per hover
 *   instead of every item reading layout on every mouse move while widths were
 *   being written — which thrashed layout the whole time the pointer was there.
 */

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
// Mobile first: phone sizes by default, larger from the `sm` breakpoint. Six
// 52px items overflow a 375px screen, and the pinned stages reserve room for
// the 60px phone dock (see --wreel-dock in projects-reel.css).
const BASE_ITEM_SIZE = 44;
const BASE_ITEM_SIZE_SM = 52;
const PANEL_HEIGHT = 60;
const PANEL_HEIGHT_SM = 72;

type DockContextValue = {
  base: number;
};

const DockContext = createContext<DockContextValue | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("useDock must be used within a Dock");
  return context;
}

export function Dock({
  children,
  className,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  label = "Section navigation",
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  magnification?: number;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [wide, setWide] = useState(false);
  const [tabBar, setTabBar] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const sm = window.matchMedia("(min-width: 640px)");
    // Matches the `max-md:` tab-bar styles: below md the dock is a flat tab bar.
    const md = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setCoarsePointer(coarse.matches);
      setWide(sm.matches);
      setTabBar(!md.matches);
    };
    sync();
    const queries = [coarse, sm, md];
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  }, []);

  const base = wide ? BASE_ITEM_SIZE_SM : BASE_ITEM_SIZE;
  const panelHeight = wide ? PANEL_HEIGHT_SM : PANEL_HEIGHT;

  // No hover on touch, and no magnification when motion is reduced — in both
  // cases the row keeps a fixed height so it never reserves dead space above
  // itself for a magnification that will never happen.
  // The phone tab bar never magnifies either, even under a mouse in a narrow
  // desktop window: growing the bar on hover is wrong for a tab bar.
  const still = reduced || coarsePointer || tabBar;
  const maxHeight = Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);

  useEffect(() => {
    const row = rowRef.current;
    const panel = panelRef.current;
    if (!row) return;
    // Re-assert the resting height on every run. The handlers below write it
    // imperatively, so React's own `style.height` is not the source of truth:
    // when the breakpoint flips 60px -> 72px after mount, React applies 72 and
    // then the previous run's cleanup used to write its stale 60 straight back.
    // React never re-applies an unchanged prop, so the row stayed 12px shorter
    // than the panel and its `overflow-x: auto` (which forces overflow-y to
    // clip too) sliced off the dock's top border and rounded corners.
    row.style.height = `${panelHeight}px`;
    if (!panel) return;

    // Same story for item widths: they were reset to the previous run's `base`
    // (44px) after React had applied the new one (52px), leaving 44px items in a
    // 72px panel, padded for 52px ones, so they sat visibly low.
    const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-dock-item]"));
    gsap.killTweensOf(items);
    items.forEach((item) => (item.style.width = `${base}px`));
    if (still) return;

    const setWidth = items.map((item) =>
      gsap.quickTo(item, "width", { duration: 0.25, ease: "power2.out" })
    );

    let centers: number[] = [];
    let mouseX = 0;
    let frame = 0;

    // Same curve as before: full magnification under the pointer, falling off
    // linearly to the base size `distance` px away on either side.
    const apply = () => {
      frame = 0;
      items.forEach((_, i) => {
        const falloff = Math.max(0, 1 - Math.abs(mouseX - centers[i]) / distance);
        setWidth[i](base + (magnification - base) * falloff);
      });
    };

    const onEnter = () => {
      centers = items.map((item) => {
        const rect = item.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
      row.style.height = `${maxHeight}px`;
    };
    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setWidth.forEach((set) => set(base));
      row.style.height = `${panelHeight}px`;
    };

    panel.addEventListener("mouseenter", onEnter);
    panel.addEventListener("mousemove", onMove);
    panel.addEventListener("mouseleave", onLeave);
    return () => {
      panel.removeEventListener("mouseenter", onEnter);
      panel.removeEventListener("mousemove", onMove);
      panel.removeEventListener("mouseleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      gsap.killTweensOf(items);
    };
  }, [still, base, panelHeight, maxHeight, magnification, distance]);

  return (
    <div
      ref={rowRef}
      style={{ height: panelHeight, scrollbarWidth: "none" }}
      className="mx-2 flex max-w-full items-end overflow-x-auto max-md:mx-0 max-md:w-full transition-[height] duration-300 ease-out [&::-webkit-scrollbar]:hidden"
    >
      <div
        ref={panelRef}
        className={cn(
          "mx-auto flex w-fit items-end gap-2 rounded-2xl px-2 sm:gap-2.5 sm:px-2.5",
          // Phones: an edge-to-edge tab bar. Items fill the bar's full height
          // and share its width equally, like a native app's bottom tabs.
          "max-md:items-stretch max-md:gap-0 max-md:px-0 max-md:pb-0!",
          "border border-hairline bg-nav-surface shadow-2xl backdrop-blur-sm md:backdrop-blur-xl",
          className
        )}
        // Items are bottom-aligned so magnification grows upward; padding them
        // up by half the spare height centres them while the dock is at rest.
        // The 2 is the panel's 1px top and bottom border (border-box height).
        style={{ height: panelHeight, paddingBottom: (panelHeight - 2 - base) / 2 }}
        role="toolbar"
        aria-label={label}
      >
        <DockContext.Provider value={{ base }}>{children}</DockContext.Provider>
      </div>
    </div>
  );
}

export function DockItem({
  children,
  className,
  active = false,
  label,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  /** Marks the current section and shows the limelight beam. */
  active?: boolean;
  label: string;
  onClick?: () => void;
}) {
  const { base } = useDock();

  return (
    <button
      data-dock-item
      type="button"
      style={{ width: base }}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex aspect-square items-center justify-center rounded-full border transition-colors",
        // Phones: a flat tab. Equal share of the bar, no pill, no fill; the
        // active state is the colour plus the indicator line on the top edge.
        "max-md:aspect-auto max-md:w-auto! max-md:flex-1 max-md:rounded-none max-md:border-0 max-md:bg-transparent",
        active
          ? "border-primary/40 bg-primary/15 text-foreground max-md:text-primary"
          : "border-transparent bg-foreground/5 text-muted-foreground hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {/*
        The beam rides inside the active item rather than being positioned in
        pixels against the row. Dock items change width continuously while the
        pointer moves, so a measured beam would lag a frame behind the whole
        time the pointer is in the dock.
      */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_2px_var(--accent-glow-strong)] max-md:top-0 max-md:w-[calc(100%-1rem)] max-md:rounded-t-none max-md:shadow-none"
        >
          <span className="absolute left-[-40%] top-[3px] h-10 w-[180%] bg-gradient-to-b from-primary/25 to-transparent [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)] max-md:hidden" />
        </span>
      )}

      {children}
    </button>
  );
}

/** Tooltip above an item: shown on hover (pointer devices only) and on keyboard focus. */
export function DockLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      role="tooltip"
      className={cn(
        // No hover on a phone tab bar; a tooltip would only flash on tap.
        "max-md:hidden",
        "pointer-events-none absolute -top-7 left-1/2 w-fit -translate-x-1/2 whitespace-pre rounded-md border border-hairline",
        "bg-nav-surface px-2 py-0.5 text-xs text-foreground opacity-0 transition-[opacity,translate] duration-200",
        "group-hover:-translate-y-2.5 group-hover:opacity-100 group-focus-visible:-translate-y-2.5 group-focus-visible:opacity-100",
        className
      )}
    >
      {children}
    </span>
  );
}

/** The icon is always half the item's (possibly magnified) width. */
export function DockIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("flex w-1/2 items-center justify-center max-md:w-[26px]", className)}>{children}</span>;
}
