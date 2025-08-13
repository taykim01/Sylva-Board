#!/usr/bin/env tsx

/**
 * One-time script to generate embeddings for all existing notes
 * Usage: npx tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('- OPENAI_API_KEY');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

interface Note {
  id: string;
  title: string;
  content: string;
  embedding: string | null;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    if (!response.data[0]?.embedding) {
      throw new Error('No embedding returned from OpenAI');
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processNote(note: Note): Promise<{ success: boolean; error?: string }> {
  try {
    // Combine title and content for embedding
    const combinedText = `${note.title}\n\n${note.content}`.trim();
    
    if (!combinedText) {
      console.log(`Skipping note ${note.id} - empty content`);
      return { success: true };
    }

    console.log(`Generating embedding for note: ${note.id} - "${note.title}"`);
    
    // Generate embedding
    const embedding = await generateEmbedding(combinedText);
    
    // Update note in database
    const { error } = await supabase
      .from('note')
      .update({ embedding: JSON.stringify(embedding) })
      .eq('id', note.id);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log(`✅ Successfully updated embedding for note: ${note.id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to process note ${note.id}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  console.log('🚀 Starting embedding generation for all notes...');
  
  try {
    // Fetch all notes without embeddings
    const { data: notes, error: fetchError } = await supabase
      .from('note')
      .select('id, title, content, embedding')
      .is('embedding', null)
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch notes: ${fetchError.message}`);
    }

    if (!notes || notes.length === 0) {
      console.log('✨ No notes found without embeddings. All notes are already processed!');
      return;
    }

    console.log(`📝 Found ${notes.length} notes without embeddings`);

    const results = {
      total: notes.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process notes in batches
    for (let i = 0; i < notes.length; i += BATCH_SIZE) {
      const batch = notes.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(notes.length / BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} notes)`);

      // Process batch sequentially to avoid rate limits
      for (const note of batch) {
        const result = await processNote(note as Note);
        results.processed++;
        
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Note ${note.id}: ${result.error}`);
        }

        // Small delay between individual requests
        await sleep(200);
      }

      // Delay between batches
      if (i + BATCH_SIZE < notes.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }

    // Print summary
    console.log('\n🎉 Embedding generation completed!');
    console.log('📊 Summary:');
    console.log(`   Total notes: ${results.total}`);
    console.log(`   Processed: ${results.processed}`);
    console.log(`   Successful: ${results.successful}`);
    console.log(`   Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (results.failed === 0) {
      console.log('\n✅ All embeddings generated successfully!');
    } else {
      console.log(`\n⚠️  ${results.failed} notes failed to process. You may want to run this script again.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});