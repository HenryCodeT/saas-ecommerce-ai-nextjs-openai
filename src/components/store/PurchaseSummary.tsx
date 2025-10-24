'use client';

import { CartItem } from '@/hooks/useCart';
import { Prisma } from '@prisma/client';
import { useState } from 'react';

interface PurchaseSummaryProps {
  items: CartItem[];
  total: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function PurchaseSummary({
  items,
  total,
  onConfirm,
  onCancel,
}: PurchaseSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Purchase Summary</h2>
          <p className="text-blue-100 text-sm mt-1">
            Review your order before confirming
          </p>
        </div>

        {/* Items */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Items:</h3>
          <div className="divide-y divide-gray-200">
            {items.map((item) => {
              const price =
                item.product.price instanceof Prisma.Decimal
                  ? item.product.price.toNumber()
                  : Number(item.product.price);

              return (
                <div
                  key={item.product.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(price * item.quantity).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Simulation Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <span className="text-yellow-600 text-xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900">
                  Simulated Purchase
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  This is a demonstration. No real payment will be processed and
                  no actual charge will occur.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
