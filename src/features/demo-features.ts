"use server";

import { createClient } from "@/infrastructures/supabase/server";
import { Tables } from "@/database.types";
import { Response } from "@/core/types";
import { Position } from "@xyflow/react";

export async function handleDemoCreateEmptyNote(): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const newNote: Omit<Tables<"note">, "id" | "created_at"> = {
    creator_id: process.env.NEXT_PUBLIC_DEMO_ID!,
    title: "",
    content: "",
    x: 0,
    y: 0,
    color: "#ffffff",
  };
  const { data: createdNote, error: noteError } = await supabase.from("note").insert(newNote).select("*").single();
  if (noteError) {
    console.error("Error creating empty note:", noteError.message);
    return { data: null, error: noteError.message };
  }
  return { data: createdNote as Tables<"note">, error: null };
}

export async function handleDemoGetMyNotes(): Promise<Response<Tables<"note">[]>> {
  const supabase = await createClient();
  const { data: notes, error: notesError } = await supabase
    .from("note")
    .select("*")
    .eq("creator_id", process.env.NEXT_PUBLIC_DEMO_ID!);
  if (notesError) {
    console.error("Error getting notes:", notesError.message);
    return { data: null, error: notesError.message };
  }
  return { data: notes as Tables<"note">[], error: null };
}

export async function handleDemoUpdateNote(
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
    return { data: null, error: noteError.message };
  }
  return { data: updatedNote as Tables<"note">, error: null };
}

export async function handleDemoDeleteNote(id: string): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const { error } = await supabase.from("note").delete().eq("id", id);
  if (error) {
    console.error("Error deleting note:", error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

export async function handleDemoCreateEdge(
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

export async function handleDemoGetEdges(): Promise<Response<Tables<"edge">[]>> {
  const { data, error } = await handleDemoGetMyNotes();
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

export async function handleDemoUpdateEdge(id: string, updates: Partial<Tables<"edge">>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("edge").update(updates).eq("id", id).select().single();
  if (error) {
    console.error("Error updating edge:", error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Tables<"edge">, error: null };
}

export async function handleDemoDeleteEdge(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("edge").delete().eq("id", id);
  if (error) {
    console.error("Error deleting edge:", error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}
