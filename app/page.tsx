"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroLoader from "@/components/intro/IntroLoader";
import HeroRoadmapPath from "@/components/ui/HeroRoadmapPath";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import V2Hero from "@/components/sections/v2/V2Hero";
import V2About from "@/components/sections/v2/V2About";
import V2Skills from "@/components/sections/v2/V2Skills";
import V2Projects from "@/components/sections/v2/V2Projects";
import V2Experience from "@/components/sections/v2/V2Experience";
import V2Contact from "@/components/sections/v2/V2Contact";
import { markSectionsMounted, resetScrollTop } from "@/lib/navShell";
import { useSiteVersionState, type PortfolioVersion } from "@/lib/portfolioVersion";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import type { PortfolioSettings } from "@/lib/dashboard/types";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [profile, setProfile] = useState<PortfolioSettings>(fallbackProfile);
  const aboutPortraitSlotRef = useRef<HTMLDivElement>(null);
  // `resolved` is false until the server config settles. Holding the section
  // tree behind it costs nothing visually — the intro loader already owns the
  // screen for those first moments — and it is what stops the page painting v1
  // and then flipping to v2 in front of the reader.
  const { version, resolved } = useSiteVersionState();
  const sectionsMounted = introDone && !showIntro && resolved;
  const previousVersionRef = useRef<PortfolioVersion | null>(null);

  /**
   * Re-measure — and, on an actual version change, start the new build from the
   * top.
   *
   * A version change is not a state change inside one page; it is a different
   * document. The whole section tree unmounts and remounts at a wildly
   * different height (v2's two pinned rails add several viewport-heights), but
   * the browser keeps `scrollY` — so the old position lands the reader
   * somewhere arbitrary in the new build: clamped to the new maximum going
   * v2 → v1 (i.e. straight into Contact), or deep inside a pinned rail going
   * v1 → v2. Resetting to the top first means the refresh below resolves every
   * pin against a position that actually means something.
   *
   * The first mount is deliberately exempt: there is nothing to transition from,
   * and forcing the top there would break a deep link into the page.
   */
  useEffect(() => {
    if (!sectionsMounted) return;

    const previous = previousVersionRef.current;
    previousVersionRef.current = version;
    const swapped = previous !== null && previous !== version;

    if (swapped) resetScrollTop();
    // The nav chrome's section spy binds to DOM nodes; this is what tells it the
    // nodes it was watching have just been replaced.
    markSectionsMounted();

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // refresh() restores the scroll position it measured from, so the reset
      // has to be re-asserted on the far side of it.
      if (swapped) resetScrollTop();
    });
    return () => cancelAnimationFrame(raf);
  }, [version, sectionsMounted]);

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

  // Intro over but the server has not said which build to mount yet — a gap only
  // a returning visitor sees, since the intro plays once per session and the
  // config lookup settles long before it ends. An empty surface rather than a
  // second loader: restarting the intro animation here would read as a stutter.
  if (!sectionsMounted) {
    return <main className="portfolio-surface relative min-h-screen" />;
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
          {version === "v2" ? (
            <V2Sections profile={profile} portraitTargetRef={aboutPortraitSlotRef} />
          ) : (
            <>
              <Hero profile={profile} />
              <About portraitTargetRef={aboutPortraitSlotRef} profile={profile} />
              <Skills />
              <Projects />
              <Experience />
              <Contact profile={profile} />
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

interface V2SectionsProps {
  profile: PortfolioSettings;
  portraitTargetRef: React.RefObject<HTMLDivElement | null>;
}

/** All future section work happens inside this tree; v1 stays frozen. */
function V2Sections({ profile, portraitTargetRef }: V2SectionsProps) {
  return (
    <>
      <V2Hero profile={profile} />
      <V2About portraitTargetRef={portraitTargetRef} profile={profile} />
      <V2Skills />
      <V2Projects />
      <V2Experience />
      <V2Contact profile={profile} />
    </>
  );
}
