import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { processChatMessage, generateMissingEmbeddings } from '@/features/ai-chat-features';
import type { ChatbotMessage, ChatbotState } from '@/features/ai-chat-features';
import type { ChatMessage } from '@/infrastructures/openai/services';

interface UseAiChatProps {
  userId: string;
  isOpen: boolean;
}

export function useAiChat({ userId, isOpen }: UseAiChatProps) {
  const [state, setState] = useState<ChatbotState>({
    messages: [
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you search through your notes, answer questions about them, and provide summaries. What would you like to know?',
        timestamp: new Date(),
        sources: []
      }
    ],
    isLoading: false,
    error: undefined
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize embeddings when chatbot is first opened
  useEffect(() => {
    if (isOpen && !isInitialized && userId) {
      initializeEmbeddings();
    }
  }, [isOpen, isInitialized, userId]);

  const initializeEmbeddings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const results = await generateMissingEmbeddings(userId);
      
      if (results.processed > 0) {
        const statusMessage: ChatbotMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `I've processed ${results.success} of your notes to better understand them. ${
            results.errors.length > 0 
              ? `There were ${results.errors.length} notes that couldn't be processed, but I can still help you with the others.` 
              : 'Now I can better search and answer questions about your notes!'
          }`,
          timestamp: new Date(),
          sources: []
        };
        
        setState(prev => ({ 
          ...prev, 
          messages: [...prev.messages, statusMessage],
          isLoading: false 
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing embeddings:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to initialize AI features'
      }));
    }
  }, [userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    const userMessage: ChatbotMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      sources: []
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: undefined
    }));

    try {
      // Convert messages to ChatMessage format for the API
      const conversationHistory: ChatMessage[] = state.messages
        .slice(-6) // Keep last 6 messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const { response, sources, error } = await processChatMessage(
        content,
        conversationHistory,
        userId
      );

      const assistantMessage: ChatbotMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: sources || []
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        error: error
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatbotMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
        sources: []
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [state.messages, state.isLoading, userId]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [prev.messages[0]], // Keep the welcome message
      error: undefined
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized,
    sendMessage,
    clearMessages,
    clearError
  };
}