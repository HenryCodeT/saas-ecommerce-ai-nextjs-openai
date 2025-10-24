// Login Page
// Implements Phase 1 login functionality

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions, getRedirectUrl } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Login Page
 * 
 * Phase 1 implementation:
 * - Displays login form (LoginForm component)
 * - If already authenticated, redirects to appropriate dashboard
 * - Uses AuthLayout for consistent styling
 */
export default async function LoginPage() {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Already logged in, redirect to appropriate dashboard
    const redirectUrl = await getRedirectUrl(
      session.user.role,
      session.user.storeId
    );
    redirect(redirectUrl);
  }

  return (
    <AuthLayout
      title="Welcome Back"
      description="Log in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}
