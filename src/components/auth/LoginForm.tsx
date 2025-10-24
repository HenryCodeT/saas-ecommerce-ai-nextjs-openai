// LoginForm Component
// Implements Phase 1 Login functionality
// Uses useAuth hook for authentication

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * LoginForm Component
 * 
 * Implements login flow from Phase 1 document:
 * 1. User enters email and password
 * 2. Form submits to useAuth().login()
 * 3. useAuth calls NextAuth signIn
 * 4. NextAuth validates via authOptions (lib/auth.ts)
 * 5. On success, redirect based on role:
 *    - ADMIN → /admin-dashboard
 *    - CLIENT → /store-dashboard/{store-name}
 *    - END_USER → /store/{store-name}
 */
export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  /**
   * Handle form submission
   * Calls useAuth().login() which handles:
   * - NextAuth authentication
   * - Role-based redirection
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      return;
    }

    // Call login from useAuth hook
    await login({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </Button>

      {/* Register Link */}
      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Register here
        </Link>
      </div>

      {/* Demo Credentials (for testing) */}
      <div className="border-t pt-4 mt-4">
        <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>Client:</strong> client@example.com / client123</p>
          <p><strong>User:</strong> user@example.com / user123</p>
        </div>
      </div>
    </form>
  );
}
