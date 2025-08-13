"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/hooks/use-ai-chat";
import type { ChatbotMessage } from "@/features/ai-chat-features";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";
import Spinner from "@/components/common/spinner";

interface AiChatbotProps {
  userId: string;
}

interface MessageProps {
  message: ChatbotMessage;
  onSourceClick?: (noteId: string) => void;
}

function Message({ message, onSourceClick }: MessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2 p-3 rounded-lg text-sm",
        message.role === "user"
          ? "bg-slate-50 dark:bg-slate-800/50 ml-6"
          : "bg-white dark:bg-gray-800/30 mr-6 border border-gray-100 dark:border-gray-700",
      )}
    >
      <div className="flex-1">
        <div
          className={cn(
            "text-xs font-medium mb-1",
            message.role === "user" ? "text-slate-600 dark:text-slate-400" : "text-gray-600 dark:text-gray-400",
          )}
        >
          {message.role === "user" ? "You" : "AI Assistant"}
        </div>
        <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {/* Show sources if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sources from your notes:</div>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSourceClick?.(note.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="truncate max-w-[120px]">{note.title || "Untitled"}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export function AiChatbot({ userId }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, isInitialized, sendMessage, clearMessages, clearError } = useAiChat({
    userId,
    isOpen,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
    setInputValue("");
    await sendMessage(message);
  };

  const handleSourceClick = (noteId: string) => {
    // This would typically scroll to or highlight the note
    // For now, we'll just log it
    console.log("Navigate to note:", noteId);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
          style={{ boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.08)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-slate-600" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">AI Assistant</h3>
              {!isInitialized && (
                <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                  Initializing...
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs h-6 px-2">
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleChatbot} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-300">Error: {error}</div>
              <Button variant="ghost" size="sm" onClick={clearError} className="text-xs mt-1">
                Dismiss
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <Message key={message.id} message={message} onSourceClick={handleSourceClick} />
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
      <div
        onClick={toggleChatbot}
        className={cn(
          "polymath rounded-full transition-all duration-200 !text-white h-10 text-m14 flex items-center gap-2 px-4 cursor-pointer",
          isOpen ? "bg-gray-500 hover:bg-gray-600" : "bg-slate-500 hover:bg-slate-600",
        )}
        style={{ boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.08)" }}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <div className="mt-0.5">Close Chat</div>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <div className="mt-0.5">Ask AI</div>
          </>
        )}
      </div>
    </div>
  );
}
