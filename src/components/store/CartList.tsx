'use client';

import { CartItem } from '@/hooks/useCart';
import { CartItemComponent } from './CartItemComponent';

interface CartListProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  total: number;
}

export function CartList({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  total,
}: CartListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600">
          Start adding products to your cart to continue shopping!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Cart Items */}
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <CartItemComponent
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          This is a simulated purchase - no real payment will be processed
        </p>
      </div>
    </div>
  );
}
