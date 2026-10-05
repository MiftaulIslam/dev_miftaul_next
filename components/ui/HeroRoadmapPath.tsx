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

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Where the dot sits `distance` along the path, from an arc-length table built
 * out of the path's own cubic segments ("M x y" then "C x1 y1, x2 y2, x y"
 * repeated, as `buildRoadPath` writes it). Plain arithmetic: getPointAtLength
 * walks the whole curve on every call, which made it costly per scroll frame,
 * and costlier still sampled up front.
 */
function arcLengthTable(d: string, length: number) {
  const nums = (d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
  const STEPS = 48; // per segment
  const xs = [nums[0]];
  const ys = [nums[1]];
  const lens = [0];
  for (let k = 2; k + 5 < nums.length; k += 6) {
    const x0 = xs[xs.length - 1];
    const y0 = ys[ys.length - 1];
    const [x1, y1, x2, y2, x3, y3] = nums.slice(k, k + 6);
    for (let s = 1; s <= STEPS; s += 1) {
      const t = s / STEPS;
      const u = 1 - t;
      const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
      const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
      lens.push(lens[lens.length - 1] + Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]));
      xs.push(x);
      ys.push(y);
    }
  }
  const total = lens[lens.length - 1] || 1;

  return (distance: number) => {
    // `distance` is in the browser's measure of the path; scale it onto ours.
    const target = Math.min(Math.max(distance / (length || 1), 0), 1) * total;
    let lo = 0;
    let hi = lens.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lens[mid] < target) lo = mid;
      else hi = mid;
    }
    const t = (target - lens[lo]) / (lens[hi] - lens[lo] || 1);
    return { x: xs[lo] + (xs[hi] - xs[lo]) * t, y: ys[lo] + (ys[hi] - ys[lo]) * t };
  };
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

    const updatePath = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // The path is `hidden md:block`. Below md nothing is drawn, so measure
        // nothing either: no section rect reads, no path, and with no path the
        // scrubbed trigger below is never built.
        if (!window.matchMedia(DESKTOP_QUERY).matches) {
          setPathD("");
          return;
        }
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
    window.addEventListener("nav-section-settled", updatePath as EventListener);
    document.fonts?.ready.then(updatePath);
    ScrollTrigger.addEventListener("refreshInit", updatePath);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePath);
      window.removeEventListener("load", updatePath);
      window.removeEventListener("nav-section-settled", updatePath as EventListener);
      ScrollTrigger.removeEventListener("refreshInit", updatePath);
    };
  }, []);

  useGSAP(
    () => {
      if (reduced || !pathD || !baseRef.current || !revealRef.current || !glowRef.current || !dotRef.current) return;

      const path = baseRef.current;
      const length = path.getTotalLength();
      const segment = Math.max(length * 0.07, 200);

      const pointAt = arcLengthTable(pathD, length);
      const scroller = document.getElementById("smooth-wrapper") ?? window;
      const trigger = document.getElementById("smooth-content") ?? document.documentElement;

      gsap.set(revealRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.set(glowRef.current, {
        strokeDasharray: `${segment} ${length}`,
        strokeDashoffset: length,
      });

      const applyProgress = (progress: number) => {
        const normalized = gsap.utils.clamp(0, 1, progress);
        const offset = length * (1 - normalized);
        const glowOffset = gsap.utils.clamp(-segment, length, offset - segment * 0.35);
        const traveled = length - offset;
        const point = pointAt(traveled);

        gsap.set(revealRef.current, { strokeDashoffset: offset });
        gsap.set(glowRef.current, { strokeDashoffset: glowOffset });
        gsap.set(dotRef.current, { attr: { cx: point.x, cy: point.y } });
      };

      const st = ScrollTrigger.create({
        trigger,
        scroller: scroller === window ? undefined : scroller,
        start: "top top",
        end: () => {
          const max = ScrollTrigger.maxScroll(scroller);
          return Math.max(max, 1);
        },
        scrub: 0.95,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      applyProgress(st.progress);

      return () => st.kill();
    },
    // revertOnUpdate: the path is re-measured on every ScrollTrigger refresh,
    // and without it each change of path or page size stacked another scrubbed
    // trigger on top of the old ones.
    { scope: rootRef, dependencies: [pathD, size.width, size.height], revertOnUpdate: true }
  );

  if (!pathD) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 hidden min-w-0 overflow-x-clip md:block"
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-hidden"
      >
        <defs>
          {/* The region only needs to clear the 4px blur. It was 260% of a
              bounding box as tall as the page, so every repaint of the glow
              filtered a surface several pages tall. */}
          <filter id="roadGlow" x="-10%" y="-2%" width="120%" height="104%">
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
