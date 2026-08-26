export type SkillId = string;

export interface Skill {
  id: SkillId; // stable slug, used as React key and graph id
  name: string; // display name, e.g. "PostgreSQL"
  weight: number; // 0..1 proficiency. NEVER rendered as a bar or a percentage.
  // It drives visual weight only: radius, type scale, prominence.
  role: string; // one short noun phrase, e.g. "Primary store"
  note: string; // one sentence of specifics, e.g. "Query planning, partial indexes, CTEs"
  iconSrc: string | null; // "/tech_icons/PostgresSQL.svg" or null -> monogram fallback
}

export interface SkillCategory {
  id: string; // "persistence"
  label: string; // "Persistence"
  kicker: string; // "What survives a restart"
  layer: string; // "Data" - the position in a request path
  accent: string; // hex, the category signature hue
  blurb: string; // one or two sentences of point of view
  skills: Skill[];
}

export type SkillRelation = [SkillId, SkillId, number]; // [from, to, strength 0..1]

export interface NeighbourEdge {
  id: SkillId;
  strength: number;
}

/** Structures every concept reads, derived once instead of re-walking raw arrays in render. */
export interface SkillIndex {
  categories: SkillCategory[];
  /** Every skill across all categories, ordered by category then weight. */
  skills: Skill[];
  skillsById: Map<SkillId, Skill>;
  /** Undirected adjacency built from the relation triples, filtered to skills that exist. */
  neighbours: Map<SkillId, NeighbourEdge[]>;
}
