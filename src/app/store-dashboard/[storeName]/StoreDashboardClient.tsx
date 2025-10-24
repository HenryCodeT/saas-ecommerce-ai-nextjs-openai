'use client';

import { Store, Prisma } from '@prisma/client';
import { StoreDashboardLayout } from '@/components/store/StoreDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoreDashboardClientProps {
  store: Store;
  stats: {
    productCount: number;
    userCount: number;
    activeProductCount: number;
    totalRevenue: number | Prisma.Decimal;
  };
}

export function StoreDashboardClient({ store, stats }: StoreDashboardClientProps) {
  console.log('stats', stats, store.storeName, store.url);
  const revenue = typeof stats.totalRevenue === 'object' && 'toNumber' in stats.totalRevenue
    ? stats.totalRevenue.toNumber()
    : Number(stats.totalRevenue);

  return (
    <StoreDashboardLayout storeName={store.storeName} storeUrl={store.url}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <span className="text-2xl">📦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProductCount} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">End Users</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Status</CardTitle>
              <span className="text-2xl">🏪</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{store.status}</div>
              <p className="text-xs text-muted-foreground">
                Current status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href={`/store-dashboard/${store.url}/products`}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-4xl mb-2">📦</span>
                <span className="font-medium">Manage Products</span>
                <span className="text-sm text-gray-500 mt-1">Add, edit, or remove products</span>
              </a>

              <a
                href={`/store-dashboard/${store.url}/users`}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-4xl mb-2">👥</span>
                <span className="font-medium">View Customers</span>
                <span className="text-sm text-gray-500 mt-1">See customer list and purchases</span>
              </a>

              <a
                href={`/store-dashboard/${store.url}/settings`}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-4xl mb-2">⚙️</span>
                <span className="font-medium">Store Settings</span>
                <span className="text-sm text-gray-500 mt-1">Update store information</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-500">Store Name</div>
                <div className="mt-1 text-gray-900">{store.storeName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Store URL</div>
                <div className="mt-1 text-gray-900">/store/{store.url}</div>
              </div>
              {store.city && (
                <div>
                  <div className="text-sm font-medium text-gray-500">City</div>
                  <div className="mt-1 text-gray-900">{store.city}</div>
                </div>
              )}
              {store.category && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Category</div>
                  <div className="mt-1 text-gray-900">{store.category}</div>
                </div>
              )}
              {store.description && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="mt-1 text-gray-900">{store.description}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StoreDashboardLayout>
  );
}
