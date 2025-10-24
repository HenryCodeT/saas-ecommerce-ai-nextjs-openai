import { useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProductFilter {
  productIds?: string[];
  filterApplied?: any;
}

export function useChat(storeId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello 👋 Welcome! I can help you find anything you\'re looking for. What would you like to browse today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<ProductFilter | null>(null);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          message: content,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      console.log('[Chat] Received AI response:', {
        hasMessage: !!data.message,
        hasProductIds: !!data.productIds,
        productCount: data.productIds?.length || 0,
        productIds: data.productIds
      });

      // Update product filter if AI filtered products
      if (data.productIds && data.productIds.length > 0) {
        console.log('[Chat] Setting product filter:', data.productIds);
        setProductFilter({
          productIds: data.productIds,
          filterApplied: data.filterApplied
        });
      } else if (data.productIds?.length === 0) {
        console.log('[Chat] Clearing filter - no products');
        // Clear filter if no products found
        setProductFilter(null);
      } else {
        console.log('[Chat] No productIds in response');
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello 👋 Welcome! I can help you find anything you\'re looking for. What would you like to browse today?',
        timestamp: new Date(),
      },
    ]);
    setProductFilter(null);
  };

  const clearFilter = () => {
    setProductFilter(null);
  };

  return {
    messages,
    isLoading,
    error,
    productFilter,
    sendMessage,
    clearMessages,
    clearFilter,
  };
}
