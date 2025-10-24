'use client';

import { Product } from '@prisma/client';
import { ProductCardUser } from './ProductCardUser';
import { Pagination } from './Pagination';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ProductList({
  products,
  onAddToCart,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products available at the moment.</p>
        <p className="text-gray-400 text-sm mt-2">Check back soon for new items!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCardUser
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
