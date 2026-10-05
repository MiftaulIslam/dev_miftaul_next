import "server-only";

import { SITE_URL } from "@/lib/seo";

/**
 * Tells Bing and the other IndexNow engines that a page changed, so a project
 * added in the dashboard is recrawled in minutes rather than whenever the
 * sitemap is next read. Runs in production only, and does nothing until
 * INDEXNOW_KEY is set. The engines verify the key against /indexnow-key.txt.
 */
export async function pingIndexNow(paths: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || process.env.VERCEL_ENV !== "production") return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: paths.map((path) => `${SITE_URL}${path}`),
      }),
    });
  } catch {
    // Best effort: the sitemap still lists the page.
  }
}
