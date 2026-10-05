import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets parallel local sessions build side by side (e.g. NEXT_DIST_DIR=.next-perf)
  // without overwriting the .next a running `next start` serves from.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        // Dashboard uploads live in Vercel Blob. The store id is part of the
        // hostname and changes per store, so the subdomain is a wildcard —
        // pinning it would break the first time the store is recreated.
        // `next/image` refuses to optimise a remote host that is not listed
        // here, so without this every uploaded image 400s instead of rendering.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
  // Kept out of search indexes: API JSON, the dashboard, and the /devxp scratch page.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
    return ["/api/:path*", "/dashboard", "/dashboard/:path*", "/devxp"].map((source) => ({
      source,
      headers: noindex,
    }));
  },
};

export default nextConfig;
