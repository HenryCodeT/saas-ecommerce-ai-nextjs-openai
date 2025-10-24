// Store Page (End User)
// Phase 4 Implementation - Full E-commerce Experience

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StorePageClient } from "./StorePageClient";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Store Page (End User View)
 *
 * Features:
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

  // Verify the store exists and fetch products
  const store = await prisma.store.findUnique({
    where: { url: params.storeName },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
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

  return <StorePageClient store={store} initialProducts={store.products} />;
}
