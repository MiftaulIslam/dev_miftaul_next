import { NextResponse } from "next/server";

import { requireDashboardAuth } from "@/lib/dashboard/api-auth";
import { getDashboardOverview } from "@/lib/dashboard/db";

export async function GET() {
  const unauthorized = await requireDashboardAuth();
  if (unauthorized) return unauthorized;

  const overview = await getDashboardOverview();
  return NextResponse.json(overview);
}

