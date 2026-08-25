"use client";

import { flushSync } from "react-dom";

import { applyTheme, type Theme } from "./theme";
import { resolveAnimation, type ThemeAnimationPreference } from "./themeAnimation";

/**
 * Swaps the theme with the visitor's chosen reveal.
 *
 * The DOM swap happens inside `document.startViewTransition`, then
 * `::view-transition-new(root)` — a snapshot of the *new* theme painted over
 * the old one — is animated with the Web Animations API. Animating its
 * `clip-path` therefore reveals the new theme from a chosen direction rather
 * than switching instantly.
 *
 * This lives here, not in a component, so every control that changes the theme
 * plays the same reveal: the navbar toggle, the settings panel, and anything
 * added later.
 */
export function applyThemeWithReveal(
  theme: Theme,
  {
    preference,
    duration = 400,
    origin,
  }: {
    preference: ThemeAnimationPreference;
    duration?: number;
    /** Element the change came from — spatial reveals radiate from it. */
    origin?: HTMLElement | null;
  }
) {
  const animation = resolveAnimation(preference);

  // No View Transitions support, or the visitor picked "Instant".
  if (!document.startViewTransition || animation === "none") {
    applyTheme(theme);
    return;
  }

  const transition = document.startViewTransition(() => {
    flushSync(() => applyTheme(theme));
  });

  void transition.ready
    .then(() => {
      const rect = origin?.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const left = rect ? rect.left : viewportWidth / 2;
      const top = rect ? rect.top : viewportHeight / 2;
      const x = left + (rect ? rect.width : 0) / 2;
      const y = top + (rect ? rect.height : 0) / 2;
      const maxRadius = Math.hypot(
        Math.max(left, viewportWidth - left),
        Math.max(top, viewportHeight - top)
      );

      const play = (
        keyframes: Keyframe[] | PropertyIndexedKeyframes,
        options: { duration: number; easing: string; pseudo?: string }
      ) =>
        document.documentElement.animate(keyframes, {
          duration: options.duration,
          easing: options.easing,
          pseudoElement: options.pseudo ?? "::view-transition-new(root)",
        });

      switch (animation) {
        case "circle-spread":
          play(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
              ],
            },
            { duration, easing: "ease-in-out" }
          );
          break;

        case "round-morph":
          play(
            [
              { opacity: 0, transform: "scale(0.8) rotate(5deg)" },
              { opacity: 1, transform: "scale(1) rotate(0deg)" },
            ],
            { duration: duration * 1.2, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
          );
          break;

        case "swipe-left":
          play(
            { clipPath: [`inset(0 0 0 ${viewportWidth}px)`, `inset(0 0 0 0)`] },
            { duration, easing: "cubic-bezier(0.2, 0, 0, 1)" }
          );
          break;

        case "swipe-right":
          play(
            { clipPath: [`inset(0 ${viewportWidth}px 0 0)`, `inset(0 0 0 0)`] },
            { duration, easing: "cubic-bezier(0.2, 0, 0, 1)" }
          );
          break;

        case "swipe-up":
          play(
            { clipPath: [`inset(${viewportHeight}px 0 0 0)`, `inset(0 0 0 0)`] },
            { duration, easing: "cubic-bezier(0.2, 0, 0, 1)" }
          );
          break;

        case "swipe-down":
          play(
            { clipPath: [`inset(0 0 ${viewportHeight}px 0)`, `inset(0 0 0 0)`] },
            { duration, easing: "cubic-bezier(0.2, 0, 0, 1)" }
          );
          break;

        case "diag-down-right":
          play(
            {
              clipPath: [
                `polygon(0 0, 0 0, 0 0, 0 0)`,
                `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
              ],
            },
            { duration: duration * 1.3, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
          );
          break;

        case "fade-in-out":
          play({ opacity: [0, 1] }, { duration: duration * 0.7, easing: "ease-in-out" });
          break;

        case "shrink-grow":
          play(
            [
              { transform: "scale(0.9)", opacity: 0 },
              { transform: "scale(1)", opacity: 1 },
            ],
            { duration: duration * 1.2, easing: "cubic-bezier(0.19, 1, 0.22, 1)" }
          );
          break;

        case "flip-x-in":
          play(
            [
              { transform: "rotateY(90deg)", opacity: 0 },
              { transform: "rotateY(0deg)", opacity: 1 },
            ],
            { duration: duration * 1.1, easing: "ease-out" }
          );
          break;

        case "split-vertical":
          play(
            { clipPath: [`inset(50% 0 50% 0)`, `inset(0 0 0 0)`] },
            { duration: duration * 1.3, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
          );
          break;

        case "wave-ripple":
          play(
            {
              clipPath: [`circle(0% at 50% 50%)`, `circle(${maxRadius}px at 50% 50%)`],
            },
            { duration: duration * 1.3, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
          );
          break;
      }
    })
    .catch(() => {
      // Transition skipped (another one started). The theme is already applied.
    });
}
