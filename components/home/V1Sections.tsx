"use client";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import type { PortfolioSettings } from "@/lib/dashboard/types";

interface V1SectionsProps {
  profile: PortfolioSettings;
  portraitTargetRef: React.RefObject<HTMLDivElement | null>;
}

/** The frozen v1 build. */
export default function V1Sections({ profile, portraitTargetRef }: V1SectionsProps) {
  return (
    <>
      <Hero profile={profile} />
      <About portraitTargetRef={portraitTargetRef} profile={profile} />
      <Skills />
      <Projects />
      <Experience />
      <Contact profile={profile} />
    </>
  );
}
