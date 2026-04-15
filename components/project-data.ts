export type ProjectDescription = string | string[];

export interface Project {
  title: string;
  description: ProjectDescription;
  image: string;
  images?: string[];
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    title: "CreBrains",
    description: [
      "End-to-end Commercial Real Estate platform enabling buyers, sellers, and brokers to manage properties, documents, and transactions in one place.",
      "Role-based access (Buyer, Seller, Broker, Legal) with automatic task assignment by deal phase—due diligence, pre-closing, and closing.",
      "AI-powered document analyzer and Truth Engine for lease summarization, rent roll consistency review, and actionable analytics.",
      "Smart LOI generator, time-bound checklists, and file versioning with diff view for P&L and rent roll documents.",
    ],
    image: "/crebrains_landing.png",
    images: [
      "/crebrains_dashboard.png",
      "/crebrains_landing.png",
    ],
    tech: ["React", "TypeScript", "Node.js", "AI/ML", "Real Estate"],
    github: "#",
    demo: "https://crebrains.com",
    featured: true,
  },{
    title: "Heobz eCommerce",
    description: [
      "Vietnam-based eCommerce platform delivering fresh food to customers.",
      "Responsive design with fast load times and smooth cart and checkout.",
      "Advanced shipping fee system: nearby orders share delivery cost within a set radius.",
    ],
    image: "/heobz_image.webp",
    tech: ["React", "Node.js", "Tailwind", "Redux"],
    github: "#",
    demo: "https://heobz.com/",
    featured: true,
  },
  {
    title: "Hex housing",
    description: [
      "Real estate platform for tenants to search rentals via geolocation without signing in.",
      "Implemented location-based search as full-stack developer.",
      "Optimized performance and reduced latency by 40%.",
    ],
    image: "/hexhousing_image.webp",
    tech: ["Next.js", "Tailwind", "NextUI", "SWR"],
    github: "#",
    demo: "https://hex-housing.vercel.app/login",
    featured: false,
  },
  {
    title: "VRFY eCommerce",
    description: [
      "Modern eCommerce platform focused on selling sneakers.",
      "Designed clean, user-friendly, and responsive UI using best practices.",
      "Improved page load performance by 35% and enhanced mobile usability.",
    ],
    image: "/verfy_image.webp",
    tech: ["React", "Tailwind", "Redux"],
    github: "#",
    demo: "https://vrfy-react-poject.vercel.app/home",
    featured: false,
  },
  {
    title: "Ancient Origins",
    description: [
      "Redesigned landing page using HTML and CSS.",
      "Fixed responsiveness issues and browser incompatibility.",
      "Delivered clean, fully responsive, developer-friendly version for client needs.",
    ],
    image: "/image_Ancient_Origins.webp",
    tech: ["HTML", "CSS", "Bootstrap"],
    github: "#",
    demo: "https://mazharulislam4.github.io/Ancient_Origins/",
    featured: false,
  },

];
