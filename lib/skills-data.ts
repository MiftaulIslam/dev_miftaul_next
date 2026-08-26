import type {
  NeighbourEdge,
  Skill,
  SkillCategory,
  SkillId,
  SkillIndex,
  SkillRelation,
} from "@/types/skills";
import type { StackCategory, V2SkillSection } from "@/lib/dashboard/types";

interface ToolEnrichment {
  weight: number;
  role: string;
  note: string;
}

interface CategoryCopy {
  layer: string;
  kicker: string;
  blurb: string;
}

const DEFAULT_ENRICHMENT: ToolEnrichment = {
  weight: 0.55,
  role: "In production",
  note: "Part of the working set on shipped projects.",
};

const SKILL_ENRICHMENT: Record<string, ToolEnrichment> = {
  React: { weight: 0.98, role: "Primary UI runtime", note: "Concurrent rendering, suspense boundaries and a strict component contract across every surface." },
  "Next.js": { weight: 0.94, role: "App framework", note: "App Router, RSC data flow, route handlers and the deploy pipeline behind this site." },
  TypeScript: { weight: 0.95, role: "Type system", note: "Strict mode everywhere; discriminated unions instead of defensive runtime checks." },
  "Tailwind CSS": { weight: 0.9, role: "Styling system", note: "CSS-first config with design tokens as custom properties and zero dead utilities." },
  GSAP: { weight: 0.78, role: "Motion engine", note: "ScrollTrigger choreography, scrub timelines and matchMedia-responsive reveals." },
  Redux: { weight: 0.66, role: "Client state", note: "RTK slices reserved for state that server caches cannot own." },
  "Node.js": { weight: 0.92, role: "Server runtime", note: "Event-loop discipline: nothing blocking on the hot path, streams for anything large." },
  NestJS: { weight: 0.88, role: "Service framework", note: "Modular dependency-injected architecture powering multi-tenant SaaS APIs." },
  "Express.js": { weight: 0.84, role: "HTTP layer", note: "Lean routers and middleware chains for focused microservices." },
  REST: { weight: 0.86, role: "API style", note: "Versioned resources, idempotent verbs, OpenAPI contracts clients can trust." },
  GraphQL: { weight: 0.7, role: "Query layer", note: "Schema-first design with persisted queries for constrained clients." },
  "Socket.io": { weight: 0.64, role: "Realtime transport", note: "Room-based eventing for live dashboards and presence." },
  PostgreSQL: { weight: 0.87, role: "Primary store", note: "Query planning, partial indexes, CTEs." },
  MongoDB: { weight: 0.82, role: "Document store", note: "Aggregation pipelines with schema-versioned migrations." },
  MySQL: { weight: 0.75, role: "Relational standby", note: "Managed instances tuned for read-heavy reporting loads." },
  MSSQL: { weight: 0.6, role: "Enterprise SQL", note: "Stored procedures and columnstore indexes on legacy estates." },
  Prisma: { weight: 0.74, role: "ORM", note: "Typed client and migration workflow with regular N+1 audits." },
  Mongoose: { weight: 0.72, role: "ODM", note: "Typed schemas, lean queries and transactions only where required." },
  Redis: { weight: 0.66, role: "Cache & queues", note: "Hot-path caching plus worker queues taken off the request cycle." },
  AWS: { weight: 0.79, role: "Primary cloud", note: "ECS Fargate, RDS, S3 and CloudWatch alarms wired end to end." },
  Docker: { weight: 0.83, role: "Packaging", note: "Multi-stage builds, slim runtimes, compose parity from laptop to CI." },
  Kubernetes: { weight: 0.55, role: "Orchestration", note: "Helm-charted services with health probes and rolling deploys." },
  NGINX: { weight: 0.58, role: "Edge proxy", note: "TLS termination, compression and rate limiting at the front door." },
  CloudWatch: { weight: 0.62, role: "Observability", note: "Structured logs, metric filters and alarm-driven dashboards." },
  "Google Cloud": { weight: 0.5, role: "Secondary cloud", note: "Cloud Run jobs and managed Postgres experiments." },
  Azure: { weight: 0.45, role: "Enterprise cloud", note: "App Service deployments alongside existing AD-backed estate." },
  ".NET MVC": { weight: 0.55, role: "Legacy services", note: "Maintenance and API facades over long-lived enterprise modules." },
  Angular: { weight: 0.6, role: "Client framework", note: "RxJS-heavy enterprise dashboards handed over with docs." },
  Jest: { weight: 0.73, role: "Unit suites", note: "Fast isolated tests with mocks kept at module boundaries." },
  Cypress: { weight: 0.65, role: "E2E flows", note: "Critical-path coverage: auth, checkout and dashboard CRUD." },
  Playwright: { weight: 0.55, role: "Browser matrix", note: "Cross-browser runs replacing a zoo of manual QA scripts." },
  Storybook: { weight: 0.58, role: "Component workshop", note: "Isolated stories doubling as visual regression baselines." },
  Git: { weight: 0.93, role: "Version control", note: "Trunk-based flow, atomic commits, rebase discipline." },
  "GitHub Actions": { weight: 0.76, role: "CI pipelines", note: "Lint, test, build and image push — cached and parallel." },
  Vercel: { weight: 0.88, role: "Deploy target", note: "Preview deploys per pull request make review concrete." },
  Jenkins: { weight: 0.52, role: "Legacy CI", note: "Kept alive for on-prem release jobs until they migrate." },
  Figma: { weight: 0.7, role: "Design handoff", note: "Dev-mode inspection with tokens mirrored into CSS custom properties." },
};

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  frontend: {
    layer: "Interface",
    kicker: "What the user touches",
    blurb: "Rendering, motion and type decisions that survive contact with real users — built once, themed twice, measured always.",
  },
  backend: {
    layer: "Services",
    kicker: "What answers the request",
    blurb: "Business rules sit behind honest contracts: typed modules, predictable failures, no surprises in the response body.",
  },
  database: {
    layer: "Data",
    kicker: "What survives a restart",
    blurb: "Schemas are promises. Modelling comes before tuning, and every index has to earn its write cost.",
  },
  cloud: {
    layer: "Infrastructure",
    kicker: "What keeps it online",
    blurb: "Boring infrastructure on purpose — small surfaces, clear logs, alarms that page a human only when it matters.",
  },
  quality: {
    layer: "Verification",
    kicker: "What proves it works",
    blurb: "Tests are documentation that executes. Coverage follows risk, not vanity metrics.",
  },
  delivery: {
    layer: "Delivery",
    kicker: "How it ships",
    blurb: "From commit to URL without ceremony: automated pipelines, preview environments, rollbacks rehearsed before they are needed.",
  },
};

