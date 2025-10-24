'use client';

import { CartItem } from '@/hooks/useCart';
import { Prisma } from '@prisma/client';

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemComponentProps) {
  const { product, quantity } = item;

  const price = product.price instanceof Prisma.Decimal
    ? product.price.toNumber()
    : Number(product.price);

  const images = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0];

  const subtotal = price * quantity;

  return (
    <div className="p-4 flex items-center space-x-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
        {firstImage ? (
          <img
            src={String(firstImage)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-3xl">📦</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
        <p className="text-sm text-gray-600">${price.toFixed(2)} each</p>
        {product.stock < quantity && (
          <p className="text-xs text-red-600 mt-1">
            Only {product.stock} available
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
          disabled={quantity <= 1}
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
          disabled={quantity >= product.stock}
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[100px]">
        <p className="font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="text-red-600 hover:text-red-700 p-2"
        title="Remove from cart"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
