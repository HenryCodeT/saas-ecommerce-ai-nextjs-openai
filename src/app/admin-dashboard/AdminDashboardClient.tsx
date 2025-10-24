'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricsCards } from '@/components/admin/MetricsCards';
import { TokenUsageTable } from '@/components/admin/TokenUsageTable';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const { metrics, tokenUsage, isLoading, error } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Here's an overview of your system's performance
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Metrics Cards */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Metrics
          </h3>
          <MetricsCards metrics={metrics} isLoading={isLoading} />
        </section>

        {/* Token Usage Table */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Token Usage Overview
          </h3>
          <TokenUsageTable tokenUsage={tokenUsage} isLoading={isLoading} />
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            Read-Only Dashboard
          </h4>
          <p className="text-sm text-blue-800">
            This dashboard provides read-only access to system metrics and data.
            Only purchases are logged in Activity Logs. No modifications can be made from this interface.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
