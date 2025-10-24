'use client';

import { Product, Prisma } from '@prisma/client';
import { useState } from 'react';

interface ProductCardUserProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCardUser({ product, onAddToCart }: ProductCardUserProps) {
  const [isAdding, setIsAdding] = useState(false);

  const price = product.price instanceof Prisma.Decimal
    ? product.price.toNumber()
    : Number(product.price);

  const images = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0];

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      onAddToCart(product);
      // Show brief feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 flex flex-col h-full">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative">
        {firstImage ? (
          <img
            src={String(firstImage)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-5xl">📦</span>
          </div>
        )}
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-base">Unavailable</span>
          </div>
        )}
        {product.stock <= 0 && product.isActive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {product.stock} in stock
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.isActive || product.stock <= 0 || isAdding}
            className={`w-full px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
              !product.isActive || product.stock <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAdding
                ? 'bg-green-600 text-white scale-95'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            {isAdding ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
