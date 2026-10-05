import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/SocialIcons";
import { findReelProjectBySlug } from "@/lib/projects/v2.server";
import {
  absoluteUrl,
  breadcrumbNode,
  jsonLd,
  pageMetadata,
  PERSON_ID,
  projectUrl,
  SITE_NAME,
  WEBSITE_ID,
} from "@/lib/seo";
import type { ReelProject } from "@/types/projects";

/**
 * One project’s full case.
 *
 * Server Component, no client JavaScript. The reel's case sheet is the quick
 * read; this is the durable, shareable, crawlable one — same content, no
 * interaction required to reach any of it.
 *
 * Rendered per request rather than prerendered from a static list. Two reasons,
 * and either one alone would be enough: a copy edit in the dashboard has to be
 * live without a deploy, and a project *created* in the dashboard has to have a
 * working case page immediately — with `generateStaticParams` its slug would 404
 * until the next build.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findReelProjectBySlug(slug);
  if (!found) return { title: "Case not found", robots: { index: false } };
  const { project } = found;

  return pageMetadata({
    title: `${project.name} — ${project.discipline} case study`,
    description: project.outcome,
    path: `/work/${project.id}`,
    images: project.plate.src ? [project.plate.src] : undefined,
    type: "article",
  });
}

/** The case page, the project it describes, and who wrote it — one graph. */
function caseJsonLd(project: ReelProject) {
  const url = projectUrl(project);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${project.name} — ${project.discipline} case study`,
        description: project.outcome,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        primaryImageOfPage: project.plate.src ? absoluteUrl(project.plate.src) : undefined,
        about: {
          "@type": "CreativeWork",
          name: project.name,
          description: project.problem,
          url: project.links.live,
          keywords: project.tech.join(", "),
          contributor: { "@id": PERSON_ID },
        },
        breadcrumb: breadcrumbNode([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: project.name, path: `/work/${project.id}` },
        ]),
      },
    ],
  };
}

export default async function WorkCasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const found = await findReelProjectBySlug(slug);
  if (!found) notFound();

  const { project, previous, next } = found;

  return (
    <main className="wpage wcase" style={{ ["--c-accent" as string]: project.accent }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(caseJsonLd(project)) }} />
      <Link href="/work" className="wcase-back">
        <ArrowLeft aria-hidden="true" />
        All work
      </Link>

      <header className="wcase-head">
        <p className="wcase-meta">
          <span>{project.discipline}</span>
          <span aria-hidden="true">·</span>
          <span>{project.role}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </p>
        <h1 className="wcase-title">{project.name}</h1>
        <p className="wcase-outcome">{project.outcome}</p>
        <p className="wcase-meta" style={{ margin: "1.25rem 0 0" }}>
          Case notes by <Link href="/">{SITE_NAME}</Link>
        </p>
      </header>

      <figure className="wcase-figure">
        <div className="wcase-plate">
          {project.plate.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.plate.src}
              alt={`${project.name} — ${project.plate.caption}`}
              decoding="async"
              style={{ objectPosition: project.plate.focus ?? "50% 50%" }}
            />
          ) : null}
        </div>
        <figcaption>{project.plate.caption}</figcaption>
      </figure>

      <div className="wcase-body">
        <section className="wcase-block">
          <h2>The problem</h2>
          <p>{project.problem}</p>
        </section>

        {project.case.map((block) => (
          <section key={block.heading} className="wcase-block">
            <h2>{block.heading}</h2>
            {block.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </section>
        ))}

        <dl className="wcase-spec">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.tech.join(", ")}</dd>
          </div>
        </dl>

        <div className="wcase-links">
          {project.links.live ? (
            <a href={project.links.live} target="_blank" rel="noopener noreferrer">
              Visit {project.name}
              <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
          {project.links.source ? (
            <a href={project.links.source} target="_blank" rel="noopener noreferrer">
              <GitHubIcon className="h-3.5 w-3.5" />
              Source
            </a>
          ) : null}
        </div>
      </div>

      <nav className="wcase-nav" aria-label="Other projects">
        {previous ? (
          <Link href={`/work/${previous.id}`} className="wcase-nav-link">
            <ArrowLeft aria-hidden="true" />
            <span>
              <small>Previous</small>
              {previous.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.id}`} className="wcase-nav-link is-next">
            <span>
              <small>Next</small>
              {next.name}
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
