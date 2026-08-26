import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getReelProjects } from "@/lib/projects/v2.server";

export const metadata: Metadata = {
  title: "Work — Miftaul Islam Shuvro",
  description:
    "Selected work: commercial real estate intelligence, fresh-food delivery, location-based rental search, and storefronts.",
};

/**
 * The index behind the reel's "See all work".
 *
 * A Server Component with no client JavaScript at all — the reel is the
 * expressive surface, and this is the one that has to be crawlable, linkable
 * and readable with the script blocked. Deliberately rows rather than a card
 * grid: every project here has a different amount to say, and equal-sized cards
 * would flatten that into a menu.
 *
 * Rendered per request against `v2_projects`, not prerendered: the point of
 * moving the reel into the database is that an edit in the dashboard is live
 * without a deploy, and a statically cached index would hold the old copy until
 * the next build.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkIndexPage() {
  const projects = await getReelProjects();

  return (
    <main className="wpage">
      <header className="wpage-head">
        <h1 className="wpage-title">Work</h1>
        <p className="wpage-sub">
          {projects.length} projects, newest first. Each one links to its case notes.
        </p>
      </header>

      <ol className="wlist">
        {projects.map((project, i) => (
          <li key={project.id} className="wlist-item" style={{ ["--c-accent" as string]: project.accent }}>
            <article className="wrow">
              <p className="wrow-meta">
                <span className="wrow-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{project.discipline}</span>
                <span aria-hidden="true">·</span>
                <span>{project.role}</span>
                <span aria-hidden="true">·</span>
                <span>{project.year}</span>
              </p>

              <h2 className="wrow-name">
                <Link href={`/work/${project.id}`}>
                  {project.name}
                  <span className="wrow-hit" aria-hidden="true" />
                </Link>
              </h2>

              <p className="wrow-outcome">{project.outcome}</p>

              <ul className="wrow-tech">
                {project.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              <div className="wrow-plate">
                {project.plate.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.plate.src}
                    alt={`${project.name} — ${project.plate.caption}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ objectPosition: project.plate.focus ?? "50% 50%" }}
                  />
                ) : null}
              </div>

              <p className="wrow-cta">
                Read case notes
                <ArrowUpRight aria-hidden="true" />
              </p>
            </article>
          </li>
        ))}
      </ol>

      <footer className="wpage-foot">
        <Link href="/#projects" className="wpage-back">
          Back to the reel
        </Link>
      </footer>
    </main>
  );
}
