# Embedding Generation Scripts

This directory contains scripts for generating and managing embeddings for notes in your Supabase database.

## Scripts

### 1. `generate-embeddings.ts` (Legacy)

The original embedding generation script.

### 2. `generate-embeddings-client.ts`

Client-side embedding generation script.

### 3. `populate-missing-embeddings.ts`

Script to populate embeddings for existing notes that don't have them.

### 4. `regenerate-all-embeddings.ts` ⭐ **NEW**

**Script to regenerate ALL embeddings when the model is changed.**

## Prerequisites

1. **Get your Supabase Service Role Key:**

   - Go to your Supabase dashboard: https://supabase.com/dashboard/project/jkirbzkehlexsbaejorl
   - Navigate to Settings > API
   - Copy the `service_role` key (not the `anon` key)
   - Add it to your `.env` file as `SUPABASE_SERVICE_ROLE_KEY=your_service_key_here`

2. **Ensure you have the required environment variables in `.env`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jkirbzkehlexsbaejorl.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
   OPENAI_API_KEY=sk-proj-...
   ```

## Usage

### When Embedding Model Changes: Regenerate All Embeddings ⚠️

Run this script when you've changed the embedding model and need to regenerate ALL embeddings:

```bash
npm run regenerate-embeddings
```

**⚠️ Warning:** This will regenerate ALL embeddings in your database and consume API credits for every note!

### For Production: Populate Missing Embeddings

Run this script to generate embeddings for all existing notes that don't have them:

```bash
npm run populate-embeddings
```

### Legacy Scripts

```bash
# Original script
npm run generate-embeddings

# Client-side script
npm run generate-embeddings-client
```

## What the scripts do

### populate-missing-embeddings script

1. **Finds all notes** without embeddings in your database
2. **Skips empty notes** (notes with no title and no content)
3. **Generates embeddings** using the current embedding model
4. **Combines title and content** with proper formatting for better semantic context
5. **Processes notes in batches** to avoid API rate limits (5 notes per batch)
6. **Updates the database** with the generated embeddings
7. **Provides detailed progress feedback** and error reporting
8. **Graceful error handling** - continues processing other notes if one fails

### regenerate-all-embeddings script ⚠️

1. **Processes ALL notes** in your database (not just missing embeddings)
2. **Replaces existing embeddings** with new ones generated using the current model
3. **Skips empty notes** (notes with no title and no content)
4. **Shows a 5-second warning** before starting (gives you time to cancel)
5. **Processes notes in batches** to avoid API rate limits (5 notes per batch)
6. **Comprehensive reporting** of success, skipped, and failed notes
7. **Use when:** You've changed embedding models and need to update all existing embeddings

## Automatic Embedding Generation

The application now automatically generates embeddings for:

- **New notes** when they are created
- **Updated notes** when title or content is modified
- **Missing embeddings** when users log into the dashboard (background process)

## Rate Limiting

Both scripts include built-in rate limiting:

- Processes notes in batches of 5
- 2 second delay between batches
- This should stay well within OpenAI's rate limits

## Cost Estimation

The text-embedding-3-small model is very cost-effective. For typical notes:

- Short note (50 words): ~$0.000001
- Medium note (200 words): ~$0.000004
- Long note (500 words): ~$0.00001

For 1000 notes, expect to pay around $0.01-$0.05.

## Troubleshooting

- **Missing service key**: You need the `service_role` key from Supabase, not the `anon` key
- **Rate limit errors**: The script has built-in delays, but you can increase them in the script
- **OpenAI errors**: Check that your API key is valid and has sufficient credits
- **Database errors**: Ensure the `embedding` column exists in your `note` table
