import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DASHBOARD_COOKIE, DASHBOARD_COOKIE_VALUE } from "@/lib/dashboard/session-cookie";

/**
 * Protects all dashboard app routes except `/dashboard` (login).
 * Pairs with `app/dashboard/(shell)/layout.tsx` (server) for defense in depth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard/")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(DASHBOARD_COOKIE)?.value;
  if (session !== DASHBOARD_COOKIE_VALUE) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
