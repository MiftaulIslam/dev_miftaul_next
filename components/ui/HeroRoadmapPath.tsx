"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type Size = { width: number; height: number };
type Point = { x: number; y: number };
type SectionId = "hero" | "about" | "skills" | "projects" | "experience" | "contact";

function getSectionY(id: SectionId, fallback: number, ratio = 0.2) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY + rect.height * ratio;
}

function buildRoadPath(width: number, height: number) {
  const w = Math.max(width, 1024);
  const h = Math.max(height, 2200);

  const yHero = getSectionY("hero", h * 0.1, 0.32);
  const yAbout = getSectionY("about", h * 0.28, 0.16);
  const ySkills = getSectionY("skills", h * 0.46, 0.18);
  const yProjects = getSectionY("projects", h * 0.62, 0.14);
  const yExp = getSectionY("experience", h * 0.78, 0.14);
  const yContact = getSectionY("contact", h * 0.92, 0.12);

  const points: Point[] = [
    { x: w * 0.035, y: yHero },
    { x: w * 0.87, y: yHero + Math.max((yAbout - yHero) * 0.35, 120) },
    { x: w * 0.14, y: yAbout + 40 },
    { x: w * 0.84, y: ySkills + 30 },
    { x: w * 0.18, y: yProjects + 20 },
    { x: w * 0.82, y: yExp + 20 },
    { x: w * 0.24, y: yContact + 14 },
  ];

  if (points.length < 2) return "";

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = prev.y + (curr.y - prev.y) * 0.5;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  return d;
}

export default function HeroRoadmapPath() {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  const [size, setSize] = useState<Size>({ width: 1440, height: 3200 });
  const [pathD, setPathD] = useState("");

  useEffect(() => {
    let raf = 0;
    let observer: ResizeObserver | null = null;

    const updatePath = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          window.innerHeight
        );
        setSize({ width, height });
        setPathD(buildRoadPath(width, height));
      });
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    window.addEventListener("load", updatePath);
    document.fonts?.ready.then(updatePath);
    ScrollTrigger.addEventListener("refreshInit", updatePath);

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updatePath);
      observer.observe(document.body);
      observer.observe(document.documentElement);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePath);
      window.removeEventListener("load", updatePath);
      ScrollTrigger.removeEventListener("refreshInit", updatePath);
      observer?.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reduced || !pathD || !baseRef.current || !revealRef.current || !glowRef.current || !dotRef.current) return;

      const path = baseRef.current;
      const length = path.getTotalLength();
      const segment = Math.max(length * 0.07, 200);

      gsap.set(revealRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.set(glowRef.current, {
        strokeDasharray: `${segment} ${length}`,
        strokeDashoffset: length,
      });

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "max",
        scrub: 0.95,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const offset = length * (1 - self.progress);
          const traveled = length - offset;
          const point = path.getPointAtLength(Math.min(Math.max(traveled, 0), length));

          gsap.set(revealRef.current, { strokeDashoffset: offset });
          gsap.set(glowRef.current, { strokeDashoffset: offset - segment * 0.35 });
          gsap.set(dotRef.current, { attr: { cx: point.x, cy: point.y } });
        },
      });

      return () => st.kill();
    },
    { scope: rootRef, dependencies: [pathD, size.width, size.height] }
  );

  if (!pathD) return null;

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden>
      <svg viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <filter id="roadGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={baseRef}
          d={pathD}
          fill="none"
          stroke="rgba(56, 189, 248, 0.16)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          ref={revealRef}
          d={pathD}
          fill="none"
          stroke="rgba(96, 165, 250, 0.5)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          ref={glowRef}
          d={pathD}
          fill="none"
          stroke="rgba(56, 189, 248, 0.96)"
          strokeWidth="2.9"
          strokeLinecap="round"
          filter="url(#roadGlow)"
        />
        <circle
          ref={dotRef}
          cx="0"
          cy="0"
          r="4"
          fill="rgba(125, 211, 252, 0.96)"
          style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,0.95))" }}
        />
      </svg>
    </div>
  );
}
