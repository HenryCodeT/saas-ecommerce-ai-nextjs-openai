// AuthLayout Component
// Layout wrapper for authentication pages (Login, Register)
// Provides consistent styling and structure

import React from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 * AuthLayout Component
 * 
 * Wraps authentication forms with:
 * - Centered container
 * - Consistent branding
 * - Responsive design
 * - Background styling
 */
export function AuthLayout({
  children,
  title,
  description,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className={cn("w-full max-w-md", className)}>
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendora
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Smart commerce, powered by AI
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2024 HenryCodeT. All rights reserved.
        </p>
      </div>
    </div>
  );
}
