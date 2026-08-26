/**
 * Types for the Reel — the v2 projects section.
 *
 * Every field here is a column or a case row in `v2_projects` — `year`,
 * `discipline`, `problem`, `outcome` and the long-form case body included — so
 * a project created in the dashboard renders a complete frame with no local
 * enrichment needed. `lib/projects/v2.ts` maps the database shape onto this one;
 * `content/projects.ts` holds the shipped copy the reel falls back to when the
 * table is unreachable.
 */

export type ProjectId = string;

/** One heading-plus-prose block inside the case sheet. */
export interface CaseBlock {
  heading: string;
  body: string[];
}

/**
 * What the plate is a picture of.
 *
 * `src` is a real capture when one exists. When it is null the plate falls back
 * to the seeded drawing in `components/projects/v2/Plate.tsx`. The caption is
 * mandatory either way — a reader should never have to guess whether they are
 * looking at a screenshot or a diagram.
 */
export interface ProjectPlate {
  src: string | null;
  /** Names what the plate is, honestly: "product capture", "drawing", etc. */
  caption: string;
  /** CSS object-position for the capture. Defaults to "50% 50%". */
  focus?: string;
}

export interface ReelProject {
  /** Stable slug. React key, /work/[slug] route param, and plate drawing seed. */
  id: ProjectId;
  name: string;
  /** Shipping year, mono, tabular. */
  year: string;
  /** One noun: the kind of thing this is. "Platform", "Storefront". */
  discipline: string;
  role: string;
  /** One sentence: what was wrong before. Set on --ink-2. */
  problem: string;
  /** One sentence: what changed. The last line read before the control rail. */
  outcome: string;
  tech: string[];
  /** Hex. Becomes --c-accent on the reel root; the only hue in play. */
  accent: string;
  plate: ProjectPlate;
  links: { live?: string; source?: string };
  case: CaseBlock[];
}
