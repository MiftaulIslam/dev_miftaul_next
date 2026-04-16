"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroLoader from "@/components/intro/IntroLoader";
import HeroRoadmapPath from "@/components/ui/HeroRoadmapPath";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const heroPortraitSlotRef = useRef<HTMLDivElement>(null);
  const aboutPortraitSlotRef = useRef<HTMLDivElement>(null);
  const sharedPortraitRef = useRef<HTMLDivElement>(null);
  const heroPortraitImageRef = useRef<HTMLDivElement>(null);
  const aboutPortraitImageRef = useRef<HTMLDivElement>(null);

  // Play intro only once per session
  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    if (!seen) return;
    const raf = requestAnimationFrame(() => {
      setShowIntro(false);
      setIntroDone(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (introDone) {
      document.body.classList.remove("intro-active");
    } else {
      document.body.classList.add("intro-active");
    }
    return () => document.body.classList.remove("intro-active");
  }, [introDone]);

  const handleIntroComplete = () => {
    sessionStorage.setItem("intro-seen", "1");
    setShowIntro(false);
    setIntroDone(true);
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      if (!introDone || isMobile) return;

      const shared = sharedPortraitRef.current;
      const source = heroPortraitSlotRef.current;
      const target = aboutPortraitSlotRef.current;
      const heroImg = heroPortraitImageRef.current;
      const aboutImg = aboutPortraitImageRef.current;
      if (!shared || !source || !target || !heroImg || !aboutImg) return;

      const readRect = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          radius: getComputedStyle(el).borderRadius,
        };
      };

      let visualMode: "hero" | "travel" | "about" | null = null;
      const applyVisualMode = (mode: "hero" | "travel" | "about", immediate = false) => {
        if (visualMode === mode && !immediate) return;
        visualMode = mode;
        const duration = immediate ? 0 : 0.24;

        if (mode === "travel") {
          gsap.set(shared, { visibility: "visible" });
          gsap.to(shared, {
            opacity: 1,
            borderColor: "rgba(59,130,246,0)",
            boxShadow: "none",
            duration,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(".portrait-hero", { opacity: 0, duration, ease: "power2.out", overwrite: "auto" });
          gsap.to(".hero-orbit-frame", { opacity: 0, duration, ease: "power2.out", overwrite: "auto" });
          gsap.to(".hero-static-portrait", { opacity: 0, duration, ease: "power2.out", overwrite: "auto" });
          gsap.to(".about-static-portrait", { opacity: 0, duration, ease: "power2.out", overwrite: "auto" });
          return;
        }

        gsap.to(shared, {
          opacity: 0,
          duration,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            if (visualMode !== "travel") {
              gsap.set(shared, { visibility: "hidden" });
            }
          },
        });

        gsap.to(".hero-static-portrait", {
          opacity: mode === "hero" ? 1 : 0,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(".portrait-hero", {
          opacity: mode === "hero" ? 1 : 0,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(".hero-orbit-frame", {
          opacity: mode === "hero" ? 1 : 0,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(".about-static-portrait", {
          opacity: mode === "about" ? 1 : 0,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      // Keep shared portrait exactly over hero slot on init/refresh.
      const syncToSource = (immediate = false) => {
        const src = readRect(source);
        gsap.set(shared, {
          x: src.x + 0.001,
          y: src.y + 0.001,
          width: src.width,
          height: src.height,
          borderRadius: src.radius,
          opacity: 0,
          visibility: "hidden",
          borderColor: "rgba(59,130,246,0.3)",
          boxShadow: "0 28px 90px rgba(2, 6, 23, 0.55)",
        });
        gsap.set(heroImg, { opacity: 1 });
        gsap.set(aboutImg, { opacity: 0 });
        applyVisualMode("hero", immediate);
        gsap.set("#hero .hero-floating-chip", { opacity: 1, y: 0 });
      };

      const syncToTarget = (immediate = false) => {
        const dst = readRect(target);
        gsap.set(shared, {
          x: dst.x + 0.001,
          y: dst.y + 0.001,
          width: dst.width,
          height: dst.height,
          borderRadius: dst.radius,
          opacity: 0,
          visibility: "hidden",
          borderColor: "rgba(59,130,246,0)",
          boxShadow: "0 18px 45px rgba(2, 6, 23, 0.45)",
        });
        gsap.set(heroImg, { opacity: 0 });
        gsap.set(aboutImg, { opacity: 1 });
        applyVisualMode("about", immediate);
        gsap.set("#hero .hero-floating-chip", { opacity: 0, y: -10 });
      };

      const EDGE_EPSILON = 0.08;
      const syncTravelVisible = () => {
        applyVisualMode("travel");
      };
      const snapAtEdges = (progress: number) => {
        if (progress <= EDGE_EPSILON) {
          syncToSource();
          return;
        }
        if (progress >= 1 - EDGE_EPSILON) {
          syncToTarget();
          return;
        }
        syncTravelVisible();
      };

      let travelTl: gsap.core.Timeline | null = null;
      const syncToCurrentProgress = () => {
        const st = travelTl?.scrollTrigger;
        if (!st || !travelTl) {
          syncToSource();
          return;
        }
        const p = gsap.utils.clamp(0, 1, st.progress);
        travelTl.progress(p);
        snapAtEdges(p);
      };
      const keepEdgeStateLocked = () => {
        const p = gsap.utils.clamp(0, 1, travelTl?.scrollTrigger?.progress ?? 0);
        snapAtEdges(p);
      };

      let rafA = 0;
      let rafB = 0;
      const queueSync = () => {
        cancelAnimationFrame(rafA);
        cancelAnimationFrame(rafB);
        rafA = requestAnimationFrame(() => {
          rafB = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            syncToCurrentProgress();
          });
        });
      };

      // Hide until first geometry sync to avoid initial wrong placement flicker.
      gsap.set(shared, { visibility: "hidden", opacity: 0 });

      // True shared-element travel: same element interpolates source->target with scrub.
      travelTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "top top+=120",
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: () => syncToSource(true),
          onRefresh: syncToCurrentProgress,
          onUpdate: (self) => snapAtEdges(self.progress),
          onLeaveBack: () => syncToSource(),
          onLeave: () => syncToTarget(),
        },
      });

      // Remove border + hero floating chips when movement starts.
      travelTl.to(
        shared,
        {
          borderColor: "rgba(59,130,246,0)",
          duration: 0.15,
          ease: "none",
        },
        0
      );
      travelTl.to(
        "#hero .hero-floating-chip",
        {
          opacity: 0,
          y: -10,
          duration: 0.2,
          stagger: 0.03,
          ease: "none",
        },
        0.02
      );

      // Phase 1: slight shrink while departing hero.
      travelTl.to(
        shared,
        {
          x: () => {
            const src = readRect(source);
            const dst = readRect(target);
            return src.x + (dst.x - src.x) * 0.42;
          },
          y: () => {
            const src = readRect(source);
            const dst = readRect(target);
            return src.y + (dst.y - src.y) * 0.42;
          },
          width: () => {
            const src = readRect(source);
            const dst = readRect(target);
            const minW = Math.min(src.width, dst.width);
            return minW * 0.82;
          },
          height: () => {
            const src = readRect(source);
            const dst = readRect(target);
            const minH = Math.min(src.height, dst.height);
            return minH * 0.82;
          },
          borderRadius: "20px",
          duration: 0.45,
          ease: "none",
        },
        0
      );

      // Mid-flight image switch: hero image -> about image.
      travelTl.to(heroImg, { opacity: 0, duration: 0.08, ease: "none" }, 0.43);
      travelTl.to(aboutImg, { opacity: 1, duration: 0.08, ease: "none" }, 0.43);

      // Phase 2: expand and dock exactly into about slot.
      travelTl.to(
        shared,
        {
          x: () => readRect(target).x,
          y: () => readRect(target).y,
          width: () => readRect(target).width,
          height: () => readRect(target).height,
          borderRadius: () => readRect(target).radius,
          boxShadow: "0 18px 45px rgba(2, 6, 23, 0.45)",
          duration: 0.55,
          ease: "none",
        },
        0.45
      );

      queueSync();

      const handleLoad = () => queueSync();
      const handleResize = () => queueSync();
      const handleScrollEnd = () => syncToCurrentProgress();
      const handleNavJump = () => {
        queueSync();
        requestAnimationFrame(() => syncToCurrentProgress());
      };
      window.addEventListener("load", handleLoad);
      window.addEventListener("resize", handleResize);
      window.addEventListener("nav-section-jump", handleNavJump as EventListener);
      ScrollTrigger.addEventListener("scrollEnd", handleScrollEnd);
      gsap.ticker.add(keepEdgeStateLocked);
      document.fonts?.ready.then(queueSync);

      return () => {
        cancelAnimationFrame(rafA);
        cancelAnimationFrame(rafB);
        window.removeEventListener("load", handleLoad);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("nav-section-jump", handleNavJump as EventListener);
        ScrollTrigger.removeEventListener("scrollEnd", handleScrollEnd);
        gsap.ticker.remove(keepEdgeStateLocked);
      };
    },
    { dependencies: [introDone, isMobile] }
  );
  if (!introDone || showIntro) {
    return (
      <main className="relative min-h-screen">
        <IntroLoader onComplete={handleIntroComplete} />
      </main>
    );
  }

  return (
    <main className="relative">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <HeroRoadmapPath />

        <div className="relative z-10">
          {/* Shared portrait layer used by Hero->About transition */}
          <div
            ref={sharedPortraitRef}
            className="pointer-events-none absolute left-0 top-0 z-40 hidden md:block overflow-hidden rounded-2xl border border-blue-400/30"
            style={{ opacity: 0, visibility: "hidden" }}
            aria-hidden
          >
            <div ref={heroPortraitImageRef} className="absolute inset-0">
              <Image
                src="/ariyan_2.jpg"
                alt="Miftaul Islam Shuvro portrait in hero"
                fill
                sizes="(max-width: 768px) 240px, 320px"
                className="object-cover object-[62%_35%]"
                priority
              />
            </div>
            <div ref={aboutPortraitImageRef} className="absolute inset-0 opacity-0">
              <Image
                src="/ariyan.webp"
                alt="Miftaul Islam Shuvro portrait in about"
                fill
                sizes="(max-width: 768px) 240px, 320px"
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-[#080c14]/60 via-transparent to-[#080c14]/10" />
          </div>

          <Hero portraitSlotRef={heroPortraitSlotRef} />
          <About portraitTargetRef={aboutPortraitSlotRef} />
          <Skills />
          <Projects />
          <Experience />
          <Contact />
        </div>
      </motion.div>
    </main>
  );
}
