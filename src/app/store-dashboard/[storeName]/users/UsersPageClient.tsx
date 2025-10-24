'use client';

import { Store } from '@prisma/client';
import { StoreDashboardLayout } from '@/components/store/StoreDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { StoreUserWithPurchases } from '@/services/storeService';

interface UsersPageClientProps {
  store: Store;
  users: StoreUserWithPurchases[];
}

export function UsersPageClient({ store, users }: UsersPageClientProps) {
  const totalPurchases = users.reduce((sum, user) => sum + user.purchases.length, 0);
  const totalRevenue = users.reduce((sum, user) => {
    return sum + user.purchases.reduce((pSum, p) => {
      const amount = typeof p.amount === 'bigint' ? Number(p.amount) : p.amount;
      return pSum + amount;
    }, 0);
  }, 0);

  return (
    <StoreDashboardLayout storeName={store.storeName} storeUrl={store.url}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">End Users</h1>
          <p className="mt-2 text-gray-600">
            View your customers and their purchase history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <span className="text-2xl">📦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No customers registered yet
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {user.purchases.length} purchase{user.purchases.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${user.purchases.reduce((sum, p) => {
                            const amount = typeof p.amount === 'bigint' ? Number(p.amount) : p.amount;
                            return sum + amount;
                          }, 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {user.purchases.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Purchase History</h4>
                        <div className="space-y-2">
                          {user.purchases.map((purchase) => {
                            const amount = typeof purchase.amount === 'bigint'
                              ? Number(purchase.amount)
                              : purchase.amount;
                            return (
                              <div
                                key={purchase.id}
                                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                              >
                                <div>
                                  <span className="font-medium">#{purchase.invoiceNumber}</span>
                                  <span className="text-gray-500 ml-2">
                                    {new Date(purchase.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      purchase.status === 'PAID'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {purchase.status}
                                  </span>
                                  <span className="font-medium">${amount.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StoreDashboardLayout>
  );
}
