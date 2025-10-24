'use client';

import { useChat, ChatMessage as ChatMessageType, ProductFilter } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useRef, useEffect } from 'react';

interface ChatBoxProps {
  storeId: string;
  onProductFilter?: (filter: ProductFilter | null) => void;
}

export function ChatBox({ storeId, onProductFilter }: ChatBoxProps) {
  const { messages, isLoading, productFilter, sendMessage, clearFilter } = useChat(storeId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notify parent when product filter changes
  useEffect(() => {
    if (onProductFilter) {
      onProductFilter(productFilter);
    }
  }, [productFilter, onProductFilter]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold text-lg flex items-center">
          <span className="mr-2">💬</span>
          AI Shopping Assistant
        </h3>
        <p className="text-sm text-blue-100 mt-1">
          Ask me anything about our products!
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm">AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
