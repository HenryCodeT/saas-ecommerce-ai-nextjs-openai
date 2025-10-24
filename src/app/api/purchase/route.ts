import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPurchase } from '@/services/purchaseService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'END_USER') {
      return NextResponse.json(
        { error: 'Only end users can make purchases' },
        { status: 403 }
      );
    }

    const { storeId, items, totalAmount } = await req.json();

    if (!storeId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user belongs to this store
    if (session.user.storeId !== storeId) {
      return NextResponse.json(
        { error: 'Forbidden' },
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
