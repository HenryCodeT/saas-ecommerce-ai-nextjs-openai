import { prisma } from '@/lib/prisma';
import { Product, Store, User, Prisma } from '@prisma/client';

// Types
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  images?: string[];
  tags?: string[];
}

export interface StoreInput {
  storeName: string;
  url: string;
  logoUrl?: string;
  city?: string;
  description?: string;
  category?: string;
  businessHours?: string;
}

export interface StoreUserWithPurchases extends User {
  purchases: {
    id: string;
    invoiceNumber: string;
    amount: number | Prisma.Decimal;
    status: string;
    createdAt: Date;
  }[];
}

/**
 * Get store by ID with all details
 */
export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return store;
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    throw new Error('Failed to fetch store');
  }
}

/**
 * Get store by store name
 */
export async function getStoreByName(storeName: string): Promise<Store | null> {
  try {
    console.log('store name', storeName);
    const store = await prisma.store.findUnique({
      where: { storeName },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    console.log('store by name', store);
    return store;
  } catch (error) {
    console.error('Error fetching store by name:', error);
    throw new Error('Failed to fetch store');
  }
}

export async function getStoreByUrl(storeUrl: string): Promise<Store | null> {
  try {
    const store = await prisma.store.findUnique({
      where: { url: storeUrl },
    });
    console.log('store by url', store);
    return store;
  } catch (error) {
    console.error('Error fetching store by url:', error);
    throw new Error('Failed to fetch store');
  }
}
/**
 * Update store information
 */
export async function updateStore(
  storeId: string,
  data: Partial<StoreInput>
): Promise<Store> {
  try {
    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return store;
  } catch (error) {
    console.error('Error updating store:', error);
    throw new Error('Failed to update store');
  }
}

/**
 * Get all products for a store
 */
export async function getStoreProducts(storeId: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  } catch (error) {
    console.error('Error fetching store products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  storeId: string,
  data: ProductInput
): Promise<Product> {
  try {
    const product = await prisma.product.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        sku: data.sku,
        images: data.images || [],
        tags: data.tags || [],
        isActive: true,
      },
    });

    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Update a product
 */
export async function updateProduct(
  productId: string,
  data: Partial<ProductInput>
): Promise<Product> {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

/**
 * Get all users (END_USER) registered at this store with their purchases
 */
export async function getStoreUsers(storeId: string): Promise<StoreUserWithPurchases[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        storeId,
        role: 'END_USER',
      },
      include: {
        billingHistory: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      ...user,
      purchases: user.billingHistory,
    }));
  } catch (error) {
    console.error('Error fetching store users:', error);
    throw new Error('Failed to fetch store users');
  }
}

/**
 * Get store statistics
 */
export async function getStoreStats(storeId: string) {
  try {
    const [productCount, userCount, activeProductCount, totalRevenue] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.user.count({ where: { storeId, role: 'END_USER' } }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.billingHistory.aggregate({
        where: {
          clientUser: {
            ownedStores: {
              some: { id: storeId },
            },
          },
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      productCount,
      userCount,
      activeProductCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  } catch (error) {
    console.error('Error fetching store stats:', error);
    throw new Error('Failed to fetch store statistics');
  }
}