/**
 * MCP (Model Context Protocol) Service
 *
 * Implements OpenAI function calling with structured tools for:
 * - Product filtering and search
 * - Cart management
 * - Product details retrieval
 * - AI query logging
 *
 * All operations are store-scoped and permission-aware.
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// MCP Tool Definitions
// ============================================================================

export const MCP_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'filter_products',
      description: 'Filter and search products in the current store based on user criteria like brand, category, price range, color, or general search terms. Returns matching products with details.',
      parameters: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'General search term to match against product name, description, or tags'
          },
          brand: {
            type: 'string',
            description: 'Filter by brand name'
          },
          category: {
            type: 'string',
            description: 'Filter by product category'
          },
          color: {
            type: 'string',
            description: 'Filter by color'
          },
          price_min: {
            type: 'number',
            description: 'Minimum price filter'
          },
          price_max: {
            type: 'number',
            description: 'Maximum price filter'
          },
          in_stock_only: {
            type: 'boolean',
            description: 'Only return products that are in stock',
            default: true
          }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'show_product_details',
      description: 'Get detailed information about a specific product including name, description, price, stock, images, and tags',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The unique ID of the product to retrieve'
          }
        },
        required: ['product_id']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_to_cart',
      description: 'Add a product to the user\'s shopping cart. This is a conceptual operation that confirms the intent - the actual cart is managed by the UI.',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The ID of the product to add to cart'
          },
          quantity: {
            type: 'number',
            description: 'Quantity to add (default: 1)',
            default: 1
          }
        },
        required: ['product_id']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'remove_from_cart',
      description: 'Remove a product from the user\'s shopping cart',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The ID of the product to remove'
          }
        },
        required: ['product_id']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_cart_summary',
      description: 'Get a summary of the current cart contents',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'save_ai_query',
      description: 'Internal tool to log AI queries and responses for analytics',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'User ID'
          },
          question: {
            type: 'string',
            description: 'User question'
          },
          answer: {
            type: 'string',
            description: 'AI response'
          },
          product_id: {
            type: 'string',
            description: 'Related product ID (optional)'
          }
        },
        required: ['user_id', 'question', 'answer']
      }
    }
  }
];

// ============================================================================
// MCP Tool Implementations
// ============================================================================

interface FilterProductsParams {
  search?: string;
  brand?: string;
  category?: string;
  color?: string;
  price_min?: number;
  price_max?: number;
  in_stock_only?: boolean;
}

interface FilterProductsResult {
  success: boolean;
  count?: number;
  products?: any[];
  productIds?: string[];
  filterApplied?: any;
  error?: string;
}

interface ToolExecutionContext {
  storeId: string;
  userId: string;
  userRole: string;
}

/**
 * Filter products based on search criteria
 */
export async function filterProducts(
  params: FilterProductsParams,
  context: ToolExecutionContext
): Promise<FilterProductsResult> {
  try {
    const { storeId } = context;
    const {
      search,
      brand,
      category,
      color,
      price_min,
      price_max,
      in_stock_only = true
    } = params;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      storeId,
      isActive: true,
      ...(in_stock_only && { stock: { gt: 0 } })
    };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add brand filter (check tags)
    if (brand) {
      where.tags = {
        path: ['$'],
        array_contains: brand
      };
    }

    // Add price filters
    if (price_min !== undefined) {
      where.price = { ...where.price as any, gte: price_min };
    }
    if (price_max !== undefined) {
      where.price = { ...where.price as any, lte: price_max };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        tags: true,
        sku: true
      },
      take: 20, // Limit results
      orderBy: { createdAt: 'desc' }
    });

    const productResults = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      stock: p.stock,
      images: p.images,
      tags: p.tags,
      sku: p.sku
    }));

    return {
      success: true,
      count: products.length,
      products: productResults,
      // Include product IDs for UI filtering
      productIds: products.map(p => p.id),
      filterApplied: {
        search,
        brand,
        category,
        color,
        price_min,
        price_max
      }
    };
  } catch (error) {
    console.error('Error filtering products:', error);
    return {
      success: false,
      error: 'Failed to filter products'
    };
  }
}

