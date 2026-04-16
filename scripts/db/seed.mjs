import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const settings = {
  name: "Miftaul Islam Shuvro",
  totalProjects: 7,
  yearsOfExperience: 3,
  availability: "Open to Opportunities",
  designations: ["Full Stack Developer", "Software Engineer", "Solution Architect"],
  shortSummary:
    "I build high-performance full stack applications from elegant React interfaces to scalable Node.js / NestJS backends.",
  primaryAvatar: "/ariyan_2.jpg",
  subAvatar: "/ariyan.webp",
  bannerImage: "/hero-bg-2.png",
  location: "Dhaka, Bangladesh",
  email: "miftaulislam005@gmail.com",
  phone: "+880 1XXXXXXXXX",
  socials: [
    { iconName: "github", link: "https://github.com/miftaulislam" },
    { iconName: "linkedin", link: "https://linkedin.com/in/miftaulislam" },
    { iconName: "mail", link: "mailto:miftaulislam005@gmail.com" },
  ],
  happyClients: 5,
  currentlyFocusedOn: ["NestJS Microservices", "AWS Architecture", "Golang", "System Design"],
  detailedSummary:
    "I'm a Full Stack Developer with 3+ years of experience crafting high-performance web applications and scalable backend systems.\n\nCurrently building enterprise SaaS at Web Makers LTD while taking on select freelance projects. I care deeply about clean architecture, developer experience, and shipping things that matter to users.",
};

const stackCategories = [
  {
    key: "frontend",
    label: "Frontend",
    accent: "#60a5fa",
    tools: [
      { name: "React", color: "#61dafb", iconName: "React" },
      { name: "Next.js", color: "#e2e8f0", iconName: "Next.js" },
      { name: "TypeScript", color: "#3178c6", iconName: "TypeScript" },
      { name: "Tailwind CSS", color: "#38bdf8", iconName: "Tailwind-CSS" },
      { name: "GSAP", color: "#8bc34a", iconName: "GSAP" },
      { name: "Angular", color: "#dd0031", iconName: "Angular" },
    ],
  },
  {
    key: "backend",
    label: "Backend",
    accent: "#a78bfa",
    tools: [
      { name: "Node.js", color: "#8cc84b", iconName: "Node.js" },
      { name: "Express.js", color: "#d1d5db", iconName: "Express" },
      { name: "NestJS", color: "#e0234e", iconName: "Nest.js" },
      { name: "GraphQL", color: "#e10098", iconName: "GraphQL" },
      { name: "REST", color: "#3b82f6", iconName: "OpenAPI" },
      { name: ".NET MVC", color: "#8b5cf6", iconName: "C#-(CSharp)" },
    ],
  },
  {
    key: "database",
    label: "Database",
    accent: "#34d399",
    tools: [
      { name: "PostgreSQL", color: "#336791", iconName: "PostgresSQL" },
      { name: "MySQL", color: "#4479a1", iconName: "MySQL" },
      { name: "MSSQL", color: "#cc2927", iconName: "Microsoft-SQL-Server" },
      { name: "MongoDB", color: "#47a248", iconName: "MongoDB" },
      { name: "Prisma", color: "#5a67d8", iconName: "Prisma" },
      { name: "Mongoose", color: "#b91c1c", iconName: "Mongoose.js" },
    ],
  },
  {
    key: "cloud",
    label: "Cloud / DevOps",
    accent: "#f59e0b",
    tools: [
      { name: "AWS", color: "#ff9900", iconName: "AWS" },
      { name: "Docker", color: "#2496ed", iconName: "Docker" },
      { name: "Vercel", color: "#e2e8f0", iconName: "Vercel" },
      { name: "CI/CD", color: "#60a5fa", iconName: "Jenkins" },
      { name: "CloudWatch", color: "#f59e0b", iconName: "AWS" },
      { name: "GitHub Actions", color: "#818cf8", iconName: "GitHub-Actions" },
    ],
  },
];

