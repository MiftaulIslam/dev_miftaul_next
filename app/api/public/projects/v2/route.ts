import { NextResponse } from "next/server";

import { listV2ProjectsSafe } from "@/lib/dashboard/db";

/**
 * The v2 reel's public feed.
 *
 * Separate from `/api/public/projects`, which serves the v1 card shape from the
 * `projects` table. This one returns `V2ProjectRecord[]` — slug, year,
 * discipline, problem/outcome, plate, links and the full case body — straight
 * from `v2_projects`.
 *
 * The records go out in their database shape rather than pre-mapped to
 * `ReelProject`, so the /work pages and the reel section can share one endpoint
 * and one mapping (`lib/projects/v2.ts`) instead of the endpoint quietly
 * becoming a second place where the reel's shape is defined.
 *
 * Never cached: the whole point of the change is that an edit in the dashboard
 * shows up on the site without a deploy.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // `listV2ProjectsSafe` already swallows database failures and returns [];
  // the client falls back to the shipped copy, so an outage costs the reader
  // the live edits and nothing else.
  const projects = await listV2ProjectsSafe();
  return NextResponse.json(projects, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
