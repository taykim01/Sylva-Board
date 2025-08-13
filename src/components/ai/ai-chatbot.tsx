"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAiChat } from '@/hooks/use-ai-chat';
import type { ChatbotMessage } from '@/features/ai-chat-features';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import Spinner from '@/components/common/spinner';

interface AiChatbotProps {
  userId: string;
}

interface MessageProps {
  message: ChatbotMessage;
  onSourceClick?: (noteId: string) => void;
}

function Message({ message, onSourceClick }: MessageProps) {
  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg",
      message.role === 'user' 
        ? "bg-blue-50 dark:bg-blue-950/20 ml-8" 
        : "bg-gray-50 dark:bg-gray-800/50 mr-8"
    )}>
      <div className="flex-1">
        <div className={cn(
          "text-sm font-medium mb-1",
          message.role === 'user' ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        )}>
          {message.role === 'user' ? 'You' : 'AI Assistant'}
        </div>
        <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {message.content}
        </div>
        
        {/* Show sources if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Sources from your notes:
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSourceClick?.(note.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="truncate max-w-[150px]">{note.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function AiChatbot({ userId }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    isInitialized,
    sendMessage,
    clearMessages,
    clearError
  } = useAiChat({ userId, isOpen });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleSourceClick = (noteId: string) => {
    // This would typically scroll to or highlight the note
    // For now, we'll just log it
    console.log('Navigate to note:', noteId);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
              {!isInitialized && (
                <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                  Initializing...
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-xs"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChatbot}
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-300">
                Error: {error}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-xs mt-1"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onSourceClick={handleSourceClick}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 text-sm text-gray-600 dark:text-gray-400">
                <Spinner />
                <span>AI is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={setInputValue}
                onEnter={handleSendMessage}
                placeholder="Ask about your notes..."
                className="flex-1"
                disabled={isLoading || !isInitialized}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !isInitialized}
                size="icon"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={toggleChatbot}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 text-white",
          isOpen && "bg-gray-600 hover:bg-gray-700"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}