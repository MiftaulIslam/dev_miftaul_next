import { redirect } from "next/navigation";

import DashboardLogin from "@/components/dashboard/DashboardLogin";
import { isDashboardAuthenticated } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authenticated = await isDashboardAuthenticated();
  if (authenticated) {
    redirect("/dashboard/overview");
  }

  return <DashboardLogin />;
}
