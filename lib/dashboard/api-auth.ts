import { NextResponse } from "next/server";

import { isDashboardAuthenticated } from "@/lib/dashboard/auth";

export async function requireDashboardAuth() {
  const authenticated = await isDashboardAuthenticated();
  if (authenticated) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

