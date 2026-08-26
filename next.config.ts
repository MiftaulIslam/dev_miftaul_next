import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
