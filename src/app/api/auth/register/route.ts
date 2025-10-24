// Registration API Route
// Handles user registration requests
// Calls authService.register() to create user and store

import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";
import { RegisterData } from "@/types";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * 
 * Register a new user
 * 
 * Flow from Phase 1 document:
 * 1. Receive registration data from RegisterForm
 * 2. Call authService.register()
 * 3. authService creates user in database
 * 4. For CLIENT role, also create store
 * 5. Return success/error response
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // For CLIENT role, validate store information
    if (body.role === "CLIENT") {
      if (!body.storeName || !body.storeUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "Store name and URL are required for CLIENT registration",
          },
          { status: 400 }
        );
      }
    }

    // For END_USER role with storeId, validate storeId is provided
    if (body.role === "END_USER" && !body.storeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Store ID is required for customer registration",
        },
        { status: 400 }
      );
    }

    // Call authService to register user
    const result = await authService.register(body);
    console.log("registration result in route", result);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        redirectUrl: result.redirectUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during registration",
      },
      { status: 500 }
    );
  }
}
