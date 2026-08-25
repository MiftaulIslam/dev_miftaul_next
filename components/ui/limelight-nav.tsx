"use client";

import React, {
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Adaptive-width navigation with a "limelight" that slides to the active item —
 * a bright bar overhead casting a cone of light down onto it.
 *
 * Differences from the upstream snippet, all load-bearing:
 * - Supports a controlled `activeIndex`, because this nav's active item is
 *   driven by a scroll spy rather than by clicks alone.
 * - Items render as `<button>`, not `<a>` without an href — the latter is
 *   invisible to keyboard users and exposes no role.
 * - Re-measures on resize and on font load, since the beam is positioned in
 *   pixels and the shell changes width as it compacts on scroll.
 * - Labels are supported alongside icons; this nav is text-first.
 */

export type NavItem = {
  id: string | number;
  icon?: React.ReactElement<{ className?: string }>;
  label: string;
  onClick?: () => void;
};

type LimelightNavProps = {
  items: NavItem[];
  /** Controlled active item. Falls back to internal state when omitted. */
  activeIndex?: number;
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  itemClassName?: string;
  iconClassName?: string;
};

/** `useLayoutEffect` warns during SSR; this nav also renders on the server. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const LimelightNav = ({
  items,
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  itemClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultActiveIndex);
  const [isReady, setIsReady] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const activeIndex = controlledIndex ?? uncontrolledIndex;

  const positionBeam = useCallback(() => {
    const limelight = limelightRef.current;
    const activeItem = itemRefs.current[activeIndex];
    if (!limelight || !activeItem) return;
    limelight.style.left = `${
      activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2
    }px`;
  }, [activeIndex]);

  useIsomorphicLayoutEffect(() => {
    if (items.length === 0) return;
    positionBeam();
    // The first placement must not animate, or the beam streaks in from
    // off-screen on mount. Transitions are enabled one frame later.
    if (!isReady) {
      const id = requestAnimationFrame(() => setIsReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [positionBeam, isReady, items.length]);

  // The beam is positioned in pixels, so anything that reflows the nav — the
  // shell compacting on scroll, a viewport resize, a late-loading font —
  // invalidates it.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(positionBeam);
    observer.observe(nav);
    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [positionBeam, items.length]);

  if (items.length === 0) return null;

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    if (controlledIndex === undefined) setUncontrolledIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav
      ref={navRef}
      className={cn("relative inline-flex items-center", className)}
    >
      {items.map(({ id, icon, label, onClick }, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={id}
            type="button"
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => handleItemClick(index, onClick)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-20 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              itemClassName
            )}
          >
            {icon &&
              cloneElement(icon, {
                className: cn(
                  "h-4 w-4 transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-50",
                  icon.props.className,
                  iconClassName
                ),
              })}
            {label}
          </button>
        );
      })}

      <div
        ref={limelightRef}
        aria-hidden
        className={cn(
          "absolute top-0 z-10 h-[3px] w-10 rounded-full bg-primary",
          "shadow-[0_0_18px_2px_var(--accent-glow-strong)]",
          isReady && !reduced
            ? "transition-[left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            : "",
          limelightClassName
        )}
        style={{ left: "-999px" }}
      >
        {/* The cone of light falling from the bar onto the active item. */}
        <div className="pointer-events-none absolute left-[-30%] top-[3px] h-12 w-[160%] bg-gradient-to-b from-primary/25 to-transparent [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)]" />
      </div>
    </nav>
  );
};

export default LimelightNav;
