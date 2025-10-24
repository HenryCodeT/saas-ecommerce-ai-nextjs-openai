'use client';

import { Product } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onAdd?: () => void;
}

export function ProductTable({ products, onEdit, onDelete, onAdd }: ProductTableProps) {
  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Inactive</span>;
    }
    if (product.stock === 0) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">Out of Stock</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products ({products.length})</CardTitle>
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              + Add Product
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create your first product.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const images = product.images as string[] | null;
                  const firstImage = images && images.length > 0 ? images[0] : null;

                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {product.sku || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-medium ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock < 10
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(product)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete?.(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
