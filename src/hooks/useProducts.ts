import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';

export function useProducts(storeId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!storeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products?storeId=${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    if (!storeId) throw new Error('Store ID is required');

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, ...productData }),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    const newProduct = await response.json();
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (productId: string, productData: any) => {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const updatedProduct = await response.json();
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updatedProduct : p))
    );
    return updatedProduct;
  };

  const deleteProduct = async (productId: string) => {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
