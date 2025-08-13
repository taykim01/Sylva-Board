#!/usr/bin/env tsx

/**
 * Script to populate missing embeddings for existing notes
 * This script should be run after the embedding feature is deployed
 */

import { createClient } from "@supabase/supabase-js";
import { generateNoteEmbedding } from "../src/infrastructures/openai/services";
import type { Database } from "../src/database.types";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function populateMissingEmbeddings() {
  try {
    console.log("🔍 Finding notes with missing embeddings...");

    // Get all notes without embeddings
    const { data: notes, error: fetchError } = await supabase
      .from("note")
      .select("id, title, content, creator_id")
      .is("embedding", null);

    if (fetchError) {
      throw new Error(`Failed to fetch notes: ${fetchError.message}`);
    }

    if (!notes || notes.length === 0) {
      console.log("✅ No notes with missing embeddings found");
      return;
    }

    console.log(`📝 Found ${notes.length} notes with missing embeddings`);

    let processed = 0;
    let success = 0;
    const errors: string[] = [];

    // Process notes in batches to avoid rate limits
    const batchSize = 5;

    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(notes.length / batchSize)}`);

      const batchPromises = batch.map(async (note) => {
        try {
          processed++;

          // Skip notes with empty title and content
          if (!note.title.trim() && !note.content.trim()) {
            console.log(`⏭️  Skipping empty note ${note.id}`);
            return;
          }

          // Generate embedding
          const { embedding, error: embeddingError } = await generateNoteEmbedding(note);

          if (embeddingError || embedding.length === 0) {
            throw new Error(embeddingError || "Failed to generate embedding");
          }

          // Store embedding in database
          const { error: updateError } = await supabase
            .from("note")
            .update({ embedding: JSON.stringify(embedding) })
            .eq("id", note.id);

          if (updateError) {
            throw new Error(`Failed to store embedding: ${updateError.message}`);
          }

          success++;
          console.log(`✅ Generated embedding for note: ${note.title || "Untitled"} (${note.id})`);
        } catch (error) {
          const errorMessage = `Note ${note.title || note.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          errors.push(errorMessage);
          console.error(`❌ ${errorMessage}`);
        }
      });

      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < notes.length) {
        console.log("⏳ Waiting 2 seconds before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log(`📝 Total notes processed: ${processed}`);
    console.log(`✅ Successfully generated embeddings: ${success}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n🚨 Error details:");
      errors.forEach((error) => console.log(`  - ${error}`));
    }
  } catch (error) {
    console.error("💥 Script failed:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

// Run the script
populateMissingEmbeddings()
  .then(() => {
    console.log("\n🎉 Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
