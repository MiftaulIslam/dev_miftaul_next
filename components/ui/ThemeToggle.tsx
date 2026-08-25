"use client";

import React, { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme";
import {
  useThemeAnimation,
  type AnimationType,
  type ThemeAnimationPreference,
} from "@/lib/themeAnimation";
import { applyThemeWithReveal } from "@/lib/themeTransition";
import { cn } from "@/lib/utils";

export type { AnimationType };

export interface ToggleThemeProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  /** Overrides the visitor's saved preference when passed explicitly. */
  animationType?: ThemeAnimationPreference;
}

export function ThemeToggle({
  className,
  duration = 400,
  animationType,
  ...props
}: ToggleThemeProps) {
  const { isDark } = useTheme();
  const { animation } = useThemeAnimation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(() => {
    applyThemeWithReveal(isDark ? "light" : "dark", {
      preference: animationType ?? animation,
      duration,
      origin: buttonRef.current,
    });
  }, [isDark, animation, animationType, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-full glass border border-foreground/10 hover:border-primary/40 text-foreground transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      aria-label="Toggle Theme"
      {...props}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      )}
    </button>
  );
}

export const ToggleTheme = ThemeToggle;
export default ThemeToggle;
