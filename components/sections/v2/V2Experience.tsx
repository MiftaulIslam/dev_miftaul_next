"use client";

import { useSyncExternalStore } from "react";

import OverlapChart from "@/components/experience/OverlapChart";
import V2ExperienceMobile from "@/components/experience/v2/V2ExperienceMobile";
import { FALLBACK_TIMELINE } from "@/lib/experience/roles";

/**
 * Experience — Overlap.
 *
 * A list of jobs cannot express concurrency, and concurrency is the single most
 * informative fact in this history. Put every role on one shared axis and that
 * fact is visible before a word is read: two of these roles ran together for 19
 * of the 44 months on the chart, and the band under the bars says so without a
 * sentence being read.
 *
 * Position along the axis is date. Length along the axis is duration. Those are
 * the only two spatial encodings, and nothing else is allowed to carry either —
 * which is why every lane shares one hue instead of keeping the per-role accent
 * the dashboard stores. Vertical position encodes reading order and nothing
 * else, deliberately: if lane order also meant seniority the chart would be
 * making two claims with one axis.
 *
 * The only hook in this shell is the breakpoint switch below. Every piece of
 * motion, pointer handling and measurement lives in the leaves it renders.
 *
 * The id is load-bearing: Navbar and SiteDock scroll to `#experience` and
 * dispatch `nav-section-jump` / `nav-section-settled`, which the chart listens
 * for to reset its own selection.
 *
 * Below md the chart is swapped (not hidden) for a vertical timeline: the chart
 * scroll-pins, and a pin left mounted under display:none still eats scroll.
 */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function V2Experience() {
  // Server renders the desktop chart; phones swap after hydration.
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );

  return (
    <section id="experience" className={desktop ? "xp" : "relative"}>
      {desktop ? (
        <OverlapChart initial={FALLBACK_TIMELINE} />
      ) : (
        <V2ExperienceMobile initial={FALLBACK_TIMELINE} />
      )}
    </section>
  );
}
