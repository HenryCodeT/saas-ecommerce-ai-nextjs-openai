'use client';

import { Product } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, showActions = true }: ProductCardProps) {
  const images = product.images as string[] | null;
  const tags = product.tags as string[] | null;
  const firstImage = images && images.length > 0 ? images[0] : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {!product.isActive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Inactive
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            {product.sku && (
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">
              Stock: {product.stock}
            </span>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block text-gray-500 px-2 py-0.5 text-xs">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
