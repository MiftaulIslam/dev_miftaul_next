import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getReelProjects } from "@/lib/projects/v2.server";
import { breadcrumbNode, jsonLd, pageMetadata, PERSON_ID, projectUrl, SITE_URL, WEBSITE_ID } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects & Case Studies",
  description:
    "Case studies by Miftaul Islam Shuvro: a commercial real estate deal platform, fresh-food delivery, location-based rental search and storefronts.",
  path: "/work",
});

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

  const graph = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/work`,
    url: `${SITE_URL}/work`,
    name: "Projects & Case Studies",
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    breadcrumb: breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ]),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: projectUrl(project),
        name: project.name,
      })),
    },
  };

  return (
    <main className="wpage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />
      <header className="wpage-head">
        <h1 className="wpage-title">Work</h1>
        <p className="wpage-sub">
          {projects.length} projects by Miftaul Islam Shuvro, newest first. Each one links to its case notes.
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
