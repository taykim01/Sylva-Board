"use server";

import { createClient } from "@/infrastructures/supabase/server";
import { Tables } from "@/database.types";
import { handleGetUser } from "./auth-features";
import { Response } from "@/core/types";
import { EMBEDDING_MODEL, openai } from "@/infrastructures/openai";

export async function handleCreateEmptyNote(dashboardId: string): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const { error } = await handleGetUser();
  if (error) {
    console.error("Error creating empty note:", error);
    throw new Error(error);
  }

  const newNote: Omit<Tables<"note">, "id" | "created_at"> = {
    title: "",
    content: "",
    x: 0,
    y: 0,
    color: "#ffffff",
    embedding: null,
    shareable: false,
    dashboard_id: dashboardId,
  };
  const { data: createdNote, error: noteError } = await supabase.from("note").insert(newNote).select("*").single();
  if (noteError) {
    console.error("Error creating empty note:", noteError.message);
    throw new Error(noteError.message);
  }

  return { data: createdNote as Tables<"note">, error: null };
}

export async function handleGetMyNotes(dashboardId?: string): Promise<Response<Tables<"note">[]>> {
  const supabase = await createClient();
  const { data, error } = await handleGetUser();
  if (error) {
    console.error("Error getting notes:", error);
    throw new Error(error);
  }

  if (!dashboardId) {
    const userId = data?.id;
    if(!userId) throw new Error("User not found");

    const myDashboards = await supabase.from("dashboard").select("*").eq("user_id", userId);
    if (myDashboards.error) {
      console.error("Error getting dashboards:", myDashboards.error.message);
      throw new Error(myDashboards.error.message);
    }

    const finalDashboardId = dashboardId || myDashboards.data[0]?.id;
    dashboardId = finalDashboardId;
  }

  const { data: notes, error: notesError } = await supabase.from("note").select("*").eq("dashboard_id", dashboardId);
  if (notesError) {
    console.error("Error getting notes:", notesError.message);
    throw new Error(notesError.message);
  }
  return { data: notes as Tables<"note">[], error: null };
}

export async function handleUpdateNote(
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    x: number;
    y: number;
    color: string;
  }>,
): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const { data: updatedNote, error: noteError } = await supabase
    .from("note")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (noteError) {
    console.error("Error updating note:", noteError.message);
    throw new Error(noteError.message);
  }

  const hasUpdate = updatedNote && (updates.title !== undefined || updates.content !== undefined);
  if (!hasUpdate) return { data: updatedNote as Tables<"note">, error: null };

  const combinedText = [updates.title?.trim() || "", updates.content?.trim() || ""].filter(Boolean).join("\n\n");
  if (!combinedText.trim()) throw new Error("Note has no content to embed");

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: combinedText.trim(),
  });

  if (!response.data[0]?.embedding) throw new Error("Failed to generate embedding");

  const embedding = response.data[0].embedding;
  const { error: updateError } = await supabase.from("note").update({ embedding }).eq("id", id);

  if (updateError) {
    console.error("Error updating note embedding:", updateError.message);
    throw new Error(updateError.message);
  }

  return { data: updatedNote as Tables<"note">, error: null };
}

export async function handleDeleteNote(id: string): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const { data: deletedNote, error: noteError } = await supabase
    .from("note")
    .delete()
    .eq("id", id)
    .select("*")
    .single();
  if (noteError) {
    console.error("Error deleting note:", noteError.message);
    throw new Error(noteError.message);
  }
  return { data: deletedNote as Tables<"note">, error: null };
}
