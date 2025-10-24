// Store API Route
// Get store information by ID
// Used for redirect logic in useAuth hook

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/lib/prisma";
import { updateStore } from '@/services/storeService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

/**
 * PATCH /api/stores/[storeId]
 * Update store information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden - Client access required' }, { status: 403 });
    }

    const { storeId } = params;

    // Verify the store belongs to the client
    if (session.user.storeId !== storeId) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const updatedStore = await updateStore(storeId, body);

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("Store update API error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating store information" },
      { status: 500 }
    );
  }
}
