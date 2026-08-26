import { NextResponse } from "next/server";

import { listV2SkillSectionsSafe } from "@/lib/dashboard/db";

/**
 * The v2 skills reel's content.
 *
 * Separate from `/api/public/skills`, which serves the flat v1 stack. The two
 * versions model skills differently — the reel carries authored copy per
 * section and per skill — so they read different tables and different routes
 * rather than one endpoint trying to satisfy both shapes.
 *
 * Returns `[]` rather than an error when the database is unreachable: the
 * section falls back to its static copy, so an empty array is a valid answer
 * and never something the reader sees.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const sections = await listV2SkillSectionsSafe();
  return NextResponse.json(sections, {
    headers: { "Cache-Control": "no-store" },
  });
}