const projects = [
  {
    title: "CreBrains",
    subtitle: "Commercial Real Estate Intelligence",
    role: "Full Stack Developer",
    description: [
      "End-to-end Commercial Real Estate platform enabling buyers, sellers, and brokers to manage properties, documents, and transactions in one place.",
      "Role-based access (Buyer, Seller, Broker, Legal) with automatic task assignment by deal phase due diligence, pre-closing, and closing.",
      "AI-powered document analyzer and Truth Engine for lease summarization, rent roll consistency review, and actionable analytics.",
      "Smart LOI generator, time-bound checklists, and file versioning with diff view for P&L and rent roll documents.",
    ],
    image: "/crebrains_landing.png",
    images: ["/crebrains_dashboard.png", "/crebrains_landing.png"],
    tech: ["React", "TypeScript", "Node.js", "AI/ML", "Real Estate"],
    github: "#",
    demo: "https://crebrains.com",
    featured: true,
    accent: "#3b82f6",
    tag: "Real Estate · Geo · Platform",
  },
  {
    title: "Heobz eCommerce",
    subtitle: "Fresh Food Delivery - Vietnam",
    role: "Full Stack Developer",
    description: [
      "Vietnam-based eCommerce platform delivering fresh food to customers.",
      "Responsive design with fast load times and smooth cart and checkout.",
      "Advanced shipping fee system: nearby orders share delivery cost within a set radius.",
    ],
    image: "/heobz_image.webp",
    images: ["/heobz_image.webp"],
    tech: ["React", "Node.js", "Tailwind", "Redux"],
    github: "#",
    demo: "https://heobz.com/",
    featured: true,
    accent: "#f59e0b",
    tag: "eCommerce · Delivery",
  },
  {
    title: "Hex housing",
    subtitle: "Location-Based Rental Search",
    role: "Full Stack Developer",
    description: [
      "Real estate platform for tenants to search rentals via geolocation without signing in.",
      "Implemented location-based search as full-stack developer.",
      "Optimized performance and reduced latency by 40%.",
    ],
    image: "/hexhousing_image.webp",
    images: ["/hexhousing_image.webp"],
    tech: ["Next.js", "Tailwind", "NextUI", "SWR"],
    github: "#",
    demo: "https://hex-housing.vercel.app/login",
    featured: false,
    accent: "#10b981",
    tag: "Real Estate · GEO",
  },
  {
    title: "VRFY eCommerce",
    subtitle: "Sneaker Storefront",
    role: "Frontend Developer",
    description: [
      "Modern eCommerce platform focused on selling sneakers.",
      "Designed clean, user-friendly, and responsive UI using best practices.",
      "Improved page load performance by 35% and enhanced mobile usability.",
    ],
    image: "/verfy_image.webp",
    images: ["/verfy_image.webp"],
    tech: ["React", "Tailwind", "Redux"],
    github: "#",
    demo: "https://vrfy-react-poject.vercel.app/home",
    featured: false,
    accent: "#e11d48",
    tag: "eCommerce · Retail",
  },
  {
    title: "Ancient Origins",
    subtitle: "Landing Page Redesign",
    role: "Frontend Developer",
    description: [
      "Redesigned landing page using HTML and CSS.",
      "Fixed responsiveness issues and browser incompatibility.",
      "Delivered clean, fully responsive, developer-friendly version for client needs.",
    ],
    image: "/image_Ancient_Origins.webp",
    images: ["/image_Ancient_Origins.webp"],
    tech: ["HTML", "CSS", "Bootstrap"],
    github: "#",
    demo: "https://mazharulislam4.github.io/Ancient_Origins/",
    featured: false,
    accent: "#8b5cf6",
    tag: "Marketing · Static",
  },
];

const experiences = [
  {
    title: "Full Stack Developer",
    company: "Web Makers LTD",
    location: "Mohammadpur, Dhaka, Bangladesh",
    duration: "June 2025 - Present",
    type: "Full-time",
    description: [
      "Developing SaaS applications in collaboration with a 10+ developer team.",
      "Architecting scalable microservices on AWS with NestJS and Golang.",
      "Leading front-end module development with Next.js and React.",
      "Implementing CI/CD pipelines with Docker and cloud infrastructure.",
    ],
    tech: ["React", "Next.js", "NestJS", "Golang", "AWS", "Docker", "SQL", "NoSQL"],
    current: true,
    accent: "#3b82f6",
  },
  {
    title: "Full Stack Developer",
    company: "Solution Insurance Group",
    location: "Remote, Bangladesh",
    duration: "Feb 2025 - June 2025",
    type: "Contractual",
    description: [
      "Developed 3+ sub-projects related to the core insurance application.",
      "Improved application performance by 40% through optimisation.",
      "Built responsive UIs with pixel-perfect design implementation.",
      "Collaborated with 2+ developers on robust application delivery.",
    ],
    tech: ["React", "Next.js", "Supabase", "TypeScript"],
    current: false,
    accent: "#10b981",
  },
  {
    title: "Full Stack Developer",
    company: "Freelancer",
    location: "Remote, Global",
    duration: "2023 - Present",
    type: "Remote · Freelance",
    description: [
      "Designed 5+ interactive dashboards with real-time data visualisation.",
      "Integrated GEO location features improving property search for 10K+ users.",
      "Delivered full-stack solutions for clients across real estate and analytics.",
      "Built REST and GraphQL APIs with Node.js, NestJS, and Asp.Net Core.",
    ],
    tech: ["React", "Next.js", "Node.js", "Asp.Net Core", "SQL", "NoSQL", "Docker"],
    current: true,
    accent: "#8b5cf6",
  },
];

