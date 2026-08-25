"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The reveal styles the theme toggle can play. These mirror the `switch` in
 * `components/ui/ThemeToggle.tsx` — keep the two in sync when adding one.
 */
export type AnimationType =
  | "none"
  | "circle-spread"
  | "round-morph"
  | "swipe-left"
  | "swipe-up"
  | "diag-down-right"
  | "fade-in-out"
  | "shrink-grow"
  | "flip-x-in"
  | "split-vertical"
  | "swipe-right"
  | "swipe-down"
  | "wave-ripple";

/** The pool "random" draws from — deliberately excludes "none". */
export const ANIMATION_TYPES: AnimationType[] = [
  "circle-spread",
  "round-morph",
  "swipe-left",
  "swipe-right",
  "swipe-up",
  "swipe-down",
  "diag-down-right",
  "fade-in-out",
  "shrink-grow",
  "wave-ripple",
  "split-vertical",
  "flip-x-in",
];

export type ThemeAnimationPreference = AnimationType | "random";

/** Display labels for the settings popover, in the order they are listed. */
export const ANIMATION_OPTIONS: {
  value: ThemeAnimationPreference;
  label: string;
}[] = [
  { value: "random", label: "Random" },
  { value: "circle-spread", label: "Circle spread" },
  { value: "wave-ripple", label: "Wave ripple" },
  { value: "round-morph", label: "Round morph" },
  { value: "shrink-grow", label: "Shrink grow" },
  { value: "split-vertical", label: "Split vertical" },
  { value: "flip-x-in", label: "Flip X" },
  { value: "diag-down-right", label: "Diagonal" },
  { value: "swipe-left", label: "Swipe left" },
  { value: "swipe-right", label: "Swipe right" },
  { value: "swipe-up", label: "Swipe up" },
  { value: "swipe-down", label: "Swipe down" },
  { value: "fade-in-out", label: "Fade" },
  { value: "none", label: "Instant" },
];

export const THEME_ANIMATION_STORAGE_KEY = "portfolio-theme-animation";

const DEFAULT: ThemeAnimationPreference = "random";

const VALID = new Set<string>(ANIMATION_OPTIONS.map((o) => o.value));

/**
 * Module-level cache. `useSyncExternalStore` requires `getSnapshot` to return a
 * referentially stable value between changes, so the preference is read from
 * localStorage once and then kept here rather than re-read on every render.
 */
let current: ThemeAnimationPreference | null = null;

function read(): ThemeAnimationPreference {
  if (current !== null) return current;
  try {
    const stored = localStorage.getItem(THEME_ANIMATION_STORAGE_KEY);
    current = stored && VALID.has(stored) ? (stored as ThemeAnimationPreference) : DEFAULT;
  } catch {
    current = DEFAULT;
  }
  return current;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): ThemeAnimationPreference {
  return DEFAULT;
}

export function setThemeAnimation(next: ThemeAnimationPreference) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(THEME_ANIMATION_STORAGE_KEY, next);
  } catch {
    // Storage unavailable (private mode) — the choice still holds this session.
  }
  listeners.forEach((listener) => listener());
}

export function useThemeAnimation() {
  const animation = useSyncExternalStore(subscribe, read, getServerSnapshot);
  const setAnimation = useCallback(
    (next: ThemeAnimationPreference) => setThemeAnimation(next),
    []
  );
  return { animation, setAnimation };
}

/** Resolves "random" to a concrete reveal at call time. */
export function resolveAnimation(
  preference: ThemeAnimationPreference
): AnimationType {
  return preference === "random"
    ? ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)]
    : preference;
}
