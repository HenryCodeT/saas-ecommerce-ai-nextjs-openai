// Register Page
// Implements Phase 1 registration functionality

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerSession } from "next-auth";
import { authOptions, getRedirectUrl } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Register Page
 * 
 * Phase 1 implementation:
 * - Displays registration form (RegisterForm component)
 * - If already authenticated, redirects to appropriate dashboard
 * - Uses AuthLayout for consistent styling
 * - Supports CLIENT and ADMIN registration
 * - For END_USER, registration happens via store URL (Phase 4)
 */
export default async function RegisterPage() {
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
      title="Create Account"
      description="Register to start using our platform"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
