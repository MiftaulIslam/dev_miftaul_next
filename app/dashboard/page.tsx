import DashboardApp from "@/components/dashboard/DashboardApp";
import DashboardLogin from "@/components/dashboard/DashboardLogin";
import { isDashboardAuthenticated } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authenticated = await isDashboardAuthenticated();
  return authenticated ? <DashboardApp /> : <DashboardLogin />;
}

