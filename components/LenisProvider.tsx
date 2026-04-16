"use client";

import { useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function LenisProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: isTouch ? 0.65 : 1.1,
      smoothTouch: isTouch ? 0.08 : 0,
      normalizeScroll: true,
      ignoreMobileResize: true,
      effects: false,
    });

    // Refresh ScrollTrigger on resize (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    const handleNavSettled = () => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("nav-section-settled", handleNavSettled);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("nav-section-settled", handleNavSettled);
      smoother.kill();
    };
  }, [reduced]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
