"use client";

import { Tables } from "@/database.types";
import { handleDemoGenerateResponse } from "@/features/demo-features";
import { useState } from "react";

export interface ChatbotMessage {
  text: string;
  sender: "user" | "bot";
  sources?: Tables<"note">[];
  timestamp: string;
}

export function useDemoAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);

  const sendMessage = async (query: string) => {
    setMessages((prev) => [...prev, { text: query, sender: "user", timestamp: new Date().toISOString() }]);
    try {
      setLoading(true);
      const { data, error } = await handleDemoGenerateResponse(query);

      if (error || !data || !data.response) {
        setError(error || "Invalid response from the server");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { text: data.response, sender: "bot", timestamp: new Date().toISOString(), sources: data.sources },
      ]);
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
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
}