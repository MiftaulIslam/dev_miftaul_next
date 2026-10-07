"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { requestScrollRefresh } from "@/lib/scrollRefresh";
import HeroRoadmapPath from "@/components/ui/HeroRoadmapPath";
import { markSectionsMounted } from "@/lib/navShell";
import type { PortfolioSettings } from "@/lib/dashboard/types";

// Each build, and the intro, is its own chunk: a visitor downloads only the tree
// the server chose. Both v1 and v2 used to ship to everyone. Server rendering
// still preloads whichever chunk it rendered, so hydration does not wait.
const loadV1 = () => import("@/components/home/V1Sections");
const loadV2 = () => import("@/components/home/V2Sections");
const V1Sections = dynamic(loadV1);
const V2Sections = dynamic(loadV2);
const IntroLoader = dynamic(() => import("@/components/intro/IntroLoader"));

/**
 * The homepage's client experience.
 *
 * `app/page.tsx` reads the profile on the server and hands it in, so the build
 * (v1/v2) and the intro switch are known before the first byte. With the intro
 * off, the sections render on the server and the HTML carries the real content
 * — which is what crawlers that do not run JavaScript, and AI retrieval bots,
 * actually read. With the intro on, the server renders the loader and the
 * sections mount after it, exactly as before.
 */
export default function HomeExperience({ initialProfile }: { initialProfile: PortfolioSettings }) {
  const profile = initialProfile;
  const version = profile.siteVersion;
  const [introDone, setIntroDone] = useState(!profile.introEnabled);
  const [showIntro, setShowIntro] = useState(profile.introEnabled);
  const aboutPortraitSlotRef = useRef<HTMLDivElement>(null);
  const sectionsMounted = introDone && !showIntro;

  // The nav chrome's section spy binds to DOM nodes; this is what tells it the
  // nodes now exist. The refresh re-measures every pin once they do.
  useEffect(() => {
    if (!sectionsMounted) return;
    markSectionsMounted();
    requestScrollRefresh();
  }, [sectionsMounted]);

  // With the intro on, the sections mount client-side after it, so fetch the
  // chosen tree while the intro plays rather than when it ends.
  useEffect(() => {
    if (profile.introEnabled) void (version === "v2" ? loadV2() : loadV1());
  }, [profile.introEnabled, version]);

  // The intro plays once per session.
  useEffect(() => {
    if (!profile.introEnabled || !sessionStorage.getItem("intro-seen")) return;
    const raf = requestAnimationFrame(() => {
      setShowIntro(false);
      setIntroDone(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [profile.introEnabled]);

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

  if (!sectionsMounted) {
    return (
      <main className="portfolio-surface relative min-h-screen">
        <IntroLoader onComplete={handleIntroComplete} />
      </main>
    );
  }

  return (
    <main className="portfolio-surface relative">
      {/* After the intro the page fades in (`.page-fade-in`, CSS); without it
          the server HTML is the first frame and must not fade. */}
      <div className={profile.introEnabled ? "page-fade-in relative" : "relative"}>
        <HeroRoadmapPath />

        <div className="relative z-10">
          {version === "v2" ? (
            <V2Sections profile={profile} portraitTargetRef={aboutPortraitSlotRef} />
          ) : (
            <V1Sections profile={profile} portraitTargetRef={aboutPortraitSlotRef} />
          )}
        </div>
      </div>
    </main>
  );
}
