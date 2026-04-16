import { NextResponse } from "next/server";

import { getPublicPortfolioSettings } from "@/lib/dashboard/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";

export async function GET() {
  try {
    const profile = await getPublicPortfolioSettings();
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(fallbackProfile);
  }
}
