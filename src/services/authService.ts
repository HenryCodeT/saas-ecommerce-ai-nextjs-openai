// Authentication Service
// Handles user registration and authentication logic
// Implements Phase 1 requirements: login, register, role-based access

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AuthResponse, RegisterData, LoginCredentials } from "@/types";
import { UserRole, UserStatus } from "@prisma/client";
import { getRedirectUrl } from "@/lib/auth";

/**
 * Authentication Service
 * Provides methods for user registration and login
 * All methods interact with Supabase PostgreSQL via Prisma
 */
export const authService = {
  /**
   * Register a new user
   * 
   * Flow from Phase 1 document:
   * 1. Validate input data
   * 2. Hash password
   * 3. Create user in database
   * 4. If CLIENT role, create associated store
   * 5. Log registration activity
   * 6. Return user data with redirect URL
   * 
   * @param data - Registration data (name, email, password, role, store info)
   * @returns AuthResponse with user data and redirect URL
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate required fields
      if (!data.name || !data.email || !data.password || !data.role) {
        return {
          success: false,
          error: "All fields are required",
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: "Invalid email format",
        };
      }

      // Validate password strength (minimum 8 characters)
      if (data.password.length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters long",
        };
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email already registered",
        };
      }

      // For CLIENT role, validate store information
      if (data.role === "CLIENT") {
        if (!data.storeName || !data.storeUrl) {
          return {
            success: false,
            error: "Store name and URL are required for CLIENT registration",
          };
        }

        // Check if store URL is already taken
        const existingStore = await prisma.store.findUnique({
          where: { url: data.storeUrl },
        });

        if (existingStore) {
          return {
            success: false,
            error: "Store URL is already taken",
          };
        }
      }

      // For END_USER role with storeId, validate store exists
      if (data.role === "END_USER" && data.storeId) {
        const store = await prisma.store.findUnique({
          where: { id: data.storeId },
        });

        if (!store) {
          return {
            success: false,
            error: "Store not found",
          };
        }
      }

      // Hash password with bcrypt
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user and store in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            status: UserStatus.ACTIVE,
            storeId: data.role === "END_USER" && data.storeId ? data.storeId : null,
          },
        });

        // If CLIENT, create associated store
        let store = null;
        if (data.role === "CLIENT" && data.storeName && data.storeUrl) {
          store = await tx.store.create({
            data: {
              storeName: data.storeName,
              url: data.storeUrl,
              clientUserId: user.id,
              status: "ACTIVE",
            },
          });

          // Update user with storeId
          await tx.user.update({
            where: { id: user.id },
            data: { storeId: store.id },
          });
        }

        // Log registration activity
        await tx.activityLog.create({
          data: {
            userId: user.id,
            actionType: "REGISTER",
            targetId: user.id,
            metadata: {
              email: user.email,
              role: user.role,
              storeId: store?.id,
            },
          },
        });

        return { user, store };
      });

      // Get redirect URL based on role
      const redirectUrl = await getRedirectUrl(
        result.user.role,
        result.user.storeId 
      );

      return {
        success: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          storeId: result.user.storeId,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        redirectUrl,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "An error occurred during registration. Please try again.",
      };
    }
  },

  /**
   * Login user
   * 
   * Note: Actual authentication is handled by NextAuth
   * This method is provided for compatibility and additional login logic
   * 
   * @param credentials - Login credentials (email, password)
   * @returns AuthResponse with user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: "Email and password are required",
        };
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          store: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      // Check account status
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          error: "Account is inactive or suspended",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      // Get redirect URL
      const redirectUrl = await getRedirectUrl(user.role, user.storeId);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          storeId: user.storeId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        redirectUrl,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An error occurred during login. Please try again.",
      };
    }
  },

  /**
   * Get user by ID
   * 
   * @param userId - User ID
   * @returns User object or null
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          store: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },

  /**
   * Get user by email
   * 
   * @param email - User email
   * @returns User object or null
   */
  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          store: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Get user by email error:", error);
      return null;
    }
  },
};
