"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "portfolio-theme";

/**
 * Inlined into <head> before first paint so the correct theme class is on
 * <html> before React hydrates — no flash, no hydration mismatch.
 *
 * Dark is the portfolio's own identity, so it stays the default: only an
 * explicit stored choice moves off it. That also means the pre-paint class
 * matches the server-rendered one for every first-time visitor.
 * Kept as a single expression string: it is injected verbatim.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var d=localStorage.getItem("${THEME_STORAGE_KEY}")!=="light";var c=document.documentElement.classList;d?c.add("dark"):c.remove("dark");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** The <html> element is rendered with `dark` on the server, so match it. */
function getServerSnapshot(): Theme {
  return "dark";
}

/** Applies the theme to the document. Safe to call inside flushSync. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode) — theme still applies for this session.
  }
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  return { theme, setTheme, isDark: theme === "dark" };
}
