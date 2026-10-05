import "server-only";

import type { Metadata } from "next";
import { getPublicPortfolioSettings } from "@/lib/dashboard/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { resumeContent } from "@/lib/resume/content";
import type { ReelProject } from "@/types/projects";

/**
 * Canonical origin. Vercel redirects the apex to www, and the GitHub profile
 * links to www, so www is the one URL every canonical, sitemap entry and
 * JSON-LD id agrees on.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.miftaul.com").replace(/\/$/, "");
export const SITE_NAME = "Miftaul Islam Shuvro";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Per-page metadata. Next merges `openGraph` shallowly, so a page that sets
 * none inherits the layout's — home's og:url and title on every route. Each
 * public page builds its own here instead.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  type?: "website" | "profile" | "article";
}): Metadata {
  // A page-level `openGraph` replaces the layout's wholesale, including the
  // app/opengraph-image.tsx card, so that card is named here explicitly.
  const shareImages = images ?? [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME} — Full Stack Developer` }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, locale: "en_US", type, images: shareImages },
    twitter: { card: "summary_large_image", title, description, images: shareImages },
  };
}

/** Dashboard copy carries `**bold**` / `***em***` markers; schema wants plain text. */
export function plainText(markdown: string) {
  return markdown.replace(/\*+/g, "").trim();
}

/** Script body for `<script type="application/ld+json">`; `<` escaped so DB copy cannot close the tag. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Only technologies the resume, the experience records and the case studies
 * actually show in use.
 */
const KNOWS_ABOUT = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "GraphQL",
  "SQL",
  "AWS",
  "AWS Lambda",
  "Go",
  "Docker",
  "System design",
  "Role-based access control",
];

/** The dashboard profile, or the shipped copy when the database is unreachable. */
export async function loadProfile(): Promise<PortfolioSettings> {
  try {
    return await getPublicPortfolioSettings();
  } catch {
    return fallbackProfile;
  }
}

/** The site's one Person. Every other node points here by `@id`. */
export function personNode(profile: PortfolioSettings) {
  const job = resumeContent.experiences[0];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    url: `${SITE_URL}/`,
    image: absoluteUrl(profile.primaryAvatar),
    jobTitle: profile.designations[0] ?? resumeContent.title,
    description: plainText(profile.shortSummary),
    homeLocation: { "@type": "Place", name: profile.location },
    email: `mailto:${profile.email}`,
    worksFor: job.headingEmphasis && job.link
      ? { "@type": "Organization", name: job.headingEmphasis, url: job.link }
      : undefined,
    knowsAbout: KNOWS_ABOUT,
    sameAs: profile.socials.map((s) => s.link).filter((link) => /^https?:\/\//.test(link)),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function breadcrumbNode(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function projectUrl(project: Pick<ReelProject, "id">) {
  return `${SITE_URL}/work/${project.id}`;
}
