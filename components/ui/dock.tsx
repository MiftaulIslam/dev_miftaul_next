"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/**
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
 */

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 60;
const BASE_ITEM_SIZE = 44;

type DockContextValue = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  /** True when magnification should not run at all. */
  still: boolean;
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
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  label = "Section navigation",
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  label?: string;
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const reduced = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // No hover on touch, and no magnification when motion is reduced — in both
  // cases the row keeps a fixed height so it never reserves dead space above
  // itself for a magnification that will never happen.
  const still = reduced || coarsePointer;

  const maxHeight = useMemo(
    () => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4),
    [magnification]
  );

  const heightRow = useTransform(
    isHovered,
    [0, 1],
    [panelHeight, still ? panelHeight : maxHeight]
  );
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className="mx-2 flex max-w-full items-end overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          if (still) return;
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "mx-auto flex w-fit items-end gap-2 rounded-2xl px-3",
          "border border-hairline bg-nav-surface shadow-2xl backdrop-blur-xl",
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label={label}
      >
        <DockContext.Provider
          value={{ mouseX, spring, distance, magnification, still }}
        >
          {children}
        </DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

/** Props injected into DockLabel / DockIcon by DockItem. */
type InjectedChildProps = {
  width?: MotionValue<number>;
  isHovered?: MotionValue<number>;
};

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
  const ref = useRef<HTMLButtonElement>(null);
  const { distance, magnification, mouseX, spring, still } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - rect.x - rect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [BASE_ITEM_SIZE, still ? BASE_ITEM_SIZE : magnification, BASE_ITEM_SIZE]
  );
  const width = useSpring(widthTransform, spring);

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width }}
      onClick={onClick}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex aspect-square items-center justify-center rounded-full border transition-colors",
        active
          ? "border-primary/40 bg-primary/15 text-foreground"
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
          className="pointer-events-none absolute -top-px left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_18px_2px_var(--accent-glow-strong)]"
        >
          <span className="absolute left-[-40%] top-[3px] h-10 w-[180%] bg-gradient-to-b from-primary/25 to-transparent [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)]" />
        </span>
      )}

      {Children.map(children, (child) =>
        isValidElement<InjectedChildProps>(child)
          ? cloneElement(child, { width, isHovered })
          : child
      )}
    </motion.button>
  );
}

export function DockLabel({
  children,
  className,
  isHovered,
}: {
  children: React.ReactNode;
  className?: string;
} & InjectedChildProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on("change", (latest) => setIsVisible(latest === 1));
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "absolute -top-7 left-1/2 w-fit whitespace-pre rounded-md border border-hairline",
            "bg-nav-surface px-2 py-0.5 text-xs text-foreground backdrop-blur-xl",
            className
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({
  children,
  className,
  width,
}: {
  children: React.ReactNode;
  className?: string;
} & InjectedChildProps) {
  // A fallback keeps the hook order stable when this is rendered outside a
  // DockItem (no injected width), rather than calling useTransform on undefined.
  const fallback = useMotionValue(BASE_ITEM_SIZE);
  const widthTransform = useTransform(width ?? fallback, (val) => val / 2);

  return (
    <motion.span
      style={{ width: widthTransform }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.span>
  );
}
