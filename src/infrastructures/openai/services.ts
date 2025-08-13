import { openai, EMBEDDING_MODEL, CHAT_MODEL } from './client';
import type { Tables } from '@/database.types';

export interface EmbeddingResponse {
  embedding: number[];
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface RelevantNote {
  note: Tables<"note">;
  similarity: number;
}

/**
 * Generate embedding for text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResponse> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    if (!response.data[0]?.embedding) {
      return { embedding: [], error: 'Failed to generate embedding' };
    }

    return { embedding: response.data[0].embedding };
  } catch (error) {
    console.error('Error generating embedding:', error);
    return { 
      embedding: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate embeddings for note content (title + content combined)
 */
export async function generateNoteEmbedding(note: Pick<Tables<"note">, 'title' | 'content'>): Promise<EmbeddingResponse> {
  const combinedText = `${note.title}\n\n${note.content}`.trim();
  return generateEmbedding(combinedText);
}

/**
 * Generate chat completion using GPT model with context from relevant notes
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  relevantNotes?: RelevantNote[],
  maxTokens: number = 1000
): Promise<ChatResponse> {
  try {
    // Prepare system message with context if relevant notes are provided
    let systemMessage = `You are a helpful AI assistant that helps users interact with their notes. You can answer questions, provide summaries, and help with note management.`;
    
    if (relevantNotes && relevantNotes.length > 0) {
      const contextNotes = relevantNotes
        .map((item, index) => 
          `Note ${index + 1} (similarity: ${(item.similarity * 100).toFixed(1)}%):\nTitle: ${item.note.title}\nContent: ${item.note.content}\n`
        )
        .join('\n');

      systemMessage += `\n\nHere are some relevant notes from the user's collection that might help answer their question:\n\n${contextNotes}\n\nPlease use this context to provide a helpful response. Always cite which notes you're referencing when possible.`;
    }

    // Prepare messages for API call
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemMessage },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: apiMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: false,
    });

    const message = response.choices[0]?.message?.content;
    
    if (!message) {
      return { message: '', error: 'No response generated' };
    }

    return { message };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return { 
      message: '', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Process user query using prompt chaining for better understanding
 */
export async function processUserQuery(query: string): Promise<{
  processedQuery: string;
  searchTerms: string[];
  intent: 'search' | 'summary' | 'question' | 'general';
  error?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a query processing assistant. Analyze the user's query and extract:
1. A cleaned, well-formatted version of their query
2. Key search terms that would help find relevant notes
3. The intent of the query (search, summary, question, or general)

Respond in JSON format:
{
  "processedQuery": "cleaned query",
  "searchTerms": ["term1", "term2"],
  "intent": "search|summary|question|general"
}`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        processedQuery: query,
        searchTerms: [query],
        intent: 'general',
        error: 'Failed to process query'
      };
    }

    try {
      const parsed = JSON.parse(content);
      return {
        processedQuery: parsed.processedQuery || query,
        searchTerms: Array.isArray(parsed.searchTerms) ? parsed.searchTerms : [query],
        intent: parsed.intent || 'general'
      };
    } catch {
      return {
        processedQuery: query,
        searchTerms: [query],
        intent: 'general',
        error: 'Failed to parse processed query'
      };
    }
  } catch (error) {
    console.error('Error processing user query:', error);
    return {
      processedQuery: query,
      searchTerms: [query],
      intent: 'general',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}