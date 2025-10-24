// StoreRegisterForm Component
// Handles customer registration for a specific store

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface StoreRegisterFormProps {
  storeId: string;
  storeName: string;
  storeUrl: string;
}

/**
 * StoreRegisterForm Component
 * 
 * Handles customer registration for a specific store
 * - Creates END_USER account linked to the store
 * - Simplified form with only essential fields
 * - Redirects to store page after successful registration
 */
export function StoreRegisterForm({ storeId, storeName, storeUrl }: StoreRegisterFormProps) {
  const router = useRouter();
  const { register, isLoading: authLoading, error: authError, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Field-level error state
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      
      default:
        return "";
    }
  };

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear auth error when user starts typing
    if (authError) clearError();
    
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

    return null;
  };

  /**
   * Handle form submission
   * Creates END_USER account linked to the specific store
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "END_USER",
        storeId: storeId,
      });

      if (success) {
        // Registration and login successful, redirect will be handled by useAuth
        // The useAuth hook will automatically redirect based on role
        router.push(`/store/${storeUrl}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {authError}
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
          disabled={isSubmitting || authLoading}
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
          disabled={isSubmitting || authLoading}
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
          disabled={isSubmitting || authLoading}
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
          disabled={isSubmitting || authLoading}
          className={fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || authLoading}
      >
        {isSubmitting || authLoading ? "Creating account..." : `Join ${storeName}`}
      </Button>
    </form>
  );
}
