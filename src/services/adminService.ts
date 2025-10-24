import { prisma } from '@/lib/prisma';

export interface AdminMetrics {
  totalUsers: number;
  totalStores: number;
  activeStores: number;
  totalTokensUsed: number;
  totalPurchases: number;
}

export interface TokenUsageByStore {
  storeId: string;
  storeName: string;
  tokensUsed: number;
  lastUsed: Date | null;
  planName: string;
  monthlyLimit: number;
}

export interface StoreWithUsers {
  id: string;
  storeName: string;
  url: string;
  clientName: string;
  clientEmail: string;
  userCount: number;
  productCount: number;
  status: string;
  city: string | null;
  category: string | null;
  description: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  storeName: string | null;
  createdAt: Date;
}

/**
 * Fetch admin dashboard metrics
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const [totalUsers, totalStores, activeStores, tokenUsage, purchases] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.store.count({ where: { status: 'ACTIVE' } }),
      prisma.tokenUsage.aggregate({ _sum: { tokensUsed: true } }),
      prisma.billingHistory.count(),
    ]);

    return {
      totalUsers,
      totalStores,
      activeStores,
      totalTokensUsed: tokenUsage._sum.tokensUsed || 0,
      totalPurchases: purchases,
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    throw new Error('Failed to fetch admin metrics');
  }
}

/**
 * Fetch token usage grouped by store
 */
export async function getTokenUsageByStore(): Promise<TokenUsageByStore[]> {
  try {
    const stores = await prisma.store.findMany({
      include: {
        tokenUsage: {
          select: {
            tokensUsed: true,
            createdAt: true,
          },
        },
        clientUser: {
          select: {
            name: true,
          },
        },
      },
    });

    return stores.map((store) => {
      const tokensUsed = store.tokenUsage.reduce((sum, usage) => sum + usage.tokensUsed, 0);
      const lastUsed = store.tokenUsage.length > 0
        ? store.tokenUsage.reduce((latest, usage) =>
            usage.createdAt > latest ? usage.createdAt : latest, store.tokenUsage[0].createdAt)
        : null;

      const plan = { planName: 'Free', monthlyLimit: 1000 };

      return {
        storeId: store.id,
        storeName: store.storeName,
        tokensUsed,
        lastUsed,
        planName: plan.planName,
        monthlyLimit: plan.monthlyLimit,
      };
    });
  } catch (error) {
    console.error('Error fetching token usage by store:', error);
    throw new Error('Failed to fetch token usage by store');
  }
}

/**
 * Fetch all stores with user count and detailed information
 */
export async function getAllStoresWithUsers(): Promise<StoreWithUsers[]> {
  try {
    const stores = await prisma.store.findMany({
      include: {
        clientUser: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stores.map((store) => ({
      id: store.id,
      storeName: store.storeName,
      url: store.url,
      clientName: store.clientUser.name,
      clientEmail: store.clientUser.email,
      userCount: store._count.users,
      productCount: store._count.products,
      status: store.status,
      city: store.city,
      category: store.category,
      description: store.description,
      logoUrl: store.logoUrl,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching stores with users:', error);
    throw new Error('Failed to fetch stores with users');
  }
}

/**
 * Fetch all end-users for admin view (only END_USER role)
 */
export async function getAllUsers(): Promise<UserListItem[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'END_USER',
      },
      include: {
        store: {
          select: {
            storeName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      storeName: user.store?.storeName || null,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch all users');
  }
}

/**
 * Fetch recent activity logs (purchases only)
 */
export async function getRecentActivityLogs(limit: number = 50) {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        actionType: 'PURCHASE',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            store: {
              select: {
                storeName: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs');
  }
}
