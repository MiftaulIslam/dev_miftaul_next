import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";

import type { SkillCategory } from "@/types/skills";
import type { V2SkillSection } from "@/lib/dashboard/types";
import { FALLBACK_STACK, mapStackCategories, mapV2Sections } from "@/lib/skills-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Skills — Miftaul Islam Shuvro",
  description:
    "The full working stack in one view: interface, services, persistence and infrastructure, side by side.",
};

/**
 * The full stack for the "see more" page behind the reel.
 *
 * Reads the same v2 tables the reel does, so this page and the reel can never
 * disagree about what the stack is or what a layer says about itself. Falls
 * back to the static copy only when the database has nothing to give.
 */
async function loadCategories(): Promise<SkillCategory[]> {
  try {
    const { listV2SkillSections } = await import("@/lib/dashboard/db");
    const sections = (await listV2SkillSections()) as V2SkillSection[];
    if (Array.isArray(sections) && sections.length) {
      const mapped = mapV2Sections(sections);
      if (mapped.length) return mapped;
    }
  } catch {
    // fall through to static stack
  }
  return mapStackCategories(FALLBACK_STACK);
}

function monogram(name: string): string {
  const parts = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return initials.toUpperCase();
}

export default async function SkillsPage() {
  const categories = await loadCategories();

  return (
    <main className="portfolio-surface relative min-h-screen pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <Link
          href="/#skills"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          <span>Back</span>
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: "#3ddc97" }}>
            The Working Stack
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-5xl">
            Every layer, side by side.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The full stack in one card — the same four layers the home reel walks
            through, held open at once.
          </p>
        </header>

        <div
          className="sc-card sc-card-page mt-10"
          style={{ "--layer": categories[0]?.accent ?? "#3ddc97" } as CSSProperties}
          role="list"
          aria-label="Technology stack layers"
        >
          {categories.map((category, i) => (
            <div
              role="listitem"
              key={category.id}
              className="sc-col"
              style={{ "--layer": category.accent } as CSSProperties}
            >
              <div className="sc-col-inner">
                <p className="cols-kicker">
                  {String(i + 1).padStart(2, "0")} · {category.kicker}
                </p>
                <h2 className="cols-title">{category.label}</h2>
                <p className="cols-blurb">{category.blurb}</p>
                <ul className="cols-rows">
                  {category.skills.map((skill, k) => (
                    <li
                      key={skill.id}
                      className="cols-row"
                      style={{ "--k": k, "--w": skill.weight } as CSSProperties}
                    >
                      <span className="cols-row-icon">
                        {skill.iconSrc ? (
                          <Image src={skill.iconSrc} alt="" width={22} height={22} />
                        ) : (
                          <span className="cols-monogram" aria-hidden="true">
                            {monogram(skill.name)}
                          </span>
                        )}
                      </span>
                      <span className="cols-row-text">
                        <span className="cols-row-name">{skill.name}</span>
                        <span className="cols-row-role">{skill.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
