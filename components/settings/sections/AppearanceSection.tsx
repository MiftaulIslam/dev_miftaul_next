"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/lib/theme";
import {
  ANIMATION_OPTIONS,
  useThemeAnimation,
  type ThemeAnimationPreference,
} from "@/lib/themeAnimation";
import { applyThemeWithReveal } from "@/lib/themeTransition";
import { SettingsRail, SettingsSection, SettingsSegmented } from "../primitives";

/**
 * Theme: light/dark mode plus the reveal that plays when it flips.
 *
 * Both live in one collapsible section because they are the same decision seen
 * twice — what the site looks like, and how it gets there.
 */
export function ThemeSection() {
  const { theme } = useTheme();
  const { animation, setAnimation } = useThemeAnimation();

  return (
    <SettingsSection title="Theme">
      <SettingsSegmented<Theme>
        label="Theme"
        iconOnly
        value={theme}
        // Same reveal as the navbar toggle, anchored to the button just clicked.
        onChange={(next, origin) =>
          applyThemeWithReveal(next, { preference: animation, origin })
        }
        options={[
          { value: "light", label: "Light", icon: <Sun className="h-4 w-4" aria-hidden /> },
          { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" aria-hidden /> },
        ]}
      />

      <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Transition
      </p>
      <SettingsRail<ThemeAnimationPreference>
        label="Theme transition animation"
        value={animation}
        onChange={setAnimation}
        options={ANIMATION_OPTIONS}
      />
    </SettingsSection>
  );
}
