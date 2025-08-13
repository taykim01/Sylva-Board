---
applyTo: '**'
---

# Overview
* This is an instruction file to provide a guidance on how to update this product.
* You have no restraints and are free to read and modify any file whatsoever.

# Update Overview
* This update adds a feature: a chatbot.
* With this feature, users will be able to interact with their notes in a conversational manner, making it easier to retrieve and manage information.
* The chatbot will utilize the OpenAI API to process user queries and generate responses based on the content of the user's notes.

## Feature Details
* To create a high-quality chatbot, this update introduces the following changes:
1. Use RAG (Retrieval-Augmented Generation) techniques to improve response accuracy and relevance. For this, an "embedding" column will be added to the "notes" table in Supabase as a vector representation of the note content.
2. Integrate the OpenAI API to handle user queries, convert note contents to embeddings, and generate responses based on the context of the notes.
3. Use prompt chaining to deconstruct the user's prompt into segments that makes the AI agent more effective in understanding and responding to complex queries.
4. Implement a context management system to maintain the state of the conversation and provide relevant information to the AI agent.
5. Use advanced RAG techniques, including pre-retrieval optimization and post-retrieval processing.
6. Implement a feedback loop where user interactions with the chatbot are logged and analyzed to continuously improve the model's performance and relevance.
7. The chatbot should show the sources of the generated response.
* The OpenAI API key is in OPENAI_API_KEY in .env file.

## Design Representation
* The chatbot should be collapsible and floating at the bottom, right corner. To avoid interfering with the "Create Note" button, move the "Create Note" button somewhere else that doesn't feel awkward.
* The chatbot interface should be user-friendly and intuitive, allowing users to easily interact with their notes.
* The chatbot UI should comply with the existing design system.

## Supabase Extension
* The following is the code used to enable Supabase vector:
```
create or replace function query_note (
  query_embedding vector(512),
  match_threshold float,
  match_count int,
)
returns setof "note"
language sql
as $$
  select *
  from "note"
  where "note".embedding <#> query_embedding < 1 - match_threshold
  order by "note".embedding <#> query_embedding asc
  limit least(match_count, 200);
$$;
```
use it for reference when building the update.