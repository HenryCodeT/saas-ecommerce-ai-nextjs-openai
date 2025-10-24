import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getTokenUsageByStore } from '@/services/adminService';
import { TokenUsageTable } from '@/components/admin/TokenUsageTable';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Token Usage - Admin Dashboard',
  description: 'View token usage by store',
};

export default async function TokenUsagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const tokenUsage = await getTokenUsageByStore();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Token Usage Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor AI token consumption across all stores and their usage limits
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Stores</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{tokenUsage.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Tokens Used</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {tokenUsage.reduce((sum, store) => sum + store.tokensUsed, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Capacity</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {tokenUsage.reduce((sum, store) => sum + store.monthlyLimit, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <TokenUsageTable tokenUsage={tokenUsage} />
      </div>
    </AdminLayout>
  );
}
