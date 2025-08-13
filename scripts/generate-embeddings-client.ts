#!/usr/bin/env tsx

/**
 * Alternative embedding generation script using client-side Supabase
 * This uses the anon key and might have row-level security limitations
 * Usage: npx tsx scripts/generate-embeddings-client.ts
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("- OPENAI_API_KEY");
  process.exit(1);
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const EMBEDDING_MODEL = "text-embedding-ada-002";
const BATCH_SIZE = 5; // Smaller batches for client-side
const DELAY_BETWEEN_REQUESTS = 500; // Longer delay for stability

interface Note {
  id: string;
  title: string;
  content: string;
  embedding: string | null;
  creator_id: string;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`Generating embedding for text: "${text.substring(0, 50)}..."`);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    if (!response.data[0]?.embedding) {
      throw new Error("No embedding returned from OpenAI");
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processNote(note: Note): Promise<{ success: boolean; error?: string }> {
  try {
    // Combine title and content for embedding
    const combinedText = `${note.title}\n\n${note.content}`.trim();

    if (!combinedText) {
      console.log(`Skipping note ${note.id} - empty content`);
      return { success: true };
    }

    console.log(`\n📝 Processing note: ${note.id}`);
    console.log(`   Title: "${note.title}"`);
    console.log(`   Content length: ${note.content.length} characters`);

    // Generate embedding
    const embedding = await generateEmbedding(combinedText);
    console.log(`   Generated embedding with ${embedding.length} dimensions`);

    // Update note in database
    const { error } = await supabase
      .from("note")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", note.id);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log(`✅ Successfully updated embedding for note: ${note.id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to process note ${note.id}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  console.log("🚀 Starting embedding generation for all notes...");
  console.log("⚠️  Note: This script uses the anon key and may be limited by row-level security");

  try {
    // Fetch all notes without embeddings
    console.log("📖 Fetching notes from database...");
    const { data: notes, error: fetchError } = await supabase
      .from("note")
      .select("id, title, content, embedding, creator_id")
      .is("embedding", null)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      throw new Error(`Failed to fetch notes: ${fetchError.message}`);
    }

    if (!notes || notes.length === 0) {
      console.log("✨ No notes found without embeddings. All notes are already processed!");
      return;
    }

    console.log(`📝 Found ${notes.length} notes without embeddings`);

    const results = {
      total: notes.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process notes one by one with delays (more conservative approach)
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i] as Note;
      console.log(`\n🔄 Progress: ${i + 1}/${notes.length}`);

      const result = await processNote(note);
      results.processed++;

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`Note ${note.id} (${note.title}): ${result.error}`);
      }

      // Delay between requests
      if (i < notes.length - 1) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms...`);
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    // Print summary
    console.log("\n🎉 Embedding generation completed!");
    console.log("📊 Summary:");
    console.log(`   Total notes: ${results.total}`);
    console.log(`   Processed: ${results.processed}`);
    console.log(`   Successful: ${results.successful}`);
    console.log(`   Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (results.failed === 0) {
      console.log("\n✅ All embeddings generated successfully!");
      console.log("\n🤖 Your AI chatbot is now ready to use with full context understanding!");
    } else {
      console.log(`\n⚠️  ${results.failed} notes failed to process.`);
      if (results.failed === results.total) {
        console.log("\n💡 Tip: You may need to use the service role key instead of anon key.");
        console.log("   Check scripts/README.md for instructions.");
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Fatal error:", error instanceof Error ? error.message : error);
    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Make sure you have the correct environment variables");
    console.log("   2. Check your OpenAI API key and credits");
    console.log("   3. Verify your Supabase permissions");
    console.log("   4. Consider using the service role key (see scripts/README.md)");
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("💥 Unhandled error:", error);
  process.exit(1);
});
