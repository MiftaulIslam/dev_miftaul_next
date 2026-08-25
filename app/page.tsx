"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import IntroLoader from "@/components/intro/IntroLoader";
import HeroRoadmapPath from "@/components/ui/HeroRoadmapPath";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import type { PortfolioSettings } from "@/lib/dashboard/types";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [profile, setProfile] = useState<PortfolioSettings>(fallbackProfile);
  const aboutPortraitSlotRef = useRef<HTMLDivElement>(null);

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

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem("intro-seen", "1");
    setShowIntro(false);
    setIntroDone(true);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/public/profile", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as PortfolioSettings;
        setProfile(data);
      } catch {
        // Keep fallback profile on error
      }
    };
    void loadProfile();
  }, []);

  if (!introDone || showIntro) {
    return (
      <main className="portfolio-surface relative min-h-screen">
        <IntroLoader onComplete={handleIntroComplete} />
      </main>
    );
  }

  return (
    <main className="portfolio-surface relative">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <HeroRoadmapPath />

        <div className="relative z-10">
          <Hero profile={profile} />
          <About portraitTargetRef={aboutPortraitSlotRef} profile={profile} />
          <Skills />
          <Projects />
          <Experience />
          <Contact profile={profile} />
        </div>
      </motion.div>
    </main>
  );
}
