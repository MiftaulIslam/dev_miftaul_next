"use client";

import { useEffect, useState } from "react";

import ReelChoreography from "@/components/skills/ReelChoreography";
import ReelScene from "@/components/skills/ReelScene";
import { FALLBACK_STACK, mapStackCategories, mapV2Sections } from "@/lib/skills-data";
import type { V2SkillSection } from "@/lib/dashboard/types";
import type { SkillCategory } from "@/types/skills";

/** Static copy so the reel is never empty on the first paint. */
const FALLBACK_CATEGORIES: SkillCategory[] = mapStackCategories(FALLBACK_STACK);

/**
 * The v2 skills section — the Reel.
 *
 * Reads its content from the `v2_skill_sections` / `v2_skill_items` tables via
 * `/api/public/skills/v2`, which the dashboard's "Skills (v2)" panel writes. The
 * static list renders first so the section has content on the very first paint
 * and never shows a loading state, then the database answer replaces it — the
 * same pattern the projects reel uses.
 *
 * If the database is empty or unreachable the fallback simply stays, so the
 * reel degrades to the copy it shipped with rather than to an empty stage.
 */
export default function V2Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/public/skills/v2", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as V2SkillSection[];
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const mapped = mapV2Sections(data);
        if (mapped.length) setCategories(mapped);
      } catch {
        // Keep the static copy; the section is never empty.
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ReelChoreography categories={categories}>
      {categories.map((category, i) => (
        <ReelScene
          key={category.id}
          category={category}
          index={i}
          total={categories.length}
        />
      ))}
    </ReelChoreography>
  );
}
