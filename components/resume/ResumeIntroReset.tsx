"use client";

import { useEffect } from "react";

/**
 * Removes the `intro-active` class from <body> immediately on mount.
 * The root layout always starts with that class (for the homepage intro animation),
 * but on the /resume route there is no intro — so without this, a hard-refresh
 * on /resume leaves `body.intro-active` in place forever, which locks scrolling
 * via the `body.intro-active { overflow: hidden }` rule in globals.css.
 */
export default function ResumeIntroReset() {
  useEffect(() => {
    document.body.classList.remove("intro-active");
  }, []);

  return null;
}
