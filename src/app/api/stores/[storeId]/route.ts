// Store API Route
// Get store information by ID
// Used for redirect logic in useAuth hook

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/stores/[storeId]
 * 
 * Get store information by ID
 * Returns store URL for redirect logic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        storeName: true,
        url: true,
        status: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Store API error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching store information" },
      { status: 500 }
    );
  }
}
