export interface Experience {
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
}

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Full Stack Developer",
    company: "Web Makers LTD",
    location: "Mohammadpur, Dhaka, Bangladesh",
    duration: "June 2025 – Present",
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
    id: 2,
    title: "Full Stack Developer",
    company: "Solution Insurance Group",
    location: "Remote, Bangladesh",
    duration: "Feb 2025 – June 2025",
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
    id: 3,
    title: "Full Stack Developer",
    company: "Freelancer",
    location: "Remote, Global",
    duration: "2023 – Present",
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
