// Store Dashboard Page (Client)
// Placeholder for Phase 3 implementation

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Store Dashboard Page
 * 
 * Role-based access control:
 * - Only accessible to users with CLIENT role
 * - Will be fully implemented in Phase 3
 * 
 * Phase 3 features (to be implemented):
 * - CRUD operations for products
 * - List of end users and their purchases
 * - Store information management
 * - Activity logs for the store
 */
export default async function StoreDashboardPage({
  params,
}: {
  params: { storeName: string };
}) {
  // Check authentication and role
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/");
  }

  // Verify the store exists and belongs to this client
  const store = await prisma.store.findUnique({
    where: { url: params.storeName },
    include: {
      clientUser: true,
    },
  });

  if (!store) {
    redirect("/");
  }

  if (store.clientUserId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {store.storeName}
          </h1>
          <p className="text-gray-600 mt-2">
            Store Dashboard - Welcome, {session.user.name}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Phase 1 Complete ✓
            </h2>
            <p className="text-gray-600 mb-8">
              Your store is set up! The management dashboard will be fully
              implemented in Phase 3.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-green-900 mb-3">
                Phase 3 Features (Coming Soon):
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Add, edit, and delete products</li>
                <li>• View product inventory and stock levels</li>
                <li>• Manage store information (logo, description, hours)</li>
                <li>• View list of customers and their purchases</li>
                <li>• Track store activity and sales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
