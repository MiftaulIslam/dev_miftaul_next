/* ============================================================================
   SKILL DATA  -  the only file you edit to change content.
   ----------------------------------------------------------------------------
   Every concept reads from this one structure. Nothing in the visual layer is
   hardcoded to these particular names, counts, or categories: add a seventh
   category, drop a skill, rename anything, and all six concepts re-lay-out.

   NOTE ON `weight`
   ----------------
   `weight` (0..1) is deliberately never drawn as a percentage bar. It drives
   *visual weight only* - node radius in ORBIT/LATTICE, type scale in KINETIC,
   card prominence in DECK. Proficiency communicated through composition reads
   as confidence; proficiency communicated as "React 92%" reads as a survey.
   ========================================================================== */
(function (SE) {
  'use strict';

  var ICON_BASE = '../tech_icons/';

  /* Categories are ordered as a request travels through a system:
     interface -> runtime -> contract -> persistence -> delivery -> intelligence.
     STRATA depends on that order; every other concept is order-agnostic. */
  var categories = [
    {
      id: 'interface',
      label: 'Interface',
      kicker: 'What the user touches',
      layer: 'Client',
      hue: 196,
      accent: '#4CC9F0',
      blurb: 'Rendering, state, and motion. The half of the stack that has to feel like nothing at all.',
      skills: [
        { id: 'react',      name: 'React',        weight: 0.95, years: 5, role: 'Component runtime',    note: 'Server Components, suspense boundaries, concurrent rendering.',   icon: 'React.svg' },
        { id: 'nextjs',     name: 'Next.js',      weight: 0.95, years: 4, role: 'Application framework', note: 'App Router, streaming SSR, route handlers, edge middleware.',     icon: 'Next.js.svg' },
        { id: 'typescript', name: 'TypeScript',   weight: 0.92, years: 5, role: 'Type system',           note: 'Discriminated unions, generics, end-to-end inferred contracts.',  icon: 'TypeScript.svg' },
        { id: 'angular',    name: 'Angular',      weight: 0.70, years: 2, role: 'Enterprise framework',  note: 'RxJS-driven state, dependency injection, module federation.',     icon: 'Angular.svg' },
        { id: 'tailwind',   name: 'Tailwind CSS', weight: 0.88, years: 4, role: 'Design tokens',         note: 'v4 CSS-first config, semantic token layers, container queries.',  icon: 'Tailwind-CSS.svg' },
        { id: 'gsap',       name: 'GSAP',         weight: 0.82, years: 3, role: 'Motion engine',         note: 'ScrollTrigger choreography, timelines, FLIP continuity.',         icon: null }
      ]
    },
    {
      id: 'runtime',
      label: 'Runtime',
      kicker: 'Where the work happens',
      layer: 'Application',
      hue: 14,
      accent: '#FF6A3D',
      blurb: 'Process boundaries, queues, and the unglamorous business logic that pays for everything else.',
      skills: [
        { id: 'node',    name: 'Node.js',      weight: 0.93, years: 5, role: 'Server runtime',      note: 'Streams, worker threads, backpressure-aware pipelines.',      icon: 'Node.js.svg' },
        { id: 'express', name: 'Express',      weight: 0.90, years: 5, role: 'HTTP layer',          note: 'Middleware composition, error funnels, request lifecycles.',  icon: 'Express.svg' },
        { id: 'nestjs',  name: 'NestJS',       weight: 0.84, years: 3, role: 'Structured backend',  note: 'Modules, providers, guards, interceptors, CQRS handlers.',    icon: 'Nest.js.svg' },
        { id: 'dotnet',  name: 'ASP.NET Core', weight: 0.72, years: 2, role: 'Enterprise services', note: 'Minimal APIs, EF Core, dependency-injected pipelines.',       icon: 'NET-core.svg' },
        { id: 'go',      name: 'Go',           weight: 0.66, years: 2, role: 'Systems services',    note: 'Goroutines, channels, single-binary deploys for hot paths.',  icon: 'Go.svg' }
      ]
    },
    {
      id: 'contract',
      label: 'Contract',
      kicker: 'How systems agree',
      layer: 'API',
      hue: 268,
      accent: '#A78BFA',
      blurb: 'The shape of the agreement between services. Change it carelessly and everything downstream bleeds.',
      skills: [
        { id: 'graphql', name: 'GraphQL', weight: 0.80, years: 3, role: 'Query contract',    note: 'Schema stitching, dataloader batching, persisted queries.',      icon: 'GraphQL.svg' },
        { id: 'rest',    name: 'REST',    weight: 0.94, years: 5, role: 'Resource contract', note: 'Idempotency, pagination, cache semantics, OpenAPI specs.',       icon: 'OpenAPI.svg' },
        { id: 'prisma',  name: 'Prisma',  weight: 0.86, years: 3, role: 'Data contract',     note: 'Typed schema, migrations, relation queries without raw drift.',  icon: null }
      ]
    },
    {
      id: 'persistence',
      label: 'Persistence',
      kicker: 'What survives a restart',
      layer: 'Data',
      hue: 152,
      accent: '#3DDC97',
      blurb: 'Indexes, transactions, and cache invalidation. The part of the stack that remembers.',
      skills: [
        { id: 'postgres', name: 'PostgreSQL', weight: 0.91, years: 5, role: 'Primary store',    note: 'Query planning, partial indexes, CTEs, row-level security.',  icon: 'PostgresSQL.svg' },
        { id: 'mysql',    name: 'MySQL',      weight: 0.78, years: 4, role: 'Relational store', note: 'Replication topologies, InnoDB tuning, schema migrations.',   icon: 'MySQL.svg' },
        { id: 'mssql',    name: 'MSSQL',      weight: 0.68, years: 2, role: 'Enterprise store', note: 'Stored procedures, execution plans, legacy integrations.',    icon: 'Microsoft-SQL-Server.svg' },
        { id: 'mongo',    name: 'MongoDB',    weight: 0.80, years: 4, role: 'Document store',   note: 'Aggregation pipelines, embedded modelling, change streams.',  icon: 'MongoDB.svg' },
        { id: 'redis',    name: 'Redis',      weight: 0.83, years: 3, role: 'Cache and queue',  note: 'Sorted sets, pub/sub, distributed locks, rate limiting.',     icon: 'Redis.svg' }
      ]
    },
    {
      id: 'delivery',
      label: 'Delivery',
      kicker: 'How it reaches production',
      layer: 'Platform',
      hue: 42,
      accent: '#FFB020',
      blurb: 'Build, ship, observe, roll back. Nothing is real until it survives a deploy on a Friday.',
      skills: [
        { id: 'aws',     name: 'AWS',            weight: 0.82, years: 4, role: 'Cloud platform', note: 'ECS, Lambda, S3, CloudFront, IAM boundaries, CloudWatch.',   icon: 'AWS.svg' },
        { id: 'docker',  name: 'Docker',         weight: 0.88, years: 4, role: 'Packaging',      note: 'Multi-stage builds, layer caching, reproducible images.',     icon: 'Docker.svg' },
        { id: 'actions', name: 'GitHub Actions', weight: 0.85, years: 4, role: 'Pipelines',      note: 'Matrix builds, environment gates, preview deployments.',      icon: 'GitHub-Actions.svg' },
        { id: 'vercel',  name: 'Vercel',         weight: 0.87, years: 4, role: 'Edge delivery',  note: 'ISR, edge functions, image optimisation, instant rollback.',  icon: 'Vercel.svg' }
      ]
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      kicker: 'The newest layer',
      layer: 'Intelligence',
      hue: 330,
      accent: '#FF6FB5',
      blurb: 'Retrieval, tool use, and evaluation. Model calls are cheap; the engineering around them is not.',
      skills: [
        { id: 'llm',    name: 'LLM Integration', weight: 0.86, years: 2, role: 'Model layer',   note: 'Streaming, tool schemas, token budgets, structured output.',  icon: null },
        { id: 'rag',    name: 'RAG',             weight: 0.80, years: 2, role: 'Retrieval',     note: 'Chunking strategy, hybrid search, reranking, citations.',     icon: null },
        { id: 'agents', name: 'AI Agents',       weight: 0.76, years: 1, role: 'Orchestration', note: 'Planner loops, tool routing, guardrails, eval harnesses.',    icon: null }
      ]
    }
  ];

  /* ---------------------------------------------------------------------------
     RELATIONS  -  read by LATTICE (Concept 03) and by every "connects to" list.
     Each pair is [fromId, toId, strength 0..1]. Strength drives edge opacity and
     pulse frequency, not thickness (thickness at this scale reads as noise).

     >>> THE ONE PIECE OF DOMAIN KNOWLEDGE ONLY YOU HAVE. <<<
     The defaults below describe how a modern full-stack app is usually wired.
     Replacing them with how *your* systems are actually wired is what turns
     Concept 03 from a pretty graph into an argument about your engineering.
     Unknown ids are skipped silently, so you can prune freely.
     ------------------------------------------------------------------------ */
  var relations = [
    ['react', 'nextjs', 1.00],    ['nextjs', 'typescript', 0.95], ['react', 'typescript', 0.90],
    ['react', 'tailwind', 0.80],  ['nextjs', 'tailwind', 0.80],   ['react', 'gsap', 0.70],
    ['nextjs', 'vercel', 0.95],   ['angular', 'typescript', 0.85],

    ['nextjs', 'rest', 0.80],     ['nextjs', 'graphql', 0.60],    ['node', 'express', 0.95],
    ['node', 'nestjs', 0.85],     ['node', 'typescript', 0.90],   ['express', 'rest', 0.90],
    ['nestjs', 'graphql', 0.75],  ['nestjs', 'rest', 0.80],       ['dotnet', 'rest', 0.70],
    ['go', 'rest', 0.65],         ['go', 'redis', 0.60],

    ['prisma', 'postgres', 0.95], ['prisma', 'mysql', 0.70],      ['prisma', 'typescript', 0.85],
    ['nestjs', 'prisma', 0.80],   ['nextjs', 'prisma', 0.75],     ['node', 'mongo', 0.70],
    ['dotnet', 'mssql', 0.80],    ['express', 'redis', 0.70],     ['node', 'redis', 0.75],
    ['postgres', 'redis', 0.60],

    ['docker', 'node', 0.85],     ['docker', 'postgres', 0.70],   ['docker', 'go', 0.70],
    ['actions', 'docker', 0.90],  ['actions', 'vercel', 0.70],    ['aws', 'docker', 0.85],
    ['aws', 'postgres', 0.65],    ['aws', 'redis', 0.60],

    ['llm', 'rag', 0.95],         ['rag', 'agents', 0.85],        ['llm', 'agents', 0.90],
    ['rag', 'postgres', 0.70],    ['rag', 'redis', 0.55],         ['llm', 'nextjs', 0.70],
    ['agents', 'rest', 0.60],     ['llm', 'typescript', 0.60]
  ];

  /* --------------------------- derived indexes ---------------------------- */
  var skills = [];
  categories.forEach(function (cat, ci) {
    cat.index = ci;
    cat.skills.forEach(function (s, si) {
      s.category = cat.id;
      s.categoryLabel = cat.label;
      s.accent = cat.accent;
      s.hue = cat.hue;
      s.indexInCategory = si;
      s.iconSrc = s.icon ? ICON_BASE + s.icon : null;
      s.monogram = s.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
      skills.push(s);
    });
  });

  var byId = {};
  skills.forEach(function (s, i) { s.index = i; byId[s.id] = s; });

  var neighbours = {};
  skills.forEach(function (s) { neighbours[s.id] = []; });

  var edges = [];
  relations.forEach(function (r) {
    var a = byId[r[0]], b = byId[r[1]];
    if (!a || !b) return;
    edges.push({ a: a, b: b, strength: r[2] });
    neighbours[a.id].push(b.id);
    neighbours[b.id].push(a.id);
  });

  SE.DATA = {
    identity: {
      name: 'Miftaul Islam',
      role: 'Full-stack engineer',
      tagline: 'Six ways to show a stack'
    },
    categories: categories,
    skills: skills,
    byId: byId,
    edges: edges,
    neighbours: neighbours,
    related: function (id, limit) {
      var list = (neighbours[id] || []).map(function (n) { return byId[n]; });
      return typeof limit === 'number' ? list.slice(0, limit) : list;
    }
  };
})(window.SE = window.SE || {});
