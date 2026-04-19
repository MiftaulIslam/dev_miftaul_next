export type ResumeContactLink = {
  label: string;
  href: string;
};

export type ResumeEntry = {
  headingPrefix: string;
  headingEmphasis?: string;
  headingSuffix?: string;
  date?: string;
  subtitle?: string;
  bullets: string[];
  link?: string;
};

export type ResumeSkillLine = {
  level: string;
  value: string;
};

export const resumeContent = {
  name: "Miftaul Islam Shuvro",
  title: "Full Stack Developer",
  location: "Dhaka, Bangladesh",
  phone: "01303-380036",
  email: "miftaulislam005@gmail.com",
  links: [
    { label: "miftaul.com", href: "https://miftaul.com" },
    { label: "Github", href: "https://github.com/miftaulislam" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/miftaulislam/" },
    { label: "Leetcode", href: "https://leetcode.com" },
  ] as ResumeContactLink[],
  languages: "English(Conversional), Bangla(Native)",
  summary:
    "Full-Stack Developer with 3+ years architecting scalable SaaS applications and leading high-performing teams. Specialized in system design, RBAC, and serverless architectures following clean architecture and design patterns.",
  skills: [
    {
      level: "Advance",
      value: "TypeScript, React/NextJS, Node.js, GraphQL, SQL, AWS.",
    },
    { level: "Intermediate", value: "Go, .NET, Docker." },
    { level: "Fimiliar", value: "C#, Azure, Python." },
  ] as ResumeSkillLine[],
  experiences: [
    {
      headingPrefix: "Full Stack Engineer, ",
      headingEmphasis: "Web Makers Ltd.",
      date: "June 2025 - Present(Full-time)",
      link: "https://webmakerslimited.com/",
      bullets: [
        "Architected and deployed SaaS applications in collaboration with 10+ developers.",
        "Enhanced backend security: Implemented rate-limiting & input validation, reducing security incidents by 85% (0 breaches in 6 months).",
        "Optimized system performance using queues & caching: Reduced API response time: 800ms to 300ms.",
        "Acted as Solution Architect for key features, designing scalable systems from requirements to production delivery.",
      ],
    },
    {
      headingPrefix: "Full Stack Developer, Solution Insurance Group",
      date: "Feb 2025 - June 2025 (Contractual)",
      bullets: [
        "Implemented infinite scroll with virtualization for large datasets: Reduced initial load time from 4.2s to 1.1s (74% improvement).",
        "Developed drag-and-drop form builder with backend integration: Enabled non-technical users to create complex forms (80% reduction in support tickets).",
        "Build 2+ sub projects related to the core application.",
      ],
    },
    {
      headingPrefix: "Hex Housing (Property Search Platform)",
      date: "July 2024 - Dec 2024 (Contractual)",
      bullets: [
        "Integrated advanced geolocation features (radius-based search, proximity filtering) for Hex Housing.",
        "Enabled 10K+ users to find relevant properties within a customizable search radius.",
        "Improved property discovery and user engagement, contributing to increased lead generation.",
      ],
    },
    {
      headingPrefix: "Homz eCommerce",
      date: "Aug 2023 - April 2024 (Contractual)",
      bullets: [
        "Built a scalable eCommerce platform using Next.js and Supabase, supporting multi-product listings and category-based filtering for improved product discovery.",
        "Implemented an advanced shipping fee system (distance-based & shared delivery logic), improving checkout completion rate by 25%.",
        "Optimized frontend performance and data fetching, reducing load time by 35% and improving overall user engagement.",
      ],
    },
    {
      headingPrefix: "Full Stack Developer, Freelance",
      subtitle: "2023 - Present",
      bullets: [
        "Designed & deployed 5+ interactive dashboards with real-time data visualization across 3 different industries.",
        "Build 2+ sub projects related to the core application.",
        "Enabled data-driven decision-making for C-suite executives.",
        "Used React + D3.js/Recharts + WebSocket for real-time updates.",
        "Developed e-commerce apps with Advanced shipping fee system.",
      ],
    },
  ] as ResumeEntry[],
  projects: [
    {
      headingPrefix: "",
      headingEmphasis: "CreBrains",
      headingSuffix: " - CRE Automation Platform",
      link: "https://crebrains.com",
      bullets: [
        "Built a Commercial Real Estate (CRE) automation platform for managing tasks, workflows, and documents with multi-scope RBAC system (Organisation, Transaction, Task, Document level).",
        "Acted as Solution Architect, defining system design, modular architecture, and backend structure.",
        "Led 2+ developers, delivering 5+ core features from business requirements to production.",
        "Built backend using Node.js, GraphQL, and AWS Lambda, handling scalable serverless workloads. Integrated Go (Golang) services for high-performance endpoints, reducing response time by 30-40%.",
        "Integrated Python for AI-driven workflows, integrating LLM-based processing for automation and intelligent features.",
      ],
    },
    {
      headingPrefix: "",
      headingEmphasis: "Meetyy",
      headingSuffix: " - Mentor Booking & Session Platform",
      link: "https://dev.meetyy.net",
      bullets: [
        "Built a mentor-user booking platform with 2+ developers, featuring paid sessions, calendar scheduling, and video/chat support, while improving frontend performance and reusability.",
        "Designed backend architecture and database schema, along with calendar system and key frontend flows.",
        "Implemented Clean Architecture with Repository, Specification, and Unit of Work patterns to optimize database querying and ensure scalable, maintainable codebase.",
        "Improved performance using caching, optimized queries, and reusable frontend state/HTTP utilities, including a Google Calendar-style scheduling system.",
      ],
    },
    {
      headingPrefix: "Axivo - Task Management Platform",
      bullets: [
        "Built a multi-tenant task management platform with Kanban board, list view, docs, and whiteboard.",
        "Developed backend using NestJS and frontend with React, designing scalable APIs and data models.",
        "Created a custom drag-and-drop engine, optimizing performance and reducing UI lag during task/column movements.",
        "Reduced UI interaction latency by 30% with custom drag-and-drop implementation.",
        "Optimized performance across frontend and backend, ensuring smooth handling of complex task workflows.",
      ],
    },
  ] as ResumeEntry[],
  education: {
    degree: "Diploma In Engineering",
    major: "Computer Science and Technology",
    institute: "CPI Management and Technology",
    duration: "2023 - 2026",
  },
} as const;