const blogs = [
  {
    title: "How I Design Full-Stack Architectures for Fast Iteration",
    slug: "full-stack-architecture-fast-iteration",
    excerpt: "A practical approach for balancing delivery speed, clean design, and scalability.",
    content:
      "This draft post outlines how I structure frontend-backend boundaries, API contracts, and deployment flow for production teams.",
    published: false,
  },
  {
    title: "From Dashboard Idea to Production in 48 Hours",
    slug: "dashboard-idea-to-production",
    excerpt: "A breakdown of a real delivery sprint with design, database, and deployment.",
    content:
      "In this case study I explain the roadmap, trade-offs, and tooling behind an accelerated product release.",
    published: false,
  },
];

const reviews = [
  {
    clientName: "A. Rahman",
    clientRole: "Product Manager, Real Estate SaaS",
    quote: "Miftaul translated complex requirements into a smooth and reliable platform.",
    rating: 5,
    featured: true,
  },
  {
    clientName: "N. Hoang",
    clientRole: "Founder, eCommerce Startup",
    quote: "Fast execution, clear communication, and production-quality code from day one.",
    rating: 5,
    featured: true,
  },
  {
    clientName: "M. Karim",
    clientRole: "Engineering Lead",
    quote: "Strong backend ownership with thoughtful frontend delivery and clean architecture.",
    rating: 5,
    featured: false,
  },
];

async function run() {
  loadLocalEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local or your environment.");
  }

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    TRUNCATE TABLE
      stack_tools,
      stack_categories,
      projects,
      experiences,
      blogs,
      reviews
    RESTART IDENTITY CASCADE;
  `;
  await sql`DELETE FROM portfolio_settings;`;

  await sql`
    INSERT INTO portfolio_settings (
      id,
      name,
      total_projects,
      years_of_experience,
      availability,
      designations,
      short_summary,
      primary_avatar,
      sub_avatar,
      banner_image,
      location,
      email,
      phone,
      socials,
      happy_clients,
      currently_focused_on,
      detailed_summary,
      updated_at
    )
    VALUES (
      1,
      ${settings.name},
      ${settings.totalProjects},
      ${settings.yearsOfExperience},
      ${settings.availability},
      ${JSON.stringify(settings.designations)}::jsonb,
      ${settings.shortSummary},
      ${settings.primaryAvatar},
      ${settings.subAvatar},
      ${settings.bannerImage},
      ${settings.location},
      ${settings.email},
      ${settings.phone},
      ${JSON.stringify(settings.socials)}::jsonb,
      ${settings.happyClients},
      ${JSON.stringify(settings.currentlyFocusedOn)}::jsonb,
      ${settings.detailedSummary},
      NOW()
    );
  `;

  for (const category of stackCategories) {
    const categoryRows = await sql`
      INSERT INTO stack_categories (key, label, accent, updated_at)
      VALUES (${category.key}, ${category.label}, ${category.accent}, NOW())
      RETURNING id;
    `;
    const categoryId = Number(categoryRows[0].id);

    for (const tool of category.tools) {
      await sql`
        INSERT INTO stack_tools (category_id, name, color, icon_name, updated_at)
        VALUES (${categoryId}, ${tool.name}, ${tool.color}, ${tool.iconName}, NOW());
      `;
    }
  }

  for (const [index, project] of projects.entries()) {
    await sql`
      INSERT INTO projects (
        title, subtitle, role, description, image, images, tech, github, demo, featured, accent, tag, sort_order, updated_at
      )
      VALUES (
        ${project.title},
        ${project.subtitle},
        ${project.role},
        ${JSON.stringify(project.description)}::jsonb,
        ${project.image},
        ${JSON.stringify(project.images)}::jsonb,
        ${JSON.stringify(project.tech)}::jsonb,
        ${project.github},
        ${project.demo},
        ${project.featured},
        ${project.accent},
        ${project.tag},
        ${index + 1},
        NOW()
      );
    `;
  }

  for (const [index, experience] of experiences.entries()) {
    await sql`
      INSERT INTO experiences (
        title, company, location, duration, type, description, tech, current, accent, sort_order, updated_at
      )
      VALUES (
        ${experience.title},
        ${experience.company},
        ${experience.location},
        ${experience.duration},
        ${experience.type},
        ${JSON.stringify(experience.description)}::jsonb,
        ${JSON.stringify(experience.tech)}::jsonb,
        ${experience.current},
        ${experience.accent},
        ${index + 1},
        NOW()
      );
    `;
  }

  for (const blog of blogs) {
    await sql`
      INSERT INTO blogs (title, slug, excerpt, content, published, updated_at)
      VALUES (${blog.title}, ${blog.slug}, ${blog.excerpt}, ${blog.content}, ${blog.published}, NOW());
    `;
  }

  for (const review of reviews) {
    await sql`
      INSERT INTO reviews (client_name, client_role, quote, rating, featured, updated_at)
      VALUES (
        ${review.clientName},
        ${review.clientRole},
        ${review.quote},
        ${review.rating},
        ${review.featured},
        NOW()
      );
    `;
  }

  console.log("Database seed complete.");
}

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

