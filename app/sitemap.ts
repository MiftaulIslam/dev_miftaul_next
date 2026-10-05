import type { MetadataRoute } from "next";
import { getReelProjects } from "@/lib/projects/v2.server";
import { absoluteUrl, projectUrl, SITE_URL } from "@/lib/seo";

/** Hourly: a project added in the dashboard reaches the sitemap within the hour. */
export const revalidate = 3600;

/**
 * Canonical, indexable URLs only. No `lastModified`: nothing here tracks a
 * real edit date, and a "now" stamp on every fetch teaches crawlers to ignore
 * the field.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getReelProjects();

  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/work` },
    ...projects.map((project) => ({
      url: projectUrl(project),
      images: project.plate.src ? [absoluteUrl(project.plate.src)] : undefined,
    })),
    { url: `${SITE_URL}/skills` },
    { url: `${SITE_URL}/resume` },
  ];
}
