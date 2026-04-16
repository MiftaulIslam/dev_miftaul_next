import { NextResponse } from "next/server";

import {
  dashboardCookieOptions,
  DASHBOARD_COOKIE,
  verifyDashboardPassword,
} from "@/lib/dashboard/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim() ?? "";

  if (!password || !verifyDashboardPassword(password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(dashboardCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(DASHBOARD_COOKIE);
  return response;
}

