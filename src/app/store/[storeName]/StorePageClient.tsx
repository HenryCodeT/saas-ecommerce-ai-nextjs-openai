'use client';

import { Store, Product } from '@prisma/client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { StorePageLayout } from '@/components/store/StorePageLayout';
import { ProductList } from '@/components/store/ProductList';
import { CartList } from '@/components/store/CartList';
import { ChatBox } from '@/components/store/ChatBox';
import { PurchaseSummary } from '@/components/store/PurchaseSummary';
import { useCart } from '@/hooks/useCart';
import { ProductFilter } from '@/hooks/useChat';
import clsx from 'clsx';

interface StorePageClientProps {
  store: Store;
  initialProducts: Product[];
}

const PRODUCTS_PER_PAGE = 9;

export function StorePageClient({ store, initialProducts }: StorePageClientProps) {
  const { data: session } = useSession();
  const [products] = useState<Product[]>(initialProducts);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'chat'>('chat');
  const [currentPage, setCurrentPage] = useState(1);
  const [aiProductFilter, setAiProductFilter] = useState<ProductFilter | null>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();

  // Filter products based on AI chat recommendations
  const filteredProducts = useMemo(() => {
    if (!aiProductFilter?.productIds || aiProductFilter.productIds.length === 0) {
      return products;
    }
    // Filter to only show products that AI recommended
    return products.filter(p => aiProductFilter.productIds!.includes(p.id));
  }, [products, aiProductFilter]);

  // Calculate pagination based on filtered products
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts.length]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Handle AI product filter updates
  const handleProductFilter = (filter: ProductFilter | null) => {
    console.log('[StorePageClient] Received product filter:', {
      hasFilter: !!filter,
      productCount: filter?.productIds?.length || 0,
      productIds: filter?.productIds
    });

    setAiProductFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes

    // Scroll to products section when AI filters products
    if (filter?.productIds && filter.productIds.length > 0) {
      console.log('[StorePageClient] Scrolling to products section');
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  // Clear AI filter
  const handleClearFilter = () => {
    setAiProductFilter(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to products section
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          items,
          totalAmount: getTotal(),
        }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      // Success!
      clearCart();
      setShowCheckout(false);
      setShowSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Purchase error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!session?.user;

  return (
    <StorePageLayout store={store}>
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl mr-3">✓</span>
            <div>
              <p className="font-semibold text-green-900">
                Purchase Successful!
              </p>
              <p className="text-sm text-green-800 mt-1">
                Your order has been confirmed. Check your purchase history for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs (for mobile) */}
      <div className="lg:hidden mb-6 flex space-x-2 border-b border-gray-200">
        {isAuthenticated && (
          <>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 font-medium ${activeTab === 'chat'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
                }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`px-4 py-2 font-medium flex items-center ${activeTab === 'cart'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
                }`}
            >
              Cart
              {getItemCount() > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${activeTab === 'products'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600'
            }`}
        >
          Products
        </button>
      </div>

      {/* Chat & Cart - Top Section (Side by Side) */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Chat Assistant */}
          <div className={clsx(activeTab !== 'chat' && 'hidden lg:block')}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ask Our AI Assistant
              </h2>
              <ChatBox storeId={store.id} onProductFilter={handleProductFilter} />
            </div>
          </div>

          {/* Shopping Cart */}
          <div className={clsx(activeTab !== 'cart' && 'hidden lg:block')}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Shopping Cart
              </h2>
              <CartList
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onCheckout={handleCheckout}
                total={getTotal()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-900 mb-3">
            Sign in to shop!
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Create an account to add products to your cart, chat with our AI
            assistant, and make purchases.
          </p>
          <div className="space-y-2">
            <a
              href={`/store/${store.url}/register`}
              className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Create Account
            </a>
            <a
              href="/login"
              className="block w-full bg-white text-blue-600 text-center px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-50 font-medium"
            >
              Sign In
            </a>
          </div>
        </div>
      )}

      {/* Products - Full Width Section Below */}
      <div
        ref={productsRef}
        className={clsx(activeTab !== 'products' && 'hidden lg:block')}
      >
        {/* AI Filter Indicator */}
        {aiProductFilter && aiProductFilter.productIds && aiProductFilter.productIds.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-600 text-xl mr-2">🤖</span>
                <div>
                  <p className="font-semibold text-blue-900">
                    AI Filter Active
                  </p>
                  <p className="text-sm text-blue-700">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} recommended by AI
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearFilter}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
              <p className="text-gray-600 mt-2 text-base">
                {filteredProducts.length > 0 ? (
                  <>
                    Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}-{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </>
                ) : (
                  'No products available'
                )}
              </p>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>
        <ProductList
          products={paginatedProducts}
          onAddToCart={handleAddToCart}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Purchase Summary Modal */}
      {showCheckout && (
        <PurchaseSummary
          items={items}
          total={getTotal()}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </StorePageLayout>
  );
}
