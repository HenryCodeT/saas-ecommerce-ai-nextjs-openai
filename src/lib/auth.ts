// NextAuth configuration
// Implements Phase 1 authentication with role-based access control
// Uses Supabase PostgreSQL via Prisma for user storage

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { UserRole } from "@prisma/client";

/**
 * NextAuth configuration options
 * 
 * Key features:
 * 1. Credentials-based authentication (email/password)
 * 2. Role-based access control (ADMIN, CLIENT, END_USER)
 * 3. Custom callbacks for session and JWT token management
 * 4. Integration with Prisma for user storage
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for session and user management
  adapter: PrismaAdapter(prisma),
  
  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorization function
       * Validates user credentials against database
       * Returns user object if valid, null if invalid
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            store: true, // Include store info for redirect logic
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if user account is active
        if (user.status !== "ACTIVE") {
          throw new Error("Account is inactive or suspended");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Log login activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            actionType: "LOGIN",
            targetId: user.id,
            metadata: {
              email: user.email,
              role: user.role,
            },
          },
        });

        // Return user object for session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
        };
      },
    }),
  ],

  // Custom pages for authentication
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks for customizing session and JWT behavior
  callbacks: {
    /**
     * JWT callback
     * Adds user role and storeId to JWT token
     * This data will be available in the session
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeId = user.storeId;
      }

      // Update session if triggered (for profile updates)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },

    /**
     * Session callback
     * Adds user role and storeId to session object
     * This makes role-based routing and access control possible
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.storeId = token.storeId as string | null;
      }
      return session;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};

/**
 * Helper function to get redirect URL based on user role
 * Implements the role-based redirection logic from Phase 1 document:
 * - ADMIN → /admin-dashboard
 * - CLIENT → /store-dashboard/{store-name}
 * - END_USER → /store/{store-name}
 * 
 * @param role - User role
 * @param storeId - Store ID (required for CLIENT and END_USER)
 * @returns Redirect URL
 */
export async function getRedirectUrl(
  role: UserRole,
  storeId: string | null
): Promise<string> {
  switch (role) {
    case "ADMIN":
      return "/admin-dashboard";
    
    case "CLIENT":
      if (!storeId) {
        throw new Error("CLIENT user must have a store");
      }
      // Get store URL slug
      const clientStore = await prisma.store.findUnique({
        where: { id: storeId },
        select: { url: true },
      });
      return `/store-dashboard/${clientStore?.url || ""}`;
    
    case "END_USER":
      if (!storeId) {
        throw new Error("END_USER must be registered at a store");
      }
      // Get store URL slug
      const userStore = await prisma.store.findUnique({
        where: { id: storeId },
        select: { url: true },
      });
      return `/store/${userStore?.url || ""}`;
    
    default:
      return "/";
  }
}
