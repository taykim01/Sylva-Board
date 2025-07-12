"use server";

import { createClient } from "@/infrastructures/supabase/server";
import { Tables } from "@/database.types";
import { handleGetUser } from "./auth-features";
import { Response } from "@/core/types";

export async function handleCreateEmptyNote(): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  const { data, error } = await handleGetUser();
  if (error) {
    console.error("Error creating empty note:", error);
    throw new Error(error);
  }
  const newNote: Omit<Tables<"note">, "id" | "created_at"> = {
    creator_id: data!.id,
    title: "",
    content: "",
    x: 0,
    y: 0,
    color: "#ffffff",
  };
  const { data: createdNote, error: noteError } = await supabase.from("note").insert(newNote).select("*").single();
  if (noteError) {
    console.error("Error creating empty note:", noteError.message);
    throw new Error(noteError.message);
  }
  return { data: createdNote as Tables<"note">, error: null };
}

export async function handleGetMyNotes(): Promise<Response<Tables<"note">[]>> {
  const supabase = await createClient();
  const { data, error } = await handleGetUser();
  if (error) {
    console.error("Error getting notes:", error);
    throw new Error(error);
  }
  const { data: notes, error: notesError } = await supabase.from("note").select("*").eq("creator_id", data!.id);
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
