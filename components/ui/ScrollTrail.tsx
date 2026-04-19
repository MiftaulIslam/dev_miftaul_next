"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollTrail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !pathRef.current || !revealRef.current || !glowRef.current) return;

      const pathLength = pathRef.current.getTotalLength();
      const segment = Math.max(pathLength * 0.1, 180);

      gsap.set(revealRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      gsap.set(glowRef.current, {
        strokeDasharray: `${segment} ${pathLength}`,
        strokeDashoffset: pathLength,
      });

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "max",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const offset = pathLength * (1 - self.progress);
          gsap.set(revealRef.current, { strokeDashoffset: offset });
          gsap.set(glowRef.current, { strokeDashoffset: offset - segment * 0.35 });
        },
      });

      return () => st.kill();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[45] hidden md:block"
      aria-hidden
    >
      <svg viewBox="0 0 1440 1024" preserveAspectRatio="none" className="h-full w-full">
        <path
          ref={pathRef}
          d="M 8 80 C 90 230, 260 160, 435 210 C 585 250, 730 220, 890 290 C 1035 355, 1140 430, 1205 560 C 1265 680, 1315 770, 1338 1000"
          fill="none"
          stroke="rgba(56, 189, 248, 0.12)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          ref={revealRef}
          d="M 8 80 C 90 230, 260 160, 435 210 C 585 250, 730 220, 890 290 C 1035 355, 1140 430, 1205 560 C 1265 680, 1315 770, 1338 1000"
          fill="none"
          stroke="rgba(96, 165, 250, 0.38)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          ref={glowRef}
          d="M 8 80 C 90 230, 260 160, 435 210 C 585 250, 730 220, 890 290 C 1035 355, 1140 430, 1205 560 C 1265 680, 1315 770, 1338 1000"
          fill="none"
          stroke="rgba(56, 189, 248, 0.95)"
          strokeWidth="3.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 26px rgba(59, 130, 246, 0.6))" }}
        />
      </svg>
    </div>
  );
}

