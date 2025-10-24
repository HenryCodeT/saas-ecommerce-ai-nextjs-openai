'use client';

import { Store } from '@prisma/client';
import { useCart } from '@/hooks/useCart';
import { signOut, useSession } from 'next-auth/react';

interface StorePageLayoutProps {
  store: Store;
  children: React.ReactNode;
}

export function StorePageLayout({ store, children }: StorePageLayoutProps) {
  const { getItemCount } = useCart();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Store Name */}
            <div className="flex items-center">
              {store.logoUrl && (
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  className="h-10 w-10 rounded-full mr-3"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {store.storeName}
                </h1>
                {store.city && (
                  <p className="text-xs text-gray-500">{store.city}</p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <a
                href={`/store/${store.url}`}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Products
              </a>

              {session?.user && (
                <>
                  <div className="relative">
                    <a
                      href="#cart"
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                      Cart
                      {getItemCount() > 0 && (
                        <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getItemCount()}
                        </span>
                      )}
                    </a>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {session.user.name}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}

              {!session?.user && (
                <div className="flex items-center space-x-3">
                  <a
                    href={`/store/${store.url}/register`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register
                  </a>
                  <a
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Sign In
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            {store.description && (
              <p className="mb-2">{store.description}</p>
            )}
            {store.businessHours && (
              <p className="mb-2">Hours: {store.businessHours}</p>
            )}
            <p>&copy; 2025 {store.storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
