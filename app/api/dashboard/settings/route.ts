import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  getPortfolioSettings,
  type PortfolioSettingsInput,
  upsertPortfolioSettings,
} from "@/lib/dashboard/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";
import { coerceSiteVersion } from "@/lib/siteVersion";

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const settings = (await getPortfolioSettings()) ?? fallbackProfile;
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as PortfolioSettingsInput | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // This field decides what every visitor sees, so the client string is never
  // trusted: anything unrecognised falls back to the default version.
  const next = await upsertPortfolioSettings({
    ...payload,
    siteVersion: coerceSiteVersion(payload.siteVersion),
  });
  return NextResponse.json(next);
}

