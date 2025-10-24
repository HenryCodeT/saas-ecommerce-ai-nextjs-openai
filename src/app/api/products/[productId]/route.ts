import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateProduct, deleteProduct, getProductById } from '@/services/storeService';

/**
 * GET /api/products/[productId]
 * Fetch a single product
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await getProductById(params.productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error in GET /api/products/[productId]:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

/**
 * PATCH /api/products/[productId]
 * Update a product
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden - Client access required' }, { status: 403 });
    }

    const body = await req.json();

    // Verify the product belongs to the client's store
    const product = await getProductById(params.productId);
    if (!product || product.storeId !== session.user.storeId) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
    }

    const updatedProduct = await updateProduct(params.productId, body);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error in PATCH /api/products/[productId]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[productId]
 * Delete a product
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden - Client access required' }, { status: 403 });
    }

    // Verify the product belongs to the client's store
    const product = await getProductById(params.productId);
    if (!product || product.storeId !== session.user.storeId) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
    }

    await deleteProduct(params.productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/products/[productId]:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
