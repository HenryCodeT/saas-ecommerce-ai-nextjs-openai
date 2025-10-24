'use client';

import { Store, Product } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StorePageLayout } from '@/components/store/StorePageLayout';
import { ProductList } from '@/components/store/ProductList';
import { CartList } from '@/components/store/CartList';
import { ChatBox } from '@/components/store/ChatBox';
import { PurchaseSummary } from '@/components/store/PurchaseSummary';
import { useCart } from '@/hooks/useCart';
import clsx from 'clsx';

interface StorePageClientProps {
  store: Store;
  initialProducts: Product[];
}

export function StorePageClient({ store, initialProducts }: StorePageClientProps) {
  const { data: session } = useSession();
  const [products] = useState<Product[]>(initialProducts);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'chat'>('products');

  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();

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
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${activeTab === 'products'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600'
            }`}
        >
          Products
        </button>
        {isAuthenticated && (
          <>
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
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 font-medium ${activeTab === 'chat'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
                }`}
            >
              Chat
            </button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products - Left Column */}
        <div className={`lg:col-span-2 ${activeTab !== 'products' && 'hidden lg:block'}`}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
            <p className="text-gray-600 mt-1">
              Browse our collection of {products.length} products
            </p>
          </div>
          <ProductList products={products} onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column - Cart & Chat */}
        <div className="space-y-6">
          {/* Shopping Cart */}
          {isAuthenticated && (
            <div className={clsx("lg:col-span-2", activeTab !== "products" && "hidden lg:block")}>

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
          )}

          {/* AI Chat */}
          {isAuthenticated && (
            <div className={clsx(activeTab !== 'chat' && 'hidden lg:block')}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ask Our AI Assistant
              </h2>
              <ChatBox storeId={store.id} />
            </div>
          )}

          {/* Login Prompt for Unauthenticated Users */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
        </div>
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
