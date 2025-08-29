"use server";

import { createClient } from "@/infrastructures/supabase/server";
import { Tables } from "@/database.types";
import { Response } from "@/core/types";
import { handleGetMyNotes } from "./note-features";
import { Position } from "@xyflow/react";

export async function handleCreateEdge(
  sourceNoteId: string,
  targetNoteId: string,
  sourceHandle: Position,
  targetHandle: Position,
): Promise<Response<Tables<"edge">>> {
  const newEdge: Omit<Tables<"edge">, "id"> = {
    source_handle: sourceHandle,
    source_note_id: sourceNoteId,
    target_handle: targetHandle,
    target_note_id: targetNoteId,
  };
  const supabase = await createClient();
  const { data, error } = await supabase.from("edge").insert(newEdge).select().single();
  if (error) {
    console.error("Error creating edge:", error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Tables<"edge">, error: null };
}

export async function handleGetEdges(): Promise<Response<Tables<"edge">[]>> {
  const { data, error } = await handleGetMyNotes();
  if (error || !data) {
    console.error("Error getting edges:", error);
    return { data: null, error: error };
  }

  const supabase = await createClient();
  const notedIds = data.map((note) => note.id);

  const { data: edges, error: edgesError } = await supabase
    .from("edge")
    .select("*")
    .or(`source_note_id.in.(${notedIds.join(",")}),target_note_id.in.(${notedIds.join(",")})`);
  if (edgesError) {
    console.error("Error getting edges:", edgesError.message);
    return { data: null, error: edgesError.message };
  }
  return { data: edges as Tables<"edge">[], error: null };
}

export async function handleUpdateEdge(id: string, updates: Partial<Tables<"edge">>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("edge").update(updates).eq("id", id).select().single();
  if (error) {
    console.error("Error updating edge:", error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Tables<"edge">, error: null };
}

export async function handleDeleteEdge(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("edge").delete().eq("id", id);
  if (error) {
    console.error("Error deleting edge:", error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}
