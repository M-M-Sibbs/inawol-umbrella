import { redirect } from "next/navigation";
import { isAuthenticated, ADMIN_PATH } from "../../lib/auth";
import DashboardClient from "./Client";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Defense in depth — middleware redirects unauthenticated visitors, but we
  // also verify the session here so a stolen cookie pointing at a destroyed
  // session can't reach this page.
  if (!(await isAuthenticated())) {
    redirect(`${ADMIN_PATH}/login`);
  }
  return <DashboardClient />;
}
