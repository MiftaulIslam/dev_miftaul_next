import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miftaul Islam Shuvro — Full Stack Developer",
  description:
    "Full Stack Developer with 3+ years of experience building high-performance web applications, SaaS platforms, and microservices. React, Next.js, Node.js, NestJS, AWS.",
  keywords: ["Full Stack Developer", "React", "Next.js", "NestJS", "AWS", "Miftaul Islam Shuvro"],
  authors: [{ name: "Miftaul Islam Shuvro", url: "https://miftaul.dev" }],
  openGraph: {
    title: "Miftaul Islam Shuvro — Full Stack Developer",
    description: "Premium portfolio — React, Next.js, NestJS, AWS and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden">
        <LenisProvider>
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
