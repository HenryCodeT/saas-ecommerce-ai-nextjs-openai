import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllStoresWithUsers } from '@/services/adminService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/stores
 * Fetch all stores with user count
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch stores
    const stores = await getAllStoresWithUsers();

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error in GET /api/admin/stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
