import OverlapChart from "@/components/experience/OverlapChart";
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
 * This shell holds no hooks and no browser APIs on purpose. The anchor, the
 * section element and the timeline all resolve without a client runtime, so if
 * `app/page.tsx` ever stops being a Client Component this file becomes a true
 * Server Component with no edits. Every piece of motion, pointer handling and
 * measurement lives in the one isolated leaf below it.
 *
 * The id is load-bearing: Navbar and SiteDock scroll to `#experience` and
 * dispatch `nav-section-jump` / `nav-section-settled`, which the chart listens
 * for to reset its own selection.
 */
export default function V2Experience() {
  return (
    <section id="experience" className="xp">
      <OverlapChart initial={FALLBACK_TIMELINE} />
    </section>
  );
}
