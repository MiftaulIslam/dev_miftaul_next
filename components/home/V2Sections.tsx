"use client";

import { Suspense } from "react";

import V2Hero from "@/components/sections/v2/V2Hero";
import V2About from "@/components/sections/v2/V2About";
import V2Skills from "@/components/sections/v2/V2Skills";
import V2Projects from "@/components/sections/v2/V2Projects";
import V2Experience from "@/components/sections/v2/V2Experience";
import V2Contact from "@/components/sections/v2/V2Contact";
import type { PortfolioSettings } from "@/lib/dashboard/types";

interface V2SectionsProps {
  profile: PortfolioSettings;
  portraitTargetRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * All future section work happens inside this tree; v1 stays frozen.
 *
 * Each section is its own Suspense boundary so React hydrates the server HTML
 * one section at a time, yielding to the browser in between, instead of in one
 * long task. Nothing suspends; the boundaries only split the work.
 */
export default function V2Sections({ profile, portraitTargetRef }: V2SectionsProps) {
  return (
    <>
      <Suspense fallback={null}>
        <V2Hero profile={profile} />
      </Suspense>
      <Suspense fallback={null}>
        <V2About portraitTargetRef={portraitTargetRef} profile={profile} />
      </Suspense>
      <Suspense fallback={null}>
        <V2Skills />
      </Suspense>
      <Suspense fallback={null}>
        <V2Projects />
      </Suspense>
      <Suspense fallback={null}>
        <V2Experience />
      </Suspense>
      <Suspense fallback={null}>
        <V2Contact profile={profile} />
      </Suspense>
    </>
  );
}
