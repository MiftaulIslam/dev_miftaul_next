// ── All portfolio content ──────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Home",       href: "#hero" },
  { label: "About",      href: "#about" },
  { label: "Skills",     href: "#skills" },
  { label: "Projects",   href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
];

export const SOCIAL_LINKS = [
  { label: "GitHub",   href: "https://github.com/miftaulislam",    icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/miftaulislam", icon: "linkedin" },
  { label: "Email",    href: "mailto:miftaulislam005@gmail.com",   icon: "mail" },
];

// ── Skills ─────────────────────────────────────────────────────────────────

export const SKILLS = [
  {
    category: "Frontend",
    accent: "#3b82f6",
    featured: true,
    items: [
      { name: "React",       color: "#61dafb" },
      { name: "Next.js",     color: "#ffffff" },
      { name: "Angular",     color: "#dd0031" },
      { name: "TypeScript",  color: "#3178c6" },
      { name: "Tailwind CSS",color: "#38bdf8" },
    ],
  },
  {
    category: "Backend",
    accent: "#8b5cf6",
    items: [
      { name: "Node.js",   color: "#8cc84b" },
      { name: "NestJS",    color: "#e0234e" },
      { name: "Golang",    color: "#00add8" },
      { name: "Fastify",   color: "#ffffff" },
      { name: ".NET MVC",  color: "#512bd4" },
      { name: ".NET Web API", color: "#512bd4" },
    ],
  },
  {
    category: "Database",
    accent: "#10b981",
    items: [
      { name: "SQL Server",  color: "#cc2927" },
      { name: "MySQL",       color: "#4479a1" },
      { name: "MongoDB",     color: "#47a248" },
      { name: "PostgreSQL",  color: "#336791" },
      { name: "Redis",       color: "#dc382d" },
      { name: "Firebase",    color: "#ffca28" },
    ],
  },
  {
    category: "Cloud & DevOps",
    accent: "#f59e0b",
    items: [
      { name: "AWS",          color: "#ff9900" },
      { name: "Docker",       color: "#2496ed" },
      { name: "Git",          color: "#f05032" },
      { name: "REST APIs",    color: "#3b82f6" },
      { name: "GraphQL",      color: "#e10098" },
      { name: "JWT",          color: "#d63aff" },
      { name: "Microservices",color: "#64748b" },
    ],
  },
];

export const ALL_TECH_MARQUEE = [
  "React", "Next.js", "TypeScript", "Node.js", "NestJS", "Golang",
  "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "GraphQL",
  "Tailwind CSS", "Angular", "Fastify", ".NET", "SQL Server", "Firebase",
  "Microservices", "REST APIs", "JWT", "Git",
];

// ── Stats ──────────────────────────────────────────────────────────────────

export const STATS = [
  { value: 7,  suffix: "+", label: "Projects Delivered" },
  { value: 3,  suffix: "+", label: "Years Experience" },
  { value: 5,  suffix: "+", label: "Happy Clients" },
];

// ── About ──────────────────────────────────────────────────────────────────

export const ABOUT = {
  bio: [
    "I'm a Full Stack Developer with 3+ years of experience crafting high-performance web applications and scalable backend systems. I specialise in React/Next.js on the frontend and Node.js/NestJS/Golang on the backend — building products that are fast, elegant, and production-ready.",
    "Currently building enterprise SaaS at Web Makers LTD while taking on select freelance projects. I care deeply about clean architecture, developer experience, and shipping things that actually matter to users.",
  ],
  location: "Dhaka, Bangladesh",
  email: "miftaulislam005@gmail.com",
  availability: "Open to Opportunities",
  focusedOn: ["NestJS Microservices", "AWS Architecture", "Golang", "System Design"],
};

// ── CV (Resume) content ────────────────────────────────────────────────────

export const CV = {
  name: "Miftaul Islam Shuvro",
  title: "Full Stack Developer",
  email: "miftaulislam005@gmail.com",
  location: "Dhaka, Bangladesh",
  github: "github.com/miftaulislam",
  linkedin: "linkedin.com/in/miftaulislam",
  summary:
    "Full Stack Developer with 3+ years of experience building scalable web applications, SaaS platforms, and microservices. Proficient in React, Next.js, Node.js, NestJS, Golang and cloud infrastructure on AWS.",
};
