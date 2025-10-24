import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createProduct, getStoreProducts } from '@/services/storeService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/products?storeId=xxx
 * Fetch all products for a store
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const products = await getStoreProducts(storeId);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden - Client access required' }, { status: 403 });
    }

    const body = await req.json();
    const { storeId, ...productData } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // Verify the store belongs to the client
    if (session.user.storeId !== storeId) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
    }

    const product = await createProduct(storeId, productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
