"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function LenisProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const disableSmootherRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/resume");

  useEffect(() => {
    if (reduced || disableSmootherRoute) return;

    // Touch keeps native scrolling. normalizeScroll moves every touch scroll
    // onto the main thread, so any long task froze the page under the reader's
    // finger; native scrolling runs on the compositor and keeps moving. The
    // smoothing on touch was nearly off anyway (smoothTouch 0.08). Every scroll
    // helper (navShell, the reels) already falls back to native scrolling.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const smoother = isTouch
      ? null
      : ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.1,
          normalizeScroll: true,
          ignoreMobileResize: true,
          effects: false,
        });

    // No resize listener: ScrollTrigger already refreshes itself on resize,
    // debounced, and skips the address-bar resizes on touch. A second refresh
    // here doubled that work, and on touch ran on every address-bar show/hide.
    const handleNavSettled = () => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("nav-section-settled", handleNavSettled);

    return () => {
      window.removeEventListener("nav-section-settled", handleNavSettled);
      smoother?.kill();
    };
  }, [reduced, disableSmootherRoute]);

  if (disableSmootherRoute) {
    return <>{children}</>;
  }

  return (
    <div id="smooth-wrapper" className="min-w-0 max-w-full overflow-x-hidden">
      <div id="smooth-content" className="min-w-0 max-w-full">
        {children}
      </div>
    </div>
  );
}
