"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ChapterRail from "@/components/skills/ChapterRail";
import { jumpToScene, useReelProgress } from "@/lib/skills/useReelProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { SkillCategory } from "@/types/skills";

gsap.registerPlugin(ScrollTrigger);

const VERTICAL_QUERY = "(max-width: 767.98px)";

function gradeBackground(hue: string, dark: boolean): string {
  const a = dark ? "2E" : "14";
  const b = dark ? "24" : "10";
  return (
    `radial-gradient(55% 70% at 22% 30%, ${hue}${a}, transparent 72%),` +
    `radial-gradient(50% 60% at 78% 75%, ${hue}${b}, transparent 70%)`
  );
}

export default function ReelChoreography({
  categories,
  children,
}: {
  categories: SkillCategory[];
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const gradeARef = useRef<HTMLDivElement>(null);
  const gradeBRef = useRef<HTMLDivElement>(null);
  const gradeFrontRef = useRef<"a" | "b">("a");
  const progressRef = useRef<HTMLSpanElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);

  const total = Math.max(Children.count(children), categories.length, 1);

  const setSceneLive = (index: number) => {
    const scenes = sectionRef.current?.querySelectorAll("[data-reel-scene]");
    scenes?.forEach((scene) => {
      scene.classList.toggle("is-live", Number((scene as HTMLElement).dataset.sceneIndex) === index);
    });
  };

  /**
   * Writes everything a scene owns outside React: the reveal class the CSS gates
   * `.rv` on, the accent grade cross-fade, and the timecode readout.
   *
   * Split out from `applyIndex` because the two have opposite requirements.
   * `applyIndex` runs on every scroll frame and must short-circuit when the
   * index has not moved; this must be able to run unconditionally, so the
   * opening scene can be painted at mount — when the index is already 0 and that
   * short-circuit would swallow it. It did exactly that, and scene 0 rendered as
   * an empty slab until the reader scrolled far enough to move the index off 0
   * and back.
   */
  const paintScene = (clamped: number) => {
    setSceneLive(clamped);

    const hue = categories[clamped]?.accent ?? "#ff6a3d";
    const dark = document.documentElement.classList.contains("dark");
    const front = gradeFrontRef.current;
    const back = front === "a" ? gradeBRef.current : gradeARef.current;
    if (back) {
      back.style.background = gradeBackground(hue, dark);
      back.style.opacity = "1";
      if (front === "a" && gradeARef.current) gradeARef.current.style.opacity = "0";
      if (front === "b" && gradeBRef.current) gradeBRef.current.style.opacity = "0";
      gradeFrontRef.current = front === "a" ? "b" : "a";
    }
    sectionRef.current?.style.setProperty("--layer", hue);
    if (timecodeRef.current) {
      timecodeRef.current.textContent = `${String(clamped + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }
  };

  /** The every-frame path: a no-op unless the scene actually changed. */
  const applyIndex = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), total - 1);
    if (activeIndexRef.current === clamped) return;
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    paintScene(clamped);
  };

  /** Forces the reel back to its opening scene. Never touches the page scroll. */
  const showOpeningScene = () => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    paintScene(0);
  };

  useEffect(() => {
    const mq = window.matchMedia(VERTICAL_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    // Adding `.js` is what hides every `.rv` — the CSS hands the reveal to this
    // component the moment it knows JS is running. So the opening scene has to
    // be painted in the same breath, or the section's first frame is blank.
    section?.classList.add("js");
    showOpeningScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* nav wiring: refresh on settle, reset state on jump */
  useEffect(() => {
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    const jump = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "skills") return;
      // Reset the reel's own scene, and nothing else. `scrollToSection` fired
      // this event and owns the page scroll for the length of the jump; moving
      // it from here sent the reader to the very top of the document instead of
      // to the reel — and did it with a raw `window.scrollTo`, which goes behind
      // ScrollSmoother's back and leaves its content transform mid-glide.
      showOpeningScene();
    };
    const settled = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && id !== "skills") return;
      refresh();
    };
    window.addEventListener("nav-section-jump", jump as EventListener);
    window.addEventListener("nav-section-settled", settled as EventListener);
    window.addEventListener("load", refresh);
    let fontTimer: ReturnType<typeof setTimeout> | undefined;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(refresh);
    }
    // images above the reel reflow the page as they arrive — re-measure
    const imageTimers = [400, 1200, 2500].map((ms) => setTimeout(refresh, ms));
    return () => {
      window.removeEventListener("nav-section-jump", jump as EventListener);
      window.removeEventListener("nav-section-settled", settled as EventListener);
      window.removeEventListener("load", refresh);
      imageTimers.forEach(clearTimeout);
      if (fontTimer) clearTimeout(fontTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  /* mobile: discrete arrivals via IntersectionObserver, no scrub */
  useEffect(() => {
    if (!isMobile) return;
    const scenes = sectionRef.current?.querySelectorAll("[data-reel-scene]");
    if (!scenes?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Fine thresholds: through the smoother's eased catch-up a scene can
        // cross several levels per callback — the most-visible intersecting
        // scene wins, then one delayed re-check corrects after settle.
        let best: number | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.sceneIndex);
          if (Number.isNaN(index)) continue;
          if (entry.intersectionRatio >= bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = index;
          }
        }
        if (best === null) return;
        applyIndex(best);
        setTimeout(() => {
          const vh = window.innerHeight;
          let bestIdx = activeIndexRef.current;
          let bestArea = -1;
          sectionRef.current?.querySelectorAll("[data-reel-scene]").forEach((scene, i) => {
            const r = scene.getBoundingClientRect();
            const overlap = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
            if (overlap > bestArea) {
              bestArea = overlap;
              bestIdx = i;
            }
          });
          applyIndex(bestIdx);
        }, 400);
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );
    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, total]);

  /* desktop: one ScrollTrigger drives pan + the manual viewport pin */
  const onProgressRef = useRef<(self: ScrollTrigger) => void>(() => {});
  onProgressRef.current = (self) => {
    const viewport = viewportRef.current;
    if (viewport) {
      gsap.set(viewport, { y: Math.max(0, self.progress) * (self.end - self.start) });
    }

    const rmNow =
      reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numerals = sectionRef.current?.querySelectorAll("[data-reel-numeral]");
    if (numerals?.length && !rmNow) {
      const spread = Math.max(1, total - 1);
      numerals.forEach((numeral, i) => {
        const offset = gsap.utils.clamp(-1.4, 1.4, i - self.progress * spread);
        gsap.set(numeral, { xPercent: offset * 26 });
      });
    }
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
    }
    applyIndex(Math.round(self.progress * (total - 1)));
  };

  useReelProgress({
    railRef,
    trackRef,
    viewportRef,
    total,
    reduced: !!reduced,
    enabled: !isMobile,
    onProgress: (self) => onProgressRef.current(self),
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const bars = section.querySelectorAll<HTMLElement>(".reel-letterbox");
      if (!reduced && bars.length === 2) {
        gsap.fromTo(
          bars[0],
          { scaleY: 0 },
          { scaleY: 1, duration: 0.7, ease: "expo.out", transformOrigin: "top center" }
        );
        gsap.fromTo(
          bars[1],
          { scaleY: 0 },
          { scaleY: 1, duration: 0.7, ease: "expo.out", transformOrigin: "bottom center", delay: 0.06 }
        );
      }

      const hue = categories[0]?.accent ?? "#ff6a3d";
      if (gradeARef.current) {
        gradeARef.current.style.background = gradeBackground(
          hue,
          document.documentElement.classList.contains("dark")
        );
      }
    },
    { dependencies: [reduced], scope: sectionRef }
  );

  const handleJump = (index: number) => {
    if (isMobile) {
      const scene = sectionRef.current?.querySelector(`[data-scene-index="${index}"]`);
      scene?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      return;
    }
    jumpToScene(railRef, total, index, !!reduced);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? activeIndexRef.current + 1 : activeIndexRef.current - 1;
    if (next < 0 || next > total - 1) return;
    handleJump(next);
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="reel relative"
      style={{ "--scenes": total } as CSSProperties}
      onKeyDown={handleKeyDown}
    >
      <div className="reel-rail" ref={railRef}>
        <div
          className="reel-viewport"
          ref={viewportRef}
          tabIndex={0}
          aria-label={`Skills reel, ${total} scenes. Use arrow up and arrow down to step between scenes.`}
        >
          <div className="reel-grade" aria-hidden="true">
            <div className="reel-grade-layer" ref={gradeARef} />
            <div className="reel-grade-layer" ref={gradeBRef} />
          </div>

          <div className="reel-track" ref={trackRef}>
            {children}
          </div>

          <a className="reel-more" href="/skills">
            See more<span aria-hidden="true"> →</span>
          </a>

          <div className="reel-letterbox reel-letterbox-top" aria-hidden="true" />
          <div className="reel-letterbox reel-letterbox-bottom" aria-hidden="true" />

          <ChapterRail
            labels={categories.map((category) => category.label)}
            activeIndex={activeIndex}
            onJump={handleJump}
            progressRef={progressRef}
            timecodeRef={timecodeRef}
          />
        </div>
      </div>

      <a className="reel-more reel-more-static" href="/skills">
        See more<span aria-hidden="true"> →</span>
      </a>
    </section>
  );
}
