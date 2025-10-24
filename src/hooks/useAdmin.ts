'use client';

import { useState, useEffect } from 'react';
import type {
  AdminMetrics,
  TokenUsageByStore,
  StoreWithUsers,
  UserListItem,
} from '@/services/adminService';

export function useAdmin() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageByStore[]>([]);
  const [stores, setStores] = useState<StoreWithUsers[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  };

  const fetchTokenUsage = async () => {
    try {
      const response = await fetch('/api/admin/token-usage');
      if (!response.ok) throw new Error('Failed to fetch token usage');
      const data = await response.json();
      setTokenUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token usage');
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores');
      if (!response.ok) throw new Error('Failed to fetch stores');
      const data = await response.json();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stores');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchTokenUsage(),
        fetchStores(),
        fetchUsers(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    metrics,
    tokenUsage,
    stores,
    users,
    isLoading,
    error,
    refresh: loadAllData,
  };
}
