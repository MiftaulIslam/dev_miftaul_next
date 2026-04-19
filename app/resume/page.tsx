import type { Metadata } from "next";
import ResumeDocument from "@/components/resume/ResumeDocument";
import ResumeToolbar from "@/components/resume/ResumeToolbar";
import ResumeIntroReset from "@/components/resume/ResumeIntroReset";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miftaul.com";
const RESUME_URL = `${SITE_URL}/resume`;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Miftaul Islam Shuvro Resume | Full Stack Developer",
  description:
    "Official resume of Miftaul Islam Shuvro, Full Stack Developer with expertise in React, Next.js, Node.js, NestJS, AWS, and scalable SaaS architecture.",
  keywords: [
    "Miftaul Islam Shuvro resume",
    "Full Stack Developer resume",
    "React Next.js Node.js developer",
    "NestJS AWS developer",
    "Bangladesh software engineer",
  ],
  alternates: {
    canonical: RESUME_URL,
  },
  openGraph: {
    title: "Miftaul Islam Shuvro Resume | Full Stack Developer",
    description:
      "Explore the resume of Miftaul Islam Shuvro: projects, experience, skills, and education.",
    url: RESUME_URL,
    siteName: "Miftaul Islam Shuvro Portfolio",
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miftaul Islam Shuvro Resume | Full Stack Developer",
    description:
      "Projects, experience, skills, and education of Miftaul Islam Shuvro.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function ResumePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Miftaul Islam Shuvro Resume",
    url: RESUME_URL,
    mainEntity: {
      "@type": "Person",
      name: "Miftaul Islam Shuvro",
      jobTitle: "Full Stack Developer",
      url: SITE_URL,
      email: "mailto:miftaulislam005@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "Bangladesh",
      },
      sameAs: [
        "https://github.com/miftaulislam",
        "https://www.linkedin.com/in/miftaulislam/",
      ],
    },
  };

  return (
    <main className="min-h-screen bg-slate-200 print:bg-white">
      <ResumeIntroReset />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ResumeToolbar />
      <div className="px-4 py-6 print:p-0">
        <ResumeDocument />
      </div>
    </main>
  );
}
