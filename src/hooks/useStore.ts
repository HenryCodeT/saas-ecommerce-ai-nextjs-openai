import { useState, useEffect } from 'react';
import { Store } from '@prisma/client';

export function useStore(storeId: string | null) {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = async () => {
    if (!storeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stores/${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      setStore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStore = async (storeData: Partial<Store>) => {
    if (!storeId) throw new Error('Store ID is required');

    const response = await fetch(`/api/stores/${storeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData),
    });

    if (!response.ok) {
      throw new Error('Failed to update store');
    }

    const updatedStore = await response.json();
    setStore(updatedStore);
    return updatedStore;
  };

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  return {
    store,
    isLoading,
    error,
    updateStore,
    refetch: fetchStore,
  };
}
