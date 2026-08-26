import { NextResponse } from "next/server";

import { getSiteVersion } from "@/lib/dashboard/db";
import { buildSiteConfigEnvelope, DEFAULT_SITE_VERSION } from "@/lib/siteVersion";

/**
 * Public endpoint for the active site version.
 *
 * The path and the body are deliberately opaque — see `lib/siteVersion.ts` for
 * what that does and does not buy us.
 *
 * This response must never be cached, for two independent reasons: the envelope
 * carries a fresh nonce per request, so a replayed body would defeat the whole
 * point, and a cached body would also pin visitors to the old version after an
 * admin flips it in the dashboard. GET handlers already default to dynamic in
 * this version of Next, but the segment config states the intent explicitly and
 * the response headers stop any CDN or browser sitting in between.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  try {
    const version = await getSiteVersion();
    return NextResponse.json(buildSiteConfigEnvelope(version), { headers: NO_STORE_HEADERS });
  } catch {
    // `getSiteVersion` already swallows database failures; this is the last
    // guard so the endpoint cannot 500 and strand the client without a config.
    return NextResponse.json(buildSiteConfigEnvelope(DEFAULT_SITE_VERSION), {
      headers: NO_STORE_HEADERS,
    });
  }
}
