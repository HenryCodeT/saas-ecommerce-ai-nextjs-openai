'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TokenUsageByStore } from '@/services/adminService';

interface TokenUsageTableProps {
  tokenUsage: TokenUsageByStore[];
  isLoading?: boolean;
}

export function TokenUsageTable({ tokenUsage, isLoading }: TokenUsageTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Store</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tokenUsage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Store</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            No token usage data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage by Store</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Store Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Plan</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Tokens Used</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Monthly Limit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Usage %</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Last Used</th>
              </tr>
            </thead>
            <tbody>
              {tokenUsage.map((store) => {
                const usagePercentage = (store.tokensUsed / store.monthlyLimit) * 100;
                const getUsageColor = (percentage: number) => {
                  if (percentage >= 90) return 'text-red-600 font-semibold';
                  if (percentage >= 70) return 'text-orange-600 font-medium';
                  return 'text-green-600';
                };

                return (
                  <tr
                    key={store.storeId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{store.storeName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {store.planName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {store.tokensUsed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {store.monthlyLimit.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right ${getUsageColor(usagePercentage)}`}>
                      {usagePercentage.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {store.lastUsed
                        ? new Date(store.lastUsed).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
