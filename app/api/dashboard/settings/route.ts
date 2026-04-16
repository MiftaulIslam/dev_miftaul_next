import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import {
  getPortfolioSettings,
  type PortfolioSettingsInput,
  upsertPortfolioSettings,
} from "@/lib/dashboard/db";
import { fallbackProfile } from "@/lib/dashboard/fallback-profile";

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

  const next = await upsertPortfolioSettings(payload);
  return NextResponse.json(next);
}

