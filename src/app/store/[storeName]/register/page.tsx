// Store Registration Page
// Allows customers to register for a specific store

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StoreRegisterForm } from "@/components/auth/StoreRegisterForm";

/**
 * Store Registration Page
 * 
 * Allows customers to register for a specific store
 * - Accessible to unauthenticated users
 * - Creates END_USER account linked to the specific store
 * - Redirects to store page after successful registration
 */
export default async function StoreRegisterPage({
  params,
}: {
  params: { storeName: string };
}) {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to store page
  if (session?.user) {
    redirect(`/store/${params.storeName}`);
  }

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
          <a
            href="/"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join {store.storeName}
          </h1>
          <p className="text-gray-600">
            Create your account to start shopping
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <StoreRegisterForm storeId={store.id} storeName={store.storeName} storeUrl={store.url} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
