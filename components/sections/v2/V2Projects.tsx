"use client";

import { useEffect, useState } from "react";
import ProjectReel from "@/components/projects/v2/ProjectReel";
import { FALLBACK_REEL_PROJECTS } from "@/content/projects";
import { toReelProjects } from "@/lib/projects/v2";
import type { V2ProjectRecord } from "@/lib/dashboard/types";
import type { ReelProject } from "@/types/projects";

/**
 * The v2 projects section — the Reel.
 *
 * Renders the shipped list first so the section has content on the very first
 * paint and never shows a loading state, then swaps in `v2_projects` from the
 * dashboard. That table is the source of truth: every field the reel and the
 * case sheet read is a column or a case row, so nothing here has to be filled in
 * from a local enrichment map any more — a project created in the dashboard
 * renders complete.
 *
 * The static list survives only as the floor: an unreachable database or an
 * unseeded table would otherwise leave a pinned, scroll-driven section with
 * nothing in it.
 */
export default function V2Projects() {
  const [projects, setProjects] = useState<ReelProject[]>(FALLBACK_REEL_PROJECTS);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/public/projects/v2", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as V2ProjectRecord[];
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        setProjects(toReelProjects(data));
      } catch {
        // Keep the static list; the section is never empty.
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return <ProjectReel projects={projects} syncUrl />;
}
