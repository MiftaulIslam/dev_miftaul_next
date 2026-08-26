import type { V2ProjectRecord } from "@/lib/dashboard/types";
import type { ReelProject } from "@/types/projects";
import { FALLBACK_REEL_PROJECTS } from "@/content/projects";

/**
 * The one place the database shape and the reel shape meet.
 *
 * `V2ProjectRecord` is flat because a dashboard form edits fields; `ReelProject`
 * is nested because the reel reads `project.plate.caption` and
 * `project.links.live`. Converting in a single module keeps every other file
 * ignorant of the other side's shape — the reel never learns a column name and
 * the dashboard never learns the reel's object graph.
 *
 * Deliberately not `server-only`: the section fetches JSON in the browser and
 * the /work pages render on the server, and both need the same mapping. There
 * is no database access in here — that lives in `lib/dashboard/db.ts`.
 */

/** DB → reel. The only lossy step is `plateFocus`, which is optional there. */
export function toReelProject(record: V2ProjectRecord): ReelProject {
  return {
    id: record.slug,
    name: record.name,
    year: record.year,
    discipline: record.discipline,
    role: record.role,
    problem: record.problem,
    outcome: record.outcome,
    tech: record.tech,
    accent: record.accent || "#3b82f6",
    plate: {
      // Empty string, not null: the column is NOT NULL DEFAULT ''. The reel
      // treats null as "no capture, draw the fallback", so the empty string has
      // to be normalised here or every plate without an image would try to load
      // `src=""` and fire a request at the current page.
      src: record.plateSrc || null,
      caption: record.plateCaption,
      ...(record.plateFocus ? { focus: record.plateFocus } : {}),
    },
    links: {
      // Same reason: `undefined` is what the reel checks, and `#` is the
      // "no link" sentinel the v1 project table uses, so both are dropped.
      ...(record.linkLive && record.linkLive !== "#" ? { live: record.linkLive } : {}),
      ...(record.linkSource && record.linkSource !== "#" ? { source: record.linkSource } : {}),
    },
    case: record.cases.map((block) => ({
      heading: block.heading,
      body: block.body,
    })),
  };
}

/**
 * Maps a whole list, falling back to the shipped copy when there is nothing.
 *
 * Empty covers two different failures — the database was unreachable, or the
 * table has not been seeded — and both want the same answer. The reel is a
 * pinned, scroll-driven section: with zero projects it does not degrade to a
 * short section, it renders nothing and the page scrolls over a hole where the
 * work used to be. The static list is the floor under that.
 */
export function toReelProjects(records: V2ProjectRecord[]): ReelProject[] {
  if (!Array.isArray(records) || records.length === 0) return FALLBACK_REEL_PROJECTS;
  return records.map(toReelProject);
}
