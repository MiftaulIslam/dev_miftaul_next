"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import InspectDrawer from "@/components/intro/InspectDrawer";

interface IntroLoaderProps {
  onComplete: () => void;
}

const DEBUG_STEPS = [
  { text: "Inspecting <h1.hero-title>...", progress: "12%", width: 12 },
  { text: "class corruption detected", progress: "34%", width: 34 },
  { text: "isolating glitch channels", progress: "47%", width: 47 },
  { text: "removing .broken", progress: "62%", width: 62 },
  { text: "removing .corrupted", progress: "78%", width: 78 },
  { text: "restoring title render", progress: "89%", width: 89 },
  { text: "loading portfolio modules", progress: "96%", width: 96 },
  { text: "portfolio ready", progress: "100%", width: 100 },
];

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const glitchARef = useRef<HTMLHeadingElement>(null);
  const glitchBRef = useRef<HTMLHeadingElement>(null);
  const glitchCRef = useRef<HTMLHeadingElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glitchLinesRef = useRef<HTMLDivElement>(null);
  const glitchDustRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scanBeamRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statusRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const brokenClassRef = useRef<HTMLSpanElement>(null);
  const corruptedClassRef = useRef<HTMLSpanElement>(null);
  const subClassRef = useRef<HTMLSpanElement>(null);
  const setLineRef = (idx: number, el: HTMLDivElement | null) => {
    lineRefs.current[idx] = el;
  };

  useEffect(() => {
    const setDebug = (idx: number) => {
      const step = DEBUG_STEPS[idx];
      if (!step) return;
      if (statusRef.current) statusRef.current.textContent = step.text;
      if (progressRef.current) progressRef.current.textContent = step.progress;
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          width: `${step.width}%`,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const failSafeExit = window.setTimeout(() => {
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0 });
      if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
      if (drawerRef.current) gsap.set(drawerRef.current, { opacity: 1, y: 0 });
      setDebug(7);
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.45,
        onComplete,
      });
    }, 9800);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        window.clearTimeout(failSafeExit);
        onComplete();
      },
    });
    let glitchLoop: gsap.core.Timeline | null = null;

    gsap.set(overlayRef.current, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(centerRef.current, { opacity: 1 });
    gsap.set(titleRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
    gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
    gsap.set([glitchARef.current, glitchBRef.current, glitchCRef.current], { opacity: 0, x: 0, skewX: 0 });
    gsap.set(haloRef.current, { scale: 0.94, opacity: 0.45 });
    gsap.set(glitchLinesRef.current, { opacity: 0.12 });
    gsap.set(glitchDustRef.current, { opacity: 0.22 });
    gsap.set(drawerRef.current, { y: 86, opacity: 0 });
    gsap.set(scanBeamRef.current, { opacity: 0, y: 0 });
    gsap.set(lineRefs.current.filter(Boolean), { opacity: 0, y: 10 });
    gsap.set(progressFillRef.current, { width: "12%" });

    tl.fromTo(centerRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.52 }, 0);
    tl.to(haloRef.current, { scale: 1.08, opacity: 0.78, duration: 0.85, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.06);
    tl.fromTo(drawerRef.current, { y: 86, opacity: 0 }, { y: 0, opacity: 1, duration: 0.72 }, 0.18);
    tl.to(lineRefs.current.filter(Boolean), { opacity: 1, y: 0, duration: 0.3, stagger: 0.16 }, 0.44);
    tl.to(scanBeamRef.current, { opacity: 0.86, duration: 0.18 }, 0.5);
    tl.to(scanBeamRef.current, { y: 84, duration: 0.55, ease: "none" }, 0.52);
    tl.to(scanBeamRef.current, { opacity: 0, duration: 0.18 }, 1.06);

    tl.call(() => setDebug(0), [], 0.46);

    tl.call(() => setDebug(1), [], 1.35);
    tl.call(() => {
      glitchLoop = gsap.timeline({ repeat: -1, repeatDelay: 1.35 });
      glitchLoop
        .to([glitchARef.current, glitchBRef.current, glitchCRef.current], { opacity: 0.72, duration: 0.14, ease: "power2.out" }, 0)
        .to(titleRef.current, { x: 2.4, duration: 0.1, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
        .to(glitchARef.current, { x: 6, y: -1, skewX: 5, duration: 0.11, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
        .to(glitchBRef.current, { x: -6, y: 1, skewX: -5, duration: 0.11, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
        .to(glitchCRef.current, { x: 3, y: 2, duration: 0.11, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
        .to([glitchARef.current, glitchBRef.current, glitchCRef.current], { opacity: 0.06, duration: 0.32, ease: "power2.in" }, 0.9)
        .to(titleRef.current, { x: 0, duration: 0.18, ease: "power2.out" }, 0.9)
        .to([glitchARef.current, glitchBRef.current, glitchCRef.current], { x: 0, y: 0, skewX: 0, opacity: 0, duration: 0.2, ease: "power2.inOut" }, 1.08);
    }, [], 1.22);

    tl.call(() => setDebug(2), [], 1.95);
    tl.to(scanBeamRef.current, { opacity: 0.8, duration: 0.16 }, 2.1);
    tl.to(scanBeamRef.current, { y: 128, duration: 0.65, ease: "none" }, 2.13);
    tl.to(scanBeamRef.current, { opacity: 0, duration: 0.16 }, 2.78);
    tl.call(() => setDebug(3), [], 2.55);
    tl.to(brokenClassRef.current, {
      opacity: 0,
      scaleX: 0,
      width: 0,
      marginLeft: 0,
      duration: 0.38,
      transformOrigin: "left center",
    }, 2.62);

    tl.call(() => setDebug(4), [], 3.15);
    tl.to(corruptedClassRef.current, {
      opacity: 0,
      scaleX: 0,
      width: 0,
      marginLeft: 0,
      duration: 0.4,
      transformOrigin: "left center",
    }, 3.22);

    tl.call(() => setDebug(5), [], 3.8);
    tl.call(() => {
      if (glitchLoop) {
        glitchLoop.kill();
        glitchLoop = null;
      }
      gsap.to([glitchARef.current, glitchBRef.current, glitchCRef.current], { opacity: 0, x: 0, y: 0, skewX: 0, duration: 0.16 });
      gsap.to(titleRef.current, { x: 0, duration: 0.08, ease: "power1.out" });
    }, [], 4.05);

    tl.call(() => {
      setDebug(6);
      if (subClassRef.current) {
        subClassRef.current.textContent = "ready";
        gsap.set(subClassRef.current, { color: "#34d399" });
      }
    }, [], 4.4);

    tl.call(() => setDebug(7), [], 4.95);

    tl.to(
      overlayRef.current,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        opacity: 0,
        duration: 1.1,
        ease: "power4.inOut",
      },
      5.35
    );

    return () => {
      window.clearTimeout(failSafeExit);
      if (glitchLoop) glitchLoop.kill();
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] overflow-hidden bg-[#050a13]"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div
        ref={glitchLinesRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 136px, rgba(56,189,248,0.14) 137px, rgba(15,23,42,0.35) 138px, transparent 140px)",
        }}
      />
      <div
        ref={glitchDustRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 14% 23%, rgba(96,165,250,0.5) 0 1px, transparent 1.5px), radial-gradient(circle at 68% 34%, rgba(59,130,246,0.42) 0 1px, transparent 1.5px), radial-gradient(circle at 83% 71%, rgba(30,58,138,0.4) 0 1px, transparent 1.5px), radial-gradient(circle at 30% 58%, rgba(15,23,42,0.55) 0 1px, transparent 1.5px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 42% at 50% 38%, rgba(37,99,235,0.2), rgba(15,23,42,0.45) 52%, transparent 72%)",
        }}
      />

      <div className="pointer-events-none absolute inset-x-6 top-6 flex items-center justify-between text-[10px] font-mono md:inset-x-8">
        <span className="tracking-[0.18em] text-blue-300/70">PORTFOLIO.INIT</span>
        <span className="text-slate-400">sys.ready</span>
      </div>

      <div ref={centerRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <div
          ref={haloRef}
          className="pointer-events-none absolute h-60 w-[46rem] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(56,189,248,0.22) 0%, rgba(30,64,175,0.12) 38%, rgba(15,23,42,0.55) 62%, transparent 78%)",
          }}
        />
        <div className="relative">
          <h1 ref={glitchARef} className="pointer-events-none absolute inset-0 text-4xl font-bold tracking-tight text-cyan-300/70 md:text-7xl" aria-hidden>
            Miftaul Islam Shuvro
          </h1>
          <h1 ref={glitchBRef} className="pointer-events-none absolute inset-0 text-4xl font-bold tracking-tight text-sky-400/55 md:text-7xl" aria-hidden>
            Miftaul Islam Shuvro
          </h1>
          <h1 ref={glitchCRef} className="pointer-events-none absolute inset-0 text-4xl font-bold tracking-tight text-indigo-300/48 md:text-7xl" aria-hidden>
            Miftaul Islam Shuvro
          </h1>
          <h1
            ref={titleRef}
            className="relative text-4xl font-bold tracking-tight text-slate-100 md:text-7xl"
            style={{
              textShadow:
                "0 0 20px rgba(59,130,246,0.35), 0 0 42px rgba(37,99,235,0.22), 0 0 68px rgba(15,23,42,0.55)",
              backgroundImage: "linear-gradient(180deg, #f8fafc 0%, #7dd3fc 32%, #3b82f6 58%, #1e3a5f 88%, #0f172a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Miftaul Islam Shuvro
          </h1>
        </div>

        <p ref={subtitleRef} className="mt-4 text-sm font-medium tracking-[0.2em] text-blue-200/85 uppercase md:text-base">
          Full Stack Developer
        </p>
      </div>

      <InspectDrawer
        drawerRef={drawerRef}
        setLineRef={setLineRef}
        scanBeamRef={scanBeamRef}
        statusRef={statusRef}
        progressRef={progressRef}
        progressFillRef={progressFillRef}
        brokenClassRef={brokenClassRef}
        corruptedClassRef={corruptedClassRef}
        subClassRef={subClassRef}
      />
    </div>
  );
}
