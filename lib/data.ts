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

// ── Projects ───────────────────────────────────────────────────────────────

export const PROJECTS = [
  {
    id: 1,
    title: "CREBrains",
    subtitle: "Real Estate Intelligence Platform",
    description:
      "Built a full-scale real estate platform with GEO location-based property search, improving search accuracy for 10K+ users. Architected a microservices backend with real-time data feeds and custom dashboards.",
    role: "Full Stack Developer",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
    links: { live: "#", github: "#" },
    accent: "#3b82f6",
    tag: "Real Estate · Geo · Platform",
    image: "/crebrains_landing.png",
  },
  {
    id: 2,
    title: "Ancient Origins",
    subtitle: "Content & Media Publishing Platform",
    description:
      "Developed a high-traffic content platform with rich media management, SEO-optimised server-side rendering, and a headless CMS integration. Reduced page load times by 35% through advanced caching.",
    role: "Frontend Lead",
    stack: ["Next.js", "TypeScript", "GraphQL", "MongoDB", "Tailwind CSS"],
    links: { live: "#", github: "#" },
    accent: "#8b5cf6",
    tag: "Media · Content · SEO",
    image: "/image_Ancient_Origins.webp",
  },
  {
    id: 3,
    title: "Insurance Dashboard",
    subtitle: "Solution Insurance Group — Internal SaaS",
    description:
      "Developed 3+ sub-projects within the core insurance application with pixel-perfect responsive UIs. Improved application performance by 40% through lazy-loading, code splitting, and query optimisation.",
    role: "Full Stack Developer",
    stack: ["React", "Next.js", "Supabase", "TypeScript", "Tailwind CSS"],
    links: { live: "#", github: "#" },
    accent: "#10b981",
    tag: "SaaS · Dashboard · Insurance",
    image: "/crebrains_dashboard.png",
  },
  {
    id: 4,
    title: "GEO Analytics Dashboard",
    subtitle: "Interactive Real-Time Visualisation",
    description:
      "Designed 5+ interactive dashboards with real-time data visualisation and integrated GEO location features. Leveraged WebSockets for live updates and D3-style charting libraries for data storytelling.",
    role: "Freelance Full Stack Developer",
    stack: ["React", "Node.js", "MongoDB", "Docker", "Asp.Net Core"],
    links: { live: "#", github: "#" },
    accent: "#f59e0b",
    tag: "Analytics · GEO · Real-time",
    image: "/hexhousing_image.webp",
  },
  {
    id: 5,
    title: "Enterprise SaaS Platform",
    subtitle: "Web Makers LTD — Confidential",
    description:
      "Collaborating with a 10+ developer team to build a large-scale SaaS application. Responsible for core module architecture, API gateway integration, and scalable microservices design on AWS.",
    role: "Full Stack Developer",
    stack: ["React", "Next.js", "NestJS", "Golang", "AWS", "Docker", "SQL"],
    links: { live: "#", github: "#" },
    accent: "#e11d48",
    tag: "SaaS · Microservices · AWS",
    image: "/heobz_image.webp",
  },
];

// ── Experience ─────────────────────────────────────────────────────────────

export const EXPERIENCE = [
  {
    id: 1,
    role: "Full Stack Developer",
    company: "Web Makers LTD",
    period: "June 2025 – Present",
    type: "Full-time",
    location: "Mohammadpur, Dhaka, Bangladesh",
    current: true,
    achievements: [
      "Developing SaaS applications in collaboration with a 10+ developer team",
      "Architecting scalable microservices on AWS with NestJS and Golang",
      "Leading front-end module development with Next.js and React",
      "Implementing CI/CD pipelines with Docker and cloud infrastructure",
    ],
    stack: ["React", "Next.js", "NestJS", "Golang", "AWS", "Docker", "SQL", "NoSQL"],
    accent: "#3b82f6",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Solution Insurance Group",
    period: "Feb 2025 – June 2025",
    type: "Contractual",
    location: "Remote, Bangladesh",
    current: false,
    achievements: [
      "Developed 3+ sub-projects related to the core insurance application",
      "Improved application performance by 40% through optimisation",
      "Built responsive UIs with pixel-perfect design implementation",
      "Collaborated with 2+ developers on robust application delivery",
    ],
    stack: ["React", "Next.js", "Supabase", "TypeScript"],
    accent: "#10b981",
  },
  {
    id: 3,
    role: "Full Stack Developer",
    company: "Freelancer",
    period: "2023 – Present",
    type: "Remote · Freelance",
    location: "Remote, Global",
    current: true,
    achievements: [
      "Designed 5+ interactive dashboards with real-time data visualisation",
      "Integrated GEO location features improving property search for 10K+ users",
      "Delivered full-stack solutions for clients across real estate and analytics",
      "Built REST and GraphQL APIs with Node.js, NestJS, and Asp.Net Core",
    ],
    stack: ["React", "Next.js", "Node.js", "Asp.Net Core", "SQL", "NoSQL", "Docker"],
    accent: "#8b5cf6",
  },
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
