import { prisma } from '@/lib/prisma';
import { CartItem } from '@/hooks/useCart';

export interface PurchaseInput {
  userId: string;
  storeId: string;
  items: CartItem[];
  totalAmount: number;
}

/**
 * Create a simulated purchase
 * Logs transaction in BillingHistory and ActivityLogs
 */
export async function createPurchase(input: PurchaseInput) {
  const { userId, storeId, items, totalAmount } = input;

  try {
    // Get the store to find the client user ID
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { clientUserId: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create billing history record (simulated purchase)
    const billingHistory = await prisma.billingHistory.create({
      data: {
        clientUserId: store.clientUserId,
        invoiceNumber,
        amount: totalAmount,
        status: 'PAID',
        dueDate: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'PURCHASE',
        targetId: billingHistory.id,
        metadata: {
          invoiceNumber,
          amount: totalAmount,
          itemCount: items.length,
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return {
      success: true,
      invoiceNumber,
      billingHistory,
    };
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw new Error('Failed to process purchase');
  }
}

/**
 * Get purchase history for a user
 */
export async function getUserPurchaseHistory(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        billingHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return user?.billingHistory || [];
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    throw new Error('Failed to fetch purchase history');
  }
}
