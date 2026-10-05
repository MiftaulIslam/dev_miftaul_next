import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Every crawler — search and AI alike (Googlebot, Bingbot, OAI-SearchBot,
 * GPTBot, ClaudeBot, PerplexityBot) — gets the public site on purpose: this is
 * a portfolio, and being found and cited is the point.
 *
 * `/api/public/` stays crawlable because the sections fetch it while rendering;
 * blocking it would make Google render the shipped fallback copy instead of
 * the live content. The JSON itself is kept out of the index by the
 * X-Robots-Tag header in next.config.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/public/"],
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
