import type { PortfolioSettings } from "@/lib/dashboard/types";
import { DEFAULT_SITE_VERSION } from "@/lib/siteVersion";

export const fallbackProfile: PortfolioSettings = {
  id: 1,
  name: "Miftaul Islam Shuvro",
  totalProjects: 7,
  yearsOfExperience: 3,
  availability: "Open to Opportunities",
  designations: ["Full Stack Developer", "Software Engineer", "Solution Architect"],
  shortSummary:
    "I build high-performance full stack applications from elegant React interfaces to scalable Node.js / NestJS backends.",
  primaryAvatar: "/ariyan_2.jpg",
  subAvatar: "/ariyan.webp",
  bannerImage: "/hero-bg-2.webp",
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
  siteVersion: DEFAULT_SITE_VERSION,
  updatedAt: new Date().toISOString(),
};

