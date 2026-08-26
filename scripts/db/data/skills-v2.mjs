/**
 * Seed content for the v2 skills reel.
 *
 * Generated once from what the reel used to render out of `lib/skills-data.ts`
 * (FALLBACK_STACK run through mapStackCategories), so the database starts life
 * with exactly the copy that was hardcoded before it — no transcription drift.
 * From here the database is the source of truth and this file is only a seed.
 *
 * Plain JavaScript, not TypeScript: the seed scripts are run directly by node
 * with no build step and no path-alias resolution.
 *
 * Section shape: key, title, subtitle, description, layer, accent, sortOrder.
 * Skill shape:   name, title, icon, note, weight, sortOrder.
 * There is deliberately no `years` field — it is not modelled and not shown.
 */
export const V2_SKILL_SECTIONS = [
  {
    "key": "frontend",
    "title": "Interface",
    "subtitle": "What the user touches",
    "description": "Rendering, motion and type decisions that survive contact with real users — built once, themed twice, measured always.",
    "layer": "Interface",
    "accent": "#60a5fa",
    "sortOrder": 0,
    "skills": [
      {
        "name": "React",
        "title": "Primary UI runtime",
        "icon": "/tech_icons/React.svg",
        "note": "Concurrent rendering, suspense boundaries and a strict component contract across every surface.",
        "weight": 0.98,
        "sortOrder": 0
      },
      {
        "name": "TypeScript",
        "title": "Type system",
        "icon": "/tech_icons/TypeScript.svg",
        "note": "Strict mode everywhere; discriminated unions instead of defensive runtime checks.",
        "weight": 0.95,
        "sortOrder": 1
      },
      {
        "name": "Next.js",
        "title": "App framework",
        "icon": "/tech_icons/Next.js.svg",
        "note": "App Router, RSC data flow, route handlers and the deploy pipeline behind this site.",
        "weight": 0.94,
        "sortOrder": 2
      },
      {
        "name": "Tailwind CSS",
        "title": "Styling system",
        "icon": "/tech_icons/Tailwind-CSS.svg",
        "note": "CSS-first config with design tokens as custom properties and zero dead utilities.",
        "weight": 0.9,
        "sortOrder": 3
      },
      {
        "name": "GSAP",
        "title": "Motion engine",
        "icon": "/tech_icons/JavaScript.svg",
        "note": "ScrollTrigger choreography, scrub timelines and matchMedia-responsive reveals.",
        "weight": 0.78,
        "sortOrder": 4
      },
      {
        "name": "Redux",
        "title": "Client state",
        "icon": "/tech_icons/Redux.svg",
        "note": "RTK slices reserved for state that server caches cannot own.",
        "weight": 0.66,
        "sortOrder": 5
      }
    ]
  },
  {
    "key": "backend",
    "title": "Services",
    "subtitle": "What answers the request",
    "description": "Business rules sit behind honest contracts: typed modules, predictable failures, no surprises in the response body.",
    "layer": "Services",
    "accent": "#a78bfa",
    "sortOrder": 1,
    "skills": [
      {
        "name": "Node.js",
        "title": "Server runtime",
        "icon": "/tech_icons/Node.js.svg",
        "note": "Event-loop discipline: nothing blocking on the hot path, streams for anything large.",
        "weight": 0.92,
        "sortOrder": 0
      },
      {
        "name": "NestJS",
        "title": "Service framework",
        "icon": "/tech_icons/Nest.js.svg",
        "note": "Modular dependency-injected architecture powering multi-tenant SaaS APIs.",
        "weight": 0.88,
        "sortOrder": 1
      },
      {
        "name": "REST",
        "title": "API style",
        "icon": "/tech_icons/OpenAPI.svg",
        "note": "Versioned resources, idempotent verbs, OpenAPI contracts clients can trust.",
        "weight": 0.86,
        "sortOrder": 2
      },
      {
        "name": "Express.js",
        "title": "HTTP layer",
        "icon": "/tech_icons/Express.svg",
        "note": "Lean routers and middleware chains for focused microservices.",
        "weight": 0.84,
        "sortOrder": 3
      },
      {
        "name": "GraphQL",
        "title": "Query layer",
        "icon": "/tech_icons/GraphQL.svg",
        "note": "Schema-first design with persisted queries for constrained clients.",
        "weight": 0.7,
        "sortOrder": 4
      },
      {
        "name": "Socket.io",
        "title": "Realtime transport",
        "icon": "/tech_icons/Socket.io.svg",
        "note": "Room-based eventing for live dashboards and presence.",
        "weight": 0.64,
        "sortOrder": 5
      }
    ]
  },
  {
    "key": "database",
    "title": "Persistence",
    "subtitle": "What survives a restart",
    "description": "Schemas are promises. Modelling comes before tuning, and every index has to earn its write cost.",
    "layer": "Data",
    "accent": "#3ddc97",
    "sortOrder": 2,
    "skills": [
      {
        "name": "PostgreSQL",
        "title": "Primary store",
        "icon": "/tech_icons/PostgresSQL.svg",
        "note": "Query planning, partial indexes, CTEs.",
        "weight": 0.87,
        "sortOrder": 0
      },
      {
        "name": "MongoDB",
        "title": "Document store",
        "icon": "/tech_icons/MongoDB.svg",
        "note": "Aggregation pipelines with schema-versioned migrations.",
        "weight": 0.82,
        "sortOrder": 1
      },
      {
        "name": "MySQL",
        "title": "Relational standby",
        "icon": "/tech_icons/MySQL.svg",
        "note": "Managed instances tuned for read-heavy reporting loads.",
        "weight": 0.75,
        "sortOrder": 2
      },
      {
        "name": "Prisma",
        "title": "ORM",
        "icon": "",
        "note": "Typed client and migration workflow with regular N+1 audits.",
        "weight": 0.74,
        "sortOrder": 3
      },
      {
        "name": "Mongoose",
        "title": "ODM",
        "icon": "/tech_icons/Mongoose.js.svg",
        "note": "Typed schemas, lean queries and transactions only where required.",
        "weight": 0.72,
        "sortOrder": 4
      },
      {
        "name": "Redis",
        "title": "Cache & queues",
        "icon": "/tech_icons/Redis.svg",
        "note": "Hot-path caching plus worker queues taken off the request cycle.",
        "weight": 0.66,
        "sortOrder": 5
      }
    ]
  },
  {
    "key": "cloud",
    "title": "Infrastructure",
    "subtitle": "What keeps it online",
    "description": "Boring infrastructure on purpose — small surfaces, clear logs, alarms that page a human only when it matters.",
    "layer": "Infrastructure",
    "accent": "#f59e0b",
    "sortOrder": 3,
    "skills": [
      {
        "name": "Docker",
        "title": "Packaging",
        "icon": "/tech_icons/Docker.svg",
        "note": "Multi-stage builds, slim runtimes, compose parity from laptop to CI.",
        "weight": 0.83,
        "sortOrder": 0
      },
      {
        "name": "AWS",
        "title": "Primary cloud",
        "icon": "/tech_icons/AWS.svg",
        "note": "ECS Fargate, RDS, S3 and CloudWatch alarms wired end to end.",
        "weight": 0.79,
        "sortOrder": 1
      },
      {
        "name": "CloudWatch",
        "title": "Observability",
        "icon": "/tech_icons/AWS.svg",
        "note": "Structured logs, metric filters and alarm-driven dashboards.",
        "weight": 0.62,
        "sortOrder": 2
      },
      {
        "name": "NGINX",
        "title": "Edge proxy",
        "icon": "/tech_icons/NGINX.svg",
        "note": "TLS termination, compression and rate limiting at the front door.",
        "weight": 0.58,
        "sortOrder": 3
      },
      {
        "name": "Kubernetes",
        "title": "Orchestration",
        "icon": "/tech_icons/Kubernetes.svg",
        "note": "Helm-charted services with health probes and rolling deploys.",
        "weight": 0.55,
        "sortOrder": 4
      },
      {
        "name": "Google Cloud",
        "title": "Secondary cloud",
        "icon": "/tech_icons/Google-Cloud.svg",
        "note": "Cloud Run jobs and managed Postgres experiments.",
        "weight": 0.5,
        "sortOrder": 5
      }
    ]
  },
  {
    "key": "quality",
    "title": "Verification",
    "subtitle": "What proves it works",
    "description": "Tests are documentation that executes. Coverage follows risk, not vanity metrics.",
    "layer": "Verification",
    "accent": "#f472b6",
    "sortOrder": 4,
    "skills": [
      {
        "name": "Jest",
        "title": "Unit suites",
        "icon": "/tech_icons/Jest.svg",
        "note": "Fast isolated tests with mocks kept at module boundaries.",
        "weight": 0.73,
        "sortOrder": 0
      },
      {
        "name": "Cypress",
        "title": "E2E flows",
        "icon": "/tech_icons/Cypress.svg",
        "note": "Critical-path coverage: auth, checkout and dashboard CRUD.",
        "weight": 0.65,
        "sortOrder": 1
      },
      {
        "name": "Storybook",
        "title": "Component workshop",
        "icon": "/tech_icons/Storybook.svg",
        "note": "Isolated stories doubling as visual regression baselines.",
        "weight": 0.58,
        "sortOrder": 2
      },
      {
        "name": "Playwright",
        "title": "Browser matrix",
        "icon": "",
        "note": "Cross-browser runs replacing a zoo of manual QA scripts.",
        "weight": 0.55,
        "sortOrder": 3
      }
    ]
  },
  {
    "key": "delivery",
    "title": "Delivery",
    "subtitle": "How it ships",
    "description": "From commit to URL without ceremony: automated pipelines, preview environments, rollbacks rehearsed before they are needed.",
    "layer": "Delivery",
    "accent": "#38bdf8",
    "sortOrder": 5,
    "skills": [
      {
        "name": "Git",
        "title": "Version control",
        "icon": "/tech_icons/Git.svg",
        "note": "Trunk-based flow, atomic commits, rebase discipline.",
        "weight": 0.93,
        "sortOrder": 0
      },
      {
        "name": "Vercel",
        "title": "Deploy target",
        "icon": "/tech_icons/Vercel.svg",
        "note": "Preview deploys per pull request make review concrete.",
        "weight": 0.88,
        "sortOrder": 1
      },
      {
        "name": "GitHub Actions",
        "title": "CI pipelines",
        "icon": "/tech_icons/GitHub-Actions.svg",
        "note": "Lint, test, build and image push — cached and parallel.",
        "weight": 0.76,
        "sortOrder": 2
      },
      {
        "name": "Figma",
        "title": "Design handoff",
        "icon": "/tech_icons/Figma.svg",
        "note": "Dev-mode inspection with tokens mirrored into CSS custom properties.",
        "weight": 0.7,
        "sortOrder": 3
      },
      {
        "name": "Jenkins",
        "title": "Legacy CI",
        "icon": "/tech_icons/Jenkins.svg",
        "note": "Kept alive for on-prem release jobs until they migrate.",
        "weight": 0.52,
        "sortOrder": 4
      }
    ]
  }
];
