export interface SocialLink {
  iconName: string;
  link: string;
}

export interface PortfolioSettings {
  id: number;
  name: string;
  totalProjects: number;
  yearsOfExperience: number;
  availability: string;
  designations: string[];
  shortSummary: string;
  primaryAvatar: string;
  subAvatar: string;
  bannerImage: string;
  location: string;
  email: string;
  phone: string;
  socials: SocialLink[];
  happyClients: number;
  currentlyFocusedOn: string[];
  detailedSummary: string;
  updatedAt: string;
}

export interface StackTool {
  id: number;
  categoryId: number;
  name: string;
  color: string;
  iconName: string;
}

export interface StackCategory {
  id: number;
  key: string;
  label: string;
  accent: string;
  tools: StackTool[];
}

export interface ProjectRecord {
  id: number;
  title: string;
  subtitle: string;
  role: string;
  description: string[];
  image: string;
  images: string[];
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
  accent: string;
  tag: string;
  sortOrder: number;
}

export interface ExperienceRecord {
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
  sortOrder: number;
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  updatedAt: string;
}

export interface ReviewRecord {
  id: number;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
  featured: boolean;
  updatedAt: string;
}

export interface DashboardOverview {
  projects: number;
  reviews: number;
  experiences: number;
  skills: number;
  blogPosts: number;
  stackTools: number;
  lastUpdated: string | null;
}

