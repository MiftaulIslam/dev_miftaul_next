import type { SiteVersion } from "@/lib/siteVersion";

export interface SocialLink {
  iconName: string;
  link: string;
}

export interface PortfolioSettings {
  id: number;
  name: string;
  totalProjects: number;
  yearsOfExperience: number;
  availability: string;
  designations: string[];
  shortSummary: string;
  primaryAvatar: string;
  subAvatar: string;
  bannerImage: string;
  location: string;
  email: string;
  phone: string;
  socials: SocialLink[];
  happyClients: number;
  currentlyFocusedOn: string[];
  detailedSummary: string;
  /** Which homepage build every visitor is served. Chosen in the dashboard. */
  siteVersion: SiteVersion;
  updatedAt: string;
}

export interface StackTool {
  id: number;
  categoryId: number;
  name: string;
  color: string;
  iconName: string;
}

export interface StackCategory {
  id: number;
  key: string;
  label: string;
  accent: string;
  tools: StackTool[];
}

/**
 * One skill inside a v2 section.
 *
 * `title` is the one-line role that sits beside the name in the reel
 * ("Primary UI runtime"), not a heading. `weight` is never rendered as a number
 * or a bar — it drives icon size and ordering only. There is deliberately no
 * `years` field.
 */
export interface V2SkillItem {
  id: number;
  sectionId: number;
  name: string;
  title: string;
  icon: string;
  note: string;
  weight: number;
  sortOrder: number;
}

/**
 * One section of the v2 skills reel — a scene, with its own authored copy.
 *
 * Distinct from `StackCategory`, which models the flat v1 chip list and carries
 * no prose. `layer` is the short word the reel prints on its slate line.
 */
export interface V2SkillSection {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  description: string;
  layer: string;
  accent: string;
  sortOrder: number;
  skills: V2SkillItem[];
}

export interface ProjectRecord {
  id: number;
  title: string;
  subtitle: string;
  role: string;
  description: string[];
  image: string;
  images: string[];
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
  accent: string;
  tag: string;
  sortOrder: number;
}

export interface ExperienceRecord {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  type: string;
  description: string[];
  tech: string[];
  current: boolean;
  accent: string;
  sortOrder: number;
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  updatedAt: string;
}

export interface ReviewRecord {
  id: number;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
  featured: boolean;
  updatedAt: string;
}

export interface MessageRecord {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  projects: number;
  /** Rows in `v2_projects` — the reel, counted separately from the v1 cards. */
  v2Projects: number;
  reviews: number;
  experiences: number;
  skills: number;
  blogPosts: number;
  stackTools: number;
  messages: number;
  lastUpdated: string | null;
}

/* ── v2 projects ──────────────────────────────────────────────────────────── */

/** One heading-plus-paragraphs block of a v2 project's case body. */
export interface V2ProjectCaseBlock {
  id: number;
  heading: string;
  /** Paragraphs. Read and written together, so stored as one JSONB array. */
  body: string[];
  sortOrder: number;
}

/**
 * A v2 reel project as it lives in the database.
 *
 * Flat where the frontend shape (`ReelProject` in `types/projects.ts`) is
 * nested — `plate` and `links` are columns here and objects there — because a
 * dashboard form edits fields, not object graphs. `lib/projects/v2.ts` is the
 * one place that converts between the two.
 */
export interface V2ProjectRecord {
  id: number;
  /** Stable public slug: the /work/[slug] route param and the drawing seed. */
  slug: string;
  name: string;
  year: string;
  discipline: string;
  role: string;
  problem: string;
  outcome: string;
  tech: string[];
  accent: string;
  plateSrc: string;
  plateCaption: string;
  /** CSS object-position for the capture. Empty means "50% 50%". */
  plateFocus: string;
  linkLive: string;
  linkSource: string;
  sortOrder: number;
  cases: V2ProjectCaseBlock[];
}
