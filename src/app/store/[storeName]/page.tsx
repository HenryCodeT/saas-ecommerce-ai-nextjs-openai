// Store Page (End User)
// Placeholder for Phase 4 implementation

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Store Page (End User View)
 * 
 * Role-based access control:
 * - Accessible to END_USER role
 * - Users can only view stores they are registered at
 * - Will be fully implemented in Phase 4
 * 
 * Phase 4 features (to be implemented):
 * - Product catalog display
 * - Shopping cart functionality
 * - AI chat about products and store
 * - Purchase simulation
 * - User registration via store URL
 */
export default async function StorePage({
  params,
}: {
  params: { storeName: string };
}) {
  // Check authentication
  const session = await getServerSession(authOptions);

  // For now, allow unauthenticated access to view store
  // In Phase 4, implement proper registration flow

  // Verify the store exists
  const store = await prisma.store.findUnique({
    where: { url: params.storeName },
    include: {
      clientUser: true,
    },
  });

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Store Not Found
          </h1>
          <p className="text-gray-600">
            The store you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // If authenticated as END_USER, verify they're registered at this store
  if (session?.user && session.user.role === "END_USER") {
    if (session.user.storeId !== store.id) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {store.storeName}
          </h1>
          {store.description && (
            <p className="text-gray-600 mt-2">{store.description}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Phase 1 Complete ✓
            </h2>
            <p className="text-gray-600 mb-8">
              This store is ready! The customer-facing features will be fully
              implemented in Phase 4.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-purple-900 mb-3">
                Phase 4 Features (Coming Soon):
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>• Browse product catalog</li>
                <li>• Add products to shopping cart</li>
                <li>• AI-powered chat about products</li>
                <li>• Simulate purchase transactions</li>
                <li>• Customer registration via store URL</li>
                <li>• View purchase history</li>
              </ul>
            </div>

            {!session?.user && (
              <div className="mt-8">
                <p className="text-gray-600 mb-4">
                  Want to shop at this store?
                </p>
                <a
                  href={`/store/${params.storeName}/register`}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Account
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
