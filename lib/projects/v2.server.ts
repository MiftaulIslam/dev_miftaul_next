import "server-only";

import { listV2ProjectsSafe } from "@/lib/dashboard/db";
import { toReelProjects } from "@/lib/projects/v2";
import type { ReelProject } from "@/types/projects";

/**
 * The reel list, for Server Components.
 *
 * `/work` and `/work/[slug]` read the database directly rather than fetching
 * `/api/public/projects/v2` — the route handler is the browser's way in, and a
 * server fetching its own HTTP endpoint would pay a round trip to run the query
 * it could have run itself. Both paths go through the same `toReelProjects`, so
 * the shape a crawler sees and the shape the reel swaps in cannot diverge.
 */
export async function getReelProjects(): Promise<ReelProject[]> {
  return toReelProjects(await listV2ProjectsSafe());
}

export async function findReelProjectBySlug(slug: string) {
  const projects = await getReelProjects();
  const position = projects.findIndex((project) => project.id === slug);
  if (position < 0) return null;

  return {
    project: projects[position],
    previous: position > 0 ? projects[position - 1] : null,
    next: position < projects.length - 1 ? projects[position + 1] : null,
  };
}
