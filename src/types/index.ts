// Type definitions for the SaaS E-commerce AI application
// Aligned with Phase 1 - Authentication requirements

import { UserRole, UserStatus, StoreStatus } from "@prisma/client";

// ============================================================================
// USER TYPES (Phase 1 - Authentication)
// ============================================================================

/**
 * User object returned from authentication
 * Matches the Users table structure from Prisma schema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // ADMIN | CLIENT | END_USER
  status: UserStatus;
  storeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Registration data for new users
 * Used in RegisterForm and authService.register()
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  storeName?: string; // Required for CLIENT role
  storeUrl?: string; // Required for CLIENT role
  storeId?: string; // Required for END_USER registration via store
}

/**
 * Login credentials
 * Used in LoginForm and authService.login()
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response
 * Returned by authService methods
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  redirectUrl?: string; // Role-based redirect URL
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * Store object
 * Matches the Stores table structure from Prisma schema
 */
export interface Store {
  id: string;
  storeName: string;
  url: string;
  clientUserId: string;
  logoUrl: string | null;
  city: string | null;
  description: string | null;
  category: string | null;
  businessHours: string | null;
  status: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NEXTAUTH EXTENDED TYPES
// ============================================================================

/**
 * Extended NextAuth Session
 * Includes user role for role-based access control
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      storeId: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    storeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    storeId: string | null;
  }
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}
