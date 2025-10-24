// Home Page
// Redirects authenticated users to their appropriate dashboard
// Redirects unauthenticated users to login

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, getRedirectUrl } from "@/lib/auth";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Home Page
 * 
 * Implements automatic redirect logic from Phase 1:
 * - If not authenticated → redirect to /login
 * - If authenticated → redirect based on role:
 *   - ADMIN → /admin-dashboard
 *   - CLIENT → /store-dashboard/{store-name}
 *   - END_USER → /store/{store-name}
 */
export default async function HomePage() {
  // Get server-side session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Not authenticated, redirect to login
    redirect("/login");
  }

  // Get redirect URL based on user role
  const redirectUrl = await getRedirectUrl(
    session.user.role,
    session.user.storeId
  );

  // Redirect to appropriate dashboard
  redirect(redirectUrl);
}