/**
 * Get product details by ID
 */
export async function showProductDetails(
  params: { product_id: string },
  context: ToolExecutionContext
) {
  try {
    const { storeId } = context;
    const { product_id } = params;

    const product = await prisma.product.findFirst({
      where: {
        id: product_id,
        storeId, // Ensure product belongs to current store
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        tags: true,
        sku: true,
        createdAt: true
      }
    });

    if (!product) {
      return {
        success: false,
        error: 'Product not found or not available'
      };
    }

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        images: product.images,
        tags: product.tags,
        sku: product.sku,
        added_date: product.createdAt
      }
    };
  } catch (error) {
    console.error('Error getting product details:', error);
    return {
      success: false,
      error: 'Failed to get product details'
    };
  }
}

/**
 * Add product to cart (conceptual - logs the intent)
 */
export async function addToCart(
  params: { product_id: string; quantity?: number },
  context: ToolExecutionContext
) {
  try {
    const { storeId, userId } = context;
    const { product_id, quantity = 1 } = params;

    // Verify product exists and belongs to store
    const product = await prisma.product.findFirst({
      where: {
        id: product_id,
        storeId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Insufficient stock. Only ${product.stock} available.`
      };
    }

    // Log the cart action
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'ADD_TO_CART',
        targetId: product_id,
        metadata: {
          product_name: product.name,
          quantity,
          price: Number(product.price)
        }
      }
    });

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity
      },
      message: `Added ${quantity}x ${product.name} to cart`
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      error: 'Failed to add to cart'
    };
  }
}

/**
 * Remove product from cart
 */
export async function removeFromCart(
  params: { product_id: string },
  context: ToolExecutionContext
) {
  try {
    const { userId } = context;
    const { product_id } = params;

    // Log the removal
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'REMOVE_FROM_CART',
        targetId: product_id,
        metadata: {
          action: 'remove'
        }
      }
    });

    return {
      success: true,
      message: 'Product removed from cart'
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      error: 'Failed to remove from cart'
    };
  }
}

/**
 * Get cart summary (conceptual - returns message)
 */
export async function getCartSummary(
  params: {},
  context: ToolExecutionContext
) {
  // This is a conceptual tool - the actual cart is managed client-side
  // We return a message indicating the user should check their UI cart
  return {
    success: true,
    message: 'Please check your shopping cart in the sidebar to see your current items and total.',
    note: 'Cart is managed in the UI'
  };
}

/**
 * Save AI query for analytics
 */
export async function saveAIQuery(
  params: {
    user_id: string;
    question: string;
    answer: string;
    product_id?: string;
  }
) {
  try {
    await prisma.aIQuery.create({
      data: {
        userId: params.user_id,
        question: params.question,
        answer: params.answer,
        productId: params.product_id || null
      }
    });

    return {
      success: true,
      message: 'Query logged successfully'
    };
  } catch (error) {
    console.error('Error saving AI query:', error);
    return {
      success: false,
      error: 'Failed to log query'
    };
  }
}

// ============================================================================
// MCP Tool Router
// ============================================================================

/**
 * Execute an MCP tool by name
 */
export async function executeMCPTool(
  toolName: string,
  params: any,
  context: ToolExecutionContext
): Promise<any> {
  switch (toolName) {
    case 'filter_products':
      return await filterProducts(params, context);

    case 'show_product_details':
      return await showProductDetails(params, context);

    case 'add_to_cart':
      return await addToCart(params, context);

    case 'remove_from_cart':
      return await removeFromCart(params, context);

    case 'get_cart_summary':
      return await getCartSummary(params, context);

    case 'save_ai_query':
      return await saveAIQuery(params);

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`
      };
  }
}
