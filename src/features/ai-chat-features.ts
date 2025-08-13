"use server"

import { createClient } from '@/infrastructures/supabase/client';
import { generateEmbedding, generateNoteEmbedding, generateChatCompletion, processUserQuery } from '@/infrastructures/openai/services';
import type { Tables } from '@/database.types';
import type { RelevantNote, ChatMessage } from '@/infrastructures/openai/services';

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Tables<"note">[];
}

export interface ChatbotState {
  messages: ChatbotMessage[];
  isLoading: boolean;
  error?: string;
}

/**
 * Generate and store embedding for a note
 */
export async function generateAndStoreNoteEmbedding(noteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Get the note
    const { data: note, error: fetchError } = await supabase
      .from('note')
      .select('id, title, content')
      .eq('id', noteId)
      .single();

    if (fetchError || !note) {
      return { success: false, error: 'Failed to fetch note' };
    }

    // Generate embedding
    const { embedding, error: embeddingError } = await generateNoteEmbedding(note);
    
    if (embeddingError || embedding.length === 0) {
      return { success: false, error: embeddingError || 'Failed to generate embedding' };
    }

    // Store embedding in database
    const { error: updateError } = await supabase
      .from('note')
      .update({ embedding: JSON.stringify(embedding) })
      .eq('id', noteId);

    if (updateError) {
      return { success: false, error: 'Failed to store embedding' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error generating and storing note embedding:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate embeddings for all notes that don't have them
 */
export async function generateMissingEmbeddings(userId: string): Promise<{ 
  processed: number; 
  success: number; 
  errors: string[] 
}> {
  try {
    const supabase = createClient();
    
    // Get all notes without embeddings for this user
    const { data: notes, error: fetchError } = await supabase
      .from('note')
      .select('id, title, content')
      .eq('creator_id', userId)
      .is('embedding', null);

    if (fetchError) {
      return { processed: 0, success: 0, errors: ['Failed to fetch notes'] };
    }

    if (!notes || notes.length === 0) {
      return { processed: 0, success: 0, errors: [] };
    }

    const results = {
      processed: notes.length,
      success: 0,
      errors: [] as string[]
    };

    // Process notes in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (note) => {
        const result = await generateAndStoreNoteEmbedding(note.id);
        if (result.success) {
          results.success++;
        } else {
          results.errors.push(`Note ${note.title}: ${result.error}`);
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < notes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating missing embeddings:', error);
    return { 
      processed: 0, 
      success: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

/**
 * Search for relevant notes using vector similarity
 */
export async function searchRelevantNotes(
  query: string, 
  userId: string, 
  limit: number = 5,
  threshold: number = 0.5
): Promise<{ notes: RelevantNote[]; error?: string }> {
  try {
    const supabase = createClient();
    
    // Generate embedding for the query
    const { embedding, error: embeddingError } = await generateEmbedding(query);
    
    if (embeddingError || embedding.length === 0) {
      return { notes: [], error: embeddingError || 'Failed to generate query embedding' };
    }

    // Search for similar notes using the query_note function
    const { data: similarNotes, error: searchError } = await supabase
      .rpc('query_note', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: threshold,
        match_count: limit
      });

    if (searchError) {
      return { notes: [], error: 'Failed to search notes' };
    }

    if (!similarNotes || similarNotes.length === 0) {
      return { notes: [] };
    }

    // Filter by user and calculate similarity scores
    const userNotes = similarNotes
      .filter((note: Tables<"note">) => note.creator_id === userId)
      .map((note: Tables<"note">): RelevantNote => ({
        note,
        similarity: 0.8 // Placeholder - actual similarity would be calculated from distance
      }));

    return { notes: userNotes };
  } catch (error) {
    console.error('Error searching relevant notes:', error);
    return { 
      notes: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Process a chat message and generate AI response
 */
export async function processChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  userId: string
): Promise<{
  response: string;
  sources: Tables<"note">[];
  error?: string;
}> {
  try {
    // Step 1: Process the user query to understand intent and extract search terms
    const queryAnalysis = await processUserQuery(message);
    
    // Step 2: Search for relevant notes
    const { notes: relevantNotes, error: searchError } = await searchRelevantNotes(
      queryAnalysis.processedQuery,
      userId,
      5,
      0.3
    );
    
    if (searchError) {
      console.warn('Search error:', searchError);
    }

    // Step 3: Prepare conversation context
    const messages: ChatMessage[] = [
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ];

    // Step 4: Generate AI response with context
    const { message: aiResponse, error: chatError } = await generateChatCompletion(
      messages,
      relevantNotes,
      1000
    );

    if (chatError) {
      return {
        response: 'Sorry, I encountered an error while processing your message. Please try again.',
        sources: [],
        error: chatError
      };
    }

    return {
      response: aiResponse,
      sources: relevantNotes.map(item => item.note),
      error: undefined
    };
  } catch (error) {
    console.error('Error processing chat message:', error);
    return {
      response: 'Sorry, I encountered an error while processing your message. Please try again.',
      sources: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Auto-generate embeddings when a note is created or updated
 */
export async function handleNoteChange(note: Tables<"note">): Promise<void> {
  // Generate embedding in the background
  generateAndStoreNoteEmbedding(note.id).catch(error => {
    console.error('Failed to generate embedding for note:', note.id, error);
  });
}