const DEFAULT_CATEGORY_COPY: CategoryCopy = {
  layer: "Layer",
  kicker: "The craft layer",
  blurb: "Tools chosen deliberately and carried in production, not collected.",
};

/** Name -> /tech_icons asset. Curated against public/tech_icons; null means "known missing, use monogram". */
export const TECH_ICON_SRC: Record<string, string | null> = {
  React: "/tech_icons/React.svg",
  "Next.js": "/tech_icons/Next.js.svg",
  TypeScript: "/tech_icons/TypeScript.svg",
  "Tailwind CSS": "/tech_icons/Tailwind-CSS.svg",
  JavaScript: "/tech_icons/JavaScript.svg",
  GSAP: "/tech_icons/JavaScript.svg",
  Angular: "/tech_icons/Angular.svg",
  Redux: "/tech_icons/Redux.svg",
  "Node.js": "/tech_icons/Node.js.svg",
  "Express.js": "/tech_icons/Express.svg",
  NestJS: "/tech_icons/Nest.js.svg",
  GraphQL: "/tech_icons/GraphQL.svg",
  REST: "/tech_icons/OpenAPI.svg",
  "Socket.io": "/tech_icons/Socket.io.svg",
  ".NET MVC": "/tech_icons/C#-(CSharp).svg",
  PostgreSQL: "/tech_icons/PostgresSQL.svg",
  MySQL: "/tech_icons/MySQL.svg",
  MSSQL: "/tech_icons/Microsoft-SQL-Server.svg",
  MongoDB: "/tech_icons/MongoDB.svg",
  Prisma: null,
  Mongoose: "/tech_icons/Mongoose.js.svg",
  Redis: "/tech_icons/Redis.svg",
  AWS: "/tech_icons/AWS.svg",
  Docker: "/tech_icons/Docker.svg",
  Kubernetes: "/tech_icons/Kubernetes.svg",
  NGINX: "/tech_icons/NGINX.svg",
  Vercel: "/tech_icons/Vercel.svg",
  "Google Cloud": "/tech_icons/Google-Cloud.svg",
  Azure: "/tech_icons/Azure.svg",
  CloudWatch: "/tech_icons/AWS.svg",
  "CI/CD": "/tech_icons/Jenkins.svg",
  Jenkins: "/tech_icons/Jenkins.svg",
  "GitHub Actions": "/tech_icons/GitHub-Actions.svg",
  Git: "/tech_icons/Git.svg",
  Jest: "/tech_icons/Jest.svg",
  Cypress: "/tech_icons/Cypress.svg",
  Storybook: "/tech_icons/Storybook.svg",
  Figma: "/tech_icons/Figma.svg",
  Python: "/tech_icons/Python.svg",
  Django: "/tech_icons/Django.svg",
};

