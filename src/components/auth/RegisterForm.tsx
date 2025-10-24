// RegisterForm Component
// Implements Phase 1 Registration functionality
// Supports ADMIN, CLIENT, and END_USER roles

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@prisma/client";

/**
 * RegisterForm Component
 * 
 * Implements registration flow from Phase 1 document:
 * 1. User fills out registration form
 * 2. For CLIENT role, collect store information
 * 3. Form submits to useAuth().register()
 * 4. Register calls API endpoint /api/auth/register
 * 5. API calls authService.register() to create user
 * 6. For CLIENT, also create associated store
 * 7. On success, auto-login and redirect based on role
 * 
 * Note: Registration is only possible via store URL for END_USER
 * (implemented in Phase 4)
 */
export function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CLIENT" as UserRole,
    storeName: "",
    storeUrl: "",
  });

  // Field-level error state
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeUrl: "",
  });

  /**
   * Validate individual fields
   */
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
      
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      
      case "storeName":
        if (formData.role === "CLIENT" && !value.trim()) {
          return "Store name is required";
        }
        if (value.trim().length > 0 && value.trim().length < 2) {
          return "Store name must be at least 2 characters";
        }
        return "";
      
      case "storeUrl":
        if (formData.role === "CLIENT" && !value.trim()) {
          return "Store URL is required";
        }
        if (value.trim().length > 0) {
          const urlRegex = /^[a-z0-9-]+$/;
          if (!urlRegex.test(value)) {
            return "Store URL can only contain lowercase letters, numbers, and hyphens";
          }
        }
        return "";
      
      default:
        return "";
    }
  };

  /**
   * Handle form input changes
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear global error when user starts typing
    if (error) clearError();
    
    // Validate the specific field
    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
    
    // If password changed, re-validate confirm password
    if (name === "password" && formData.confirmPassword) {
      const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): string | null => {
    // Check if any field has errors
    const hasFieldErrors = Object.values(fieldErrors).some(error => error !== "");
    if (hasFieldErrors) {
      return "Please fix the errors above";
    }

    // Additional validation for required fields
    if (!formData.name || !formData.email || !formData.password) {
      return "All fields are required";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    // For CLIENT role, validate store information
    if (formData.role === "CLIENT") {
      if (!formData.storeName || !formData.storeUrl) {
        return "Store name and URL are required for store owners";
      }

      // Validate store URL format (lowercase, alphanumeric, hyphens)
      const urlRegex = /^[a-z0-9-]+$/;
      if (!urlRegex.test(formData.storeUrl)) {
        return "Store URL can only contain lowercase letters, numbers, and hyphens";
      }
    }

    return null;
  };

  /**
   * Handle form submission
   * Calls useAuth().register() which:
   * - Creates user via API
   * - Creates store for CLIENT role
   * - Auto-logins user
   * - Redirects based on role
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      // Show error without calling clearError
      return;
    }

    // Call register from useAuth hook
    await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      storeName: formData.role === "CLIENT" ? formData.storeName : undefined,
      storeUrl: formData.role === "CLIENT" ? formData.storeUrl : undefined,
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

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {fieldErrors.name && (
          <p className="text-sm text-red-600">{fieldErrors.name}</p>
        )}
      </div>

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
          className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-600">{fieldErrors.email}</p>
        )}
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
          className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {fieldErrors.password ? (
          <p className="text-sm text-red-600">{fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-gray-500">
            Minimum 8 characters
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Role Selection */}
      {/* <div className="space-y-2">
        <Label htmlFor="role">Account Type</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          <option value="CLIENT">Store Owner (CLIENT)</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <p className="text-xs text-gray-500">
          {formData.role === "CLIENT"
            ? "Create and manage your own online store"
            : "Full system administration access"}
        </p>
      </div> */}

      {/* Store Information (only for CLIENT role) */}
      {formData.role === "CLIENT" && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900">Store Information</h3>
          
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              name="storeName"
              type="text"
              placeholder="My Awesome Store"
              value={formData.storeName}
              onChange={handleChange}
              required={formData.role === "CLIENT"}
              disabled={isLoading}
              className={fieldErrors.storeName ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {fieldErrors.storeName && (
              <p className="text-sm text-red-600">{fieldErrors.storeName}</p>
            )}
          </div>

          {/* Store URL */}
          <div className="space-y-2">
            <Label htmlFor="storeUrl">Store URL</Label>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                /store/
              </span>
              <Input
                id="storeUrl"
                name="storeUrl"
                type="text"
                placeholder="my-store"
                value={formData.storeUrl}
                onChange={handleChange}
                required={formData.role === "CLIENT"}
                disabled={isLoading}
                className={`flex-1 ${fieldErrors.storeUrl ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
            </div>
            {fieldErrors.storeUrl ? (
              <p className="text-sm text-red-600">{fieldErrors.storeUrl}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Log in here
        </Link>
      </div>
    </form>
  );
}
