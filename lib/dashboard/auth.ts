import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { DASHBOARD_COOKIE, DASHBOARD_COOKIE_VALUE } from "@/lib/dashboard/session-cookie";

export { DASHBOARD_COOKIE };

function hashValue(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyDashboardPassword(inputPassword: string) {
  const expected = process.env.DASHBOARD_PASSWORD ?? "Badshamiftaul123@";
  const inputHash = hashValue(inputPassword);
  const expectedHash = hashValue(expected);
  return timingSafeEqual(inputHash, expectedHash);
}

export async function isDashboardAuthenticated() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(DASHBOARD_COOKIE);
  return cookie?.value === DASHBOARD_COOKIE_VALUE;
}

export const dashboardCookieOptions = {
  name: DASHBOARD_COOKIE,
  value: DASHBOARD_COOKIE_VALUE,
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

