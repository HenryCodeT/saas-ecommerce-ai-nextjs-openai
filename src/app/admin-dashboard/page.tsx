// Admin Dashboard Page
// Phase 2: Admin Dashboard with metrics and token usage

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminDashboardClient } from "./AdminDashboardClient";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Dashboard Page
 *
 * Role-based access control:
 * - Only accessible to users with ADMIN role
 *
 * Phase 2 features:
 * - Global metrics (tokens, users, plans)
 * - Token usage table per store
 * - List of all stores and users
 * - Read-only access to data
 */
export default async function AdminDashboardPage() {
  // Check authentication and role
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminDashboardClient user={session.user} />;
}
