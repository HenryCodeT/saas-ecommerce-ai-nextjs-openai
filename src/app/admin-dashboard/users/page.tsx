import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllUsers } from '@/services/adminService';
import { UsersTable } from '@/components/admin/UsersTable';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Users - Admin Dashboard',
  description: 'View all end users and their details',
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const users = await getAllUsers();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">End Users Management</h1>
          <p className="mt-2 text-gray-600">
            View all end users registered in the system across all stores
          </p>
        </div>

        <UsersTable users={users} />
      </div>
    </AdminLayout>
  );
}
