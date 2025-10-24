'use client';

import { StoreWithUsers } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface StoresTableProps {
  stores: StoreWithUsers[];
}

export function StoresTable({ stores }: StoresTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-50';
      case 'SUSPENDED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Stores ({stores.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Store Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">City</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Users</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Products</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No stores found
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {store.logoUrl && (
                          <img
                            src={store.logoUrl}
                            alt={store.storeName}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{store.storeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/store/${store.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        /store/{store.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{store.clientName}</div>
                        <div className="text-xs text-gray-500">{store.clientEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          store.status
                        )}`}
                      >
                        {store.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {store.city || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {store.category || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        {store.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                        {store.productCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        {new Date(store.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(store.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {store.description ? (
                        <div className="text-sm text-gray-600 truncate" title={store.description}>
                          {store.description}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No description</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
