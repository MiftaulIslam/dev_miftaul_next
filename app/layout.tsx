import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import V2Navbar from "@/components/navbar/v2/V2Navbar";
import SettingsPanel from "@/components/settings/SettingsPanel";
import V2SiteDock from "@/components/navbar/v2/V2SiteDock";
import CursorLayer from "@/components/cursor/CursorLayer";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  // Only tiny labels use it (the hero badge, the scroll cue). A high-priority
  // preload put another ~25KB in front of the CSS and the hero image on every
  // first visit; the metric-matched fallback covers those labels until it lands.
  preload: false,
});

// Display and measure faces, self-hosted. They used to come from a Google Fonts
// @import inside globals.css: render-blocking, two extra origins, and a layout
// shift when they swapped in. Both are variable fonts, so no weight list.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  // Only small labels use it, none in the first screen; a 40KB preload would
  // compete with the CSS for bandwidth on a slow connection.
  preload: false,
});

export const metadata: Metadata = {
  // Resolves relative canonical, og:url and og:image paths against production.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Miftaul Islam Shuvro — Full Stack Developer",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Full stack developer in Dhaka building SaaS platforms with React, Next.js, Node.js, NestJS, GraphQL and AWS.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  // Icons come from app/icon.jpg and app/apple-icon.jpg: 64px and 180px crops
  // of the same photo. They used to point at /ariyan.webp, a 240KB 2039x2697
  // image downloaded and decoded on every first visit just to draw a tab icon.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <head>
        {/* Resolve the stored theme before first paint: no flash, no mismatch. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground overflow-x-hidden intro-active">
        <V2Navbar />
        <LenisProvider>{children}</LenisProvider>
        <V2SiteDock />
        {/* Settings dial is desktop-only */}
        <div className="hidden md:block">
          <SettingsPanel />
        </div>
        <CursorLayer />
      </body>
    </html>
  );
}
