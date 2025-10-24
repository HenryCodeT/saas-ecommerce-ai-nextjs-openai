// useAuth Hook
// Client-side authentication state management
// Implements Phase 1 authentication flow with NextAuth

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterData, LoginCredentials } from "@/types";

/**
 * useAuth Hook
 * 
 * Provides authentication functionality for client components:
 * 1. Access to current session and user data
 * 2. Login method with role-based redirection
 * 3. Logout method
 * 4. Registration method
 * 5. Loading and error states
 * 
 * Usage example:
 * ```tsx
 * const { user, login, logout, register, isLoading, error } = useAuth();
 * ```
 */
export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login user
   * 
   * Flow from Phase 1 document:
   * 1. Call NextAuth signIn with credentials
   * 2. NextAuth validates credentials via authOptions
   * 3. On success, redirect based on user role
   * 4. On error, display error message
   * 
   * @param credentials - Email and password
   * @returns Success boolean
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call NextAuth signIn
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return false;
      }

      if (result?.ok) {
        // After successful login, NextAuth will update the session
        // We need to wait a bit for the session to be updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the updated session to determine redirect URL
        const response = await fetch("/api/auth/session");
        const updatedSession = await response.json();

        if (updatedSession?.user) {
          const { role, storeId } = updatedSession.user;

          // Role-based redirection as per Phase 1 document
          let redirectUrl = "/";
          if (role === "ADMIN") {
            redirectUrl = "/admin-dashboard";
          } else if (role === "CLIENT") {
            // Get store URL for CLIENT
            const storeResponse = await fetch(`/api/stores/${storeId}`);
            const storeData = await storeResponse.json();
            redirectUrl = `/store-dashboard/${storeData.url}`;
          } else if (role === "END_USER") {
            // Get store URL for END_USER
            const storeResponse = await fetch(`/api/stores/${storeId}`);
            const storeData = await storeResponse.json();
            redirectUrl = `/store/${storeData.url}`;
          }

          router.push(redirectUrl);
          router.refresh();
        }

        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * 
   * Flow from Phase 1 document:
   * 1. Call registration API endpoint
   * 2. API creates user in database via authService
   * 3. For CLIENT role, create associated store
   * 4. On success, automatically log in the user
   * 5. Redirect based on role
   * 
   * @param data - Registration data
   * @returns Success boolean
   */
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("registration response", response);
      const result = await response.json();
      console.log("registration result", result);
      if (!result.success) {
        setError(result.error || "Registration failed");
        return false;
      }

      // After successful registration, automatically log in
      const loginSuccess = await login({
        email: data.email,
        password: data.password,
      });

      return loginSuccess;
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred during registration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   * 
   * Calls NextAuth signOut and redirects to login page
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // Session data
    user: session?.user || null,
    session,
    isAuthenticated: status === "authenticated",
    
    // Loading states
    isLoading: isLoading || status === "loading",
    
    // Error state
    error,
    clearError,
    
    // Auth methods
    login,
    register,
    logout,
  };
}
