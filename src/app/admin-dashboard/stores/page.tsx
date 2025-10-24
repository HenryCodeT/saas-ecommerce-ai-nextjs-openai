import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllStoresWithUsers } from '@/services/adminService';
import { StoresTable } from '@/components/admin/StoresTable';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Stores - Admin Dashboard',
  description: 'View all stores and their details',
};

export default async function StoresPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const stores = await getAllStoresWithUsers();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores Management</h1>
          <p className="mt-2 text-gray-600">
            View all stores in the system with detailed information and statistics
          </p>
        </div>

        <StoresTable stores={stores} />
      </div>
    </AdminLayout>
  );
}
