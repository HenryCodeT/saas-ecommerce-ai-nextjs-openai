import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPurchase } from '@/services/purchaseService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('[Purchase] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userStoreId: session?.user?.storeId
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'END_USER') {
      console.error('[Purchase] Invalid role:', session.user.role);
      return NextResponse.json(
        { error: 'Only end users can make purchases' },
        { status: 403 }
      );
    }

    const { storeId, items, totalAmount } = await req.json();

    console.log('[Purchase] Request data:', {
      storeId,
      itemCount: items?.length,
      totalAmount,
      userId: session.user.id,
      userStoreId: session.user.storeId,
      userRole: session.user.role
    });

    if (!storeId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user belongs to this store
    if (session.user.storeId !== storeId) {
      console.error('[Purchase] Store mismatch:', {
        userStoreId: session.user.storeId,
        requestStoreId: storeId,
        userId: session.user.id,
        userRole: session.user.role
      });
      return NextResponse.json(
        { error: 'You can only make purchases in your registered store' },
        { status: 403 }
      );
    }

    const result = await createPurchase({
      userId: session.user.id,
      storeId,
      items,
      totalAmount,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
