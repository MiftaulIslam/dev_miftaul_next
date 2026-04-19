import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { isDashboardAuthenticated } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isDashboardAuthenticated();
  if (!authenticated) {
    redirect("/dashboard");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
