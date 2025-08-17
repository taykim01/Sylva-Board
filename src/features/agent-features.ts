"use server";

import { contextPrompt, queryClassificationPrompt } from "@/core/prompts";
import { Response } from "@/core/types";
import OpenAIService, { ChatCompletionParam } from "@/services/openai.service";
import SupabaseService from "@/services/supabase.service";
import { Tables } from "@/database.types";
import TABLES from "@/infrastructures/supabase/tables";
import { handleGetUser } from "./auth-features";

type QueryClassification = "note" | "general" | "search";

export async function handleGenerateResponse(query: string): Promise<Response<{
  response: string;
  sources?: Tables<"note">[];
}>> {
  const openAIService = new OpenAIService();
  const noteService = new SupabaseService<Tables<"note">>(TABLES.note);

  const classificationMessages: ChatCompletionParam[] = [
    { role: "system", content: queryClassificationPrompt },
    { role: "user", content: query },
  ];
  const chatCompletion = await openAIService.generateResponse(classificationMessages, "json_object", "gpt-4o-mini");
  const classification: QueryClassification = chatCompletion.classification;

  if (classification === "general" || classification === "search") {
    const answerMessage: ChatCompletionParam[] = [
      {
        role: "system",
        content: `
            ${contextPrompt}
            #ROLE#
            Answer the user's question to the best of your ability.
          `,
      },
      { role: "user", content: query },
    ];
    const answerResponse = await openAIService.generateResponse(answerMessage, "text", "gpt-5");
    return {
      data: answerResponse,
      error: null,
    };
  }

  if (classification === "note") {
    const user = await handleGetUser();
    const userId = user.data?.id;
    const queryVector = await openAIService.generateEmbedding(query, "text-embedding-3-large");
    const similarNotes: Tables<"note">[] = await noteService.getSimilarVector(queryVector, "query_note", 5, { creator: userId });
    if (similarNotes.length === 0) return {
        data: {
          response: "No relevant notes found.",
          sources: []
        },
        error: null,
      };

    const refinedNotes = similarNotes.map(note => ({
      title: note.title,
      content: note.content,
    }));

    const semanticMessages: ChatCompletionParam[] = [
      {
        role: "system",
        content: `
          ${contextPrompt}

          #ROLE#
          You are a helpful assistant that provides information about the user's notes.

          #GOAL#
          Respond to the user's query given the relevant notes.

          #RELEVANT NOTES#
          ${JSON.stringify(refinedNotes)}
        `,
      },
      {
        role: "user",
        content: query
      }
    ];
    const semanticResponse: string = await openAIService.generateResponse(semanticMessages, "text", "gpt-5");

    const filterResponseMessages: ChatCompletionParam[] = [
      {
        role: "system",
        content: `
          ${contextPrompt}
          You need to filter the relevant notes based on the user's query.
          The notes, to be filtered from, are as follows:
          ${JSON.stringify(similarNotes)}

          Return the id's of the relevant notes in the following json format:
          {"notes": [note1id, note2id, ...]}
        `
      },
      {
        role: "user",
        content: `The user's query is: ${query}`
      }
    ];
    const filterReferenceResponse = await openAIService.generateResponse(filterResponseMessages, "json_object", "gpt-4o-mini");
    const filteredReferences = filterReferenceResponse.notes || [];
    const actualReferences = similarNotes.filter(note => filteredReferences.includes(note.id));

    return {
      data: { response: semanticResponse, sources: actualReferences },
      error: null,
    };
  }
  
  return {
    data: {
      response: "I couldn't process your request. Please try again.",
      sources: []
    },
    error: null
  };
}