export function resolveSkillIconSrc(name: string, iconName?: string | null): string | null {
  const encode = (path: string) => path.replace(/#/g, "%23");
  if (name in TECH_ICON_SRC) {
    const mapped = TECH_ICON_SRC[name];
    return mapped ? encode(mapped) : null;
  }
  if (iconName) {
    if (iconName.startsWith("/")) return encode(iconName);
    return encode(`/tech_icons/${iconName.endsWith(".svg") ? iconName : `${iconName}.svg`}`);
  }
  return null;
}

export function slugifySkillId(name: string): SkillId {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function enrichTool(name: string, iconName?: string | null): Skill {
  const extra = SKILL_ENRICHMENT[name] ?? DEFAULT_ENRICHMENT;
  return {
    id: slugifySkillId(name),
    name,
    weight: extra.weight,
    role: extra.role,
    note: extra.note,
    iconSrc: resolveSkillIconSrc(name, iconName),
  };
}

export function mapStackCategories(categories: StackCategory[]): SkillCategory[] {
  return categories
    .filter((category) => Array.isArray(category.tools) && category.tools.length > 0)
    .map((category) => {
      const copy = CATEGORY_COPY[category.key] ?? {
        ...DEFAULT_CATEGORY_COPY,
        layer: category.label,
      };
      const skills = category.tools
        .map((tool) => enrichTool(tool.name, tool.iconName))
        .sort((a, b) => b.weight - a.weight);
      return {
        id: category.key || String(category.id),
        label: category.label,
        kicker: copy.kicker,
        layer: copy.layer,
        accent: category.accent,
        blurb: copy.blurb,
        skills,
      };
    });
}

/**
 * Database rows -> the reel's view model.
 *
 * The v2 tables carry their own copy, so unlike `mapStackCategories` this does
 * no enrichment lookup at all: nothing here falls back to a hardcoded map, and
 * editing a subtitle in the dashboard changes what the reel says. That is the
 * whole point of the v2 tables existing.
 *
 * Empty sections are dropped rather than rendered as a blank scene — a section
 * with no skills has nothing to show and would just be a dead stop in the reel.
 */
export function mapV2Sections(sections: V2SkillSection[]): SkillCategory[] {
  return sections
    .filter((section) => Array.isArray(section.skills) && section.skills.length > 0)
    .map((section) => ({
      id: section.key || String(section.id),
      label: section.title,
      kicker: section.subtitle,
      layer: section.layer || section.title,
      accent: section.accent,
      blurb: section.description,
      skills: section.skills.map((skill) => ({
        id: slugifySkillId(skill.name),
        name: skill.name,
        weight: skill.weight,
        role: skill.title,
        note: skill.note,
        // Rows store the resolved path; fall back to the name lookup for a row
        // typed in the dashboard without one.
        iconSrc: skill.icon || resolveSkillIconSrc(skill.name),
      })),
    }));
}

/** Undirected craft relationships, strength 0..1. Referenced by slug ids. */
export const SKILL_RELATIONS: SkillRelation[] = [
  ["react", "next-js", 0.96],
  ["react", "typescript", 0.9],
  ["next-js", "typescript", 0.92],
  ["react", "tailwind-css", 0.85],
  ["react", "gsap", 0.68],
  ["next-js", "vercel", 0.88],
  ["tailwind-css", "figma", 0.6],
  ["node-js", "nest-js", 0.9],
  ["node-js", "express-js", 0.86],
  ["typescript", "nestjs", 0.84],
  ["node-js", "rest", 0.8],
  ["nestjs", "graphql", 0.64],
  ["node-js", "socket-io", 0.6],
  ["postgresql", "prisma", 0.78],
  ["mongodb", "mongoose", 0.86],
  ["redis", "node-js", 0.68],
  ["postgresql", "aws", 0.6],
  ["aws", "docker", 0.74],
  ["docker", "kubernetes", 0.7],
  ["docker", "nginx", 0.54],
  ["docker", "github-actions", 0.72],
  ["git", "github-actions", 0.9],
  ["jest", "cypress", 0.56],
];

export const FALLBACK_STACK: StackCategory[] = [
  {
    id: 1,
    key: "frontend",
    label: "Interface",
    accent: "#60a5fa",
    tools: [
      { id: 1, categoryId: 1, name: "React", color: "#61dafb", iconName: "React" },
      { id: 2, categoryId: 1, name: "Next.js", color: "#e2e8f0", iconName: "Next.js" },
      { id: 3, categoryId: 1, name: "TypeScript", color: "#3178c6", iconName: "TypeScript" },
      { id: 4, categoryId: 1, name: "Tailwind CSS", color: "#38bdf8", iconName: "Tailwind-CSS" },
      { id: 5, categoryId: 1, name: "GSAP", color: "#8bc34a", iconName: "JavaScript" },
      { id: 6, categoryId: 1, name: "Redux", color: "#764abc", iconName: "Redux" },
    ],
  },
  {
    id: 2,
    key: "backend",
    label: "Services",
    accent: "#a78bfa",
    tools: [
      { id: 7, categoryId: 2, name: "Node.js", color: "#8cc84b", iconName: "Node.js" },
      { id: 8, categoryId: 2, name: "NestJS", color: "#e0234e", iconName: "Nest.js" },
      { id: 9, categoryId: 2, name: "REST", color: "#3b82f6", iconName: "OpenAPI" },
      { id: 10, categoryId: 2, name: "Express.js", color: "#d1d5db", iconName: "Express" },
      { id: 11, categoryId: 2, name: "GraphQL", color: "#e10098", iconName: "GraphQL" },
      { id: 12, categoryId: 2, name: "Socket.io", color: "#ffffff", iconName: "Socket.io" },
    ],
  },
  {
    id: 3,
    key: "database",
    label: "Persistence",
    accent: "#3ddc97",
    tools: [
      { id: 13, categoryId: 3, name: "PostgreSQL", color: "#336791", iconName: "PostgresSQL" },
      { id: 14, categoryId: 3, name: "MongoDB", color: "#47a248", iconName: "MongoDB" },
      { id: 15, categoryId: 3, name: "MySQL", color: "#4479a1", iconName: "MySQL" },
      { id: 16, categoryId: 3, name: "Prisma", color: "#5a67d8", iconName: "" },
      { id: 17, categoryId: 3, name: "Mongoose", color: "#b91c1c", iconName: "Mongoose.js" },
      { id: 18, categoryId: 3, name: "Redis", color: "#ff4438", iconName: "Redis" },
    ],
  },
  {
    id: 4,
    key: "cloud",
    label: "Infrastructure",
    accent: "#f59e0b",
    tools: [
      { id: 19, categoryId: 4, name: "AWS", color: "#ff9900", iconName: "AWS" },
      { id: 20, categoryId: 4, name: "Docker", color: "#2496ed", iconName: "Docker" },
      { id: 21, categoryId: 4, name: "Kubernetes", color: "#326ce5", iconName: "Kubernetes" },
      { id: 22, categoryId: 4, name: "NGINX", color: "#009639", iconName: "NGINX" },
      { id: 23, categoryId: 4, name: "CloudWatch", color: "#f59e0b", iconName: "AWS" },
      { id: 24, categoryId: 4, name: "Google Cloud", color: "#ea4335", iconName: "Google-Cloud" },
    ],
  },
  {
    id: 5,
    key: "quality",
    label: "Verification",
    accent: "#f472b6",
    tools: [
      { id: 25, categoryId: 5, name: "Jest", color: "#99424f", iconName: "Jest" },
      { id: 26, categoryId: 5, name: "Cypress", color: "#69d3a7", iconName: "Cypress" },
      { id: 27, categoryId: 5, name: "Storybook", color: "#ff4785", iconName: "Storybook" },
      { id: 28, categoryId: 5, name: "Playwright", color: "#2ead33", iconName: "" },
    ],
  },
  {
    id: 6,
    key: "delivery",
    label: "Delivery",
    accent: "#38bdf8",
    tools: [
      { id: 29, categoryId: 6, name: "Git", color: "#f05032", iconName: "Git" },
      { id: 30, categoryId: 6, name: "GitHub Actions", color: "#818cf8", iconName: "GitHub-Actions" },
      { id: 31, categoryId: 6, name: "Vercel", color: "#e2e8f0", iconName: "Vercel" },
      { id: 32, categoryId: 6, name: "Jenkins", color: "#d33833", iconName: "Jenkins" },
      { id: 33, categoryId: 6, name: "Figma", color: "#f24e1e", iconName: "Figma" },
    ],
  },
];

export function deriveSkillIndex(
  categories: SkillCategory[],
  relations: SkillRelation[] = SKILL_RELATIONS
): SkillIndex {
  const skills = categories.flatMap((category) => category.skills);
  const skillsById = new Map<SkillId, Skill>(skills.map((skill) => [skill.id, skill]));

  const neighbours = new Map<SkillId, NeighbourEdge[]>();
  const addEdge = (from: SkillId, to: SkillId, strength: number) => {
    if (!skillsById.has(from) || !skillsById.has(to)) return;
    const list = neighbours.get(from) ?? [];
    if (!list.some((edge) => edge.id === to)) {
      list.push({ id: to, strength });
      neighbours.set(from, list);
    }
  };
  for (const [from, to, strength] of relations) {
    addEdge(from, to, strength);
    addEdge(to, from, strength);
  }

  return { categories, skills, skillsById, neighbours };
}
