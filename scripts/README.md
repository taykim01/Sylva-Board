# Embedding Generation Script

This script generates embeddings for all existing notes in your Supabase database.

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

Run the script to generate embeddings for all notes that don't have them:

```bash
npm run generate-embeddings
```

## What it does

1. **Fetches all notes** without embeddings from your database
2. **Generates embeddings** for each note using OpenAI's text-embedding-ada-002 model
3. **Combines title and content** for better context in embeddings  
4. **Processes notes in batches** to avoid rate limits
5. **Updates the database** with the generated embeddings
6. **Provides progress feedback** and error handling

## Rate Limiting

The script includes built-in rate limiting:
- Processes notes in batches of 10
- 200ms delay between individual requests
- 1000ms delay between batches
- This should stay well within OpenAI's rate limits

## Cost Estimation

The text-embedding-ada-002 model costs $0.0001 per 1K tokens. For typical notes:
- Short note (50 words): ~$0.000005
- Medium note (200 words): ~$0.00002  
- Long note (500 words): ~$0.00005

For 1000 notes, expect to pay around $0.01-$0.05.

## Troubleshooting

- **Missing service key**: You need the `service_role` key from Supabase, not the `anon` key
- **Rate limit errors**: The script has built-in delays, but you can increase them in the script
- **OpenAI errors**: Check that your API key is valid and has sufficient credits
- **Database errors**: Ensure the `embedding` column exists in your `note` table