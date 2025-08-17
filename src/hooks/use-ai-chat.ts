// messages: state.messages,
//     isLoading: state.isLoading,
//     error: state.error,
//     isInitialized,
//     sendMessage,
//     clearMessages,
//     clearError

"use client";

import { Tables } from "@/database.types";
import { handleGenerateResponse } from "@/features/agent-features";
import { useState } from "react";

export interface ChatbotMessage {
  text: string;
  sender: "user" | "bot";
  sources?: Tables<"note">[],
  timestamp: string
}

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);

  const sendMessage = async (query: string) => {
    setMessages((prev) => [...prev, { text: query, sender: "user", timestamp: new Date().toISOString() }]);
    try {
      setLoading(true);
      const { data, error } = await handleGenerateResponse(query);
      if (error || !data) setError(error as string);
      else setMessages((prev) => [...prev, { text: data.response, sender: "bot", timestamp: new Date().toISOString(), sources: data.sources }]);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const clearError = () => {
    setError(null)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    clearError
  };
}
