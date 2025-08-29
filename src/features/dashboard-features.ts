"use server";

import { createClient } from "@/infrastructures/supabase/server";
import { Tables, TablesInsert } from "@/database.types";
import { handleGetUser } from "./auth-features";
import { Response } from "@/core/types";

export async function handleGetUserDashboards(): Promise<Response<Tables<"dashboard">[]>> {
  const supabase = await createClient();
  const { data: user, error: userError } = await handleGetUser();
  if (userError) {
    console.error("Error getting user dashboards:", userError);
    throw new Error(userError);
  }

  const { data: dashboards, error: dashboardsError } = await supabase
    .from("dashboard")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  if (dashboardsError) {
    console.error("Error getting user dashboards:", dashboardsError.message);
    throw new Error(dashboardsError.message);
  }

  return { data: dashboards as Tables<"dashboard">[], error: null };
}

export async function handleCreateDashboard(
  title: string,
  description?: string
): Promise<Response<Tables<"dashboard">>> {
  const supabase = await createClient();
  const { data: user, error: userError } = await handleGetUser();
  if (userError) {
    console.error("Error creating dashboard:", userError);
    throw new Error(userError);
  }

  const newDashboard: TablesInsert<"dashboard"> = {
    user_id: user!.id,
    title,
    description: description || null,
  };

  const { data: createdDashboard, error: dashboardError } = await supabase
    .from("dashboard")
    .insert(newDashboard)
    .select("*")
    .single();

  if (dashboardError) {
    console.error("Error creating dashboard:", dashboardError.message);
    throw new Error(dashboardError.message);
  }

  return { data: createdDashboard as Tables<"dashboard">, error: null };
}

export async function handleGetOrCreateDefaultDashboard(): Promise<Response<Tables<"dashboard">>> {
  const { data: dashboards, error: dashboardsError } = await handleGetUserDashboards();
  if (dashboardsError) {
    return { data: null, error: dashboardsError };
  }

  // Check if user already has dashboards
  if (dashboards && dashboards.length > 0) {
    // Find a dashboard titled "Default" or return the first one
    const defaultDashboard = dashboards.find(d => d.title === "Default") || dashboards[0];
    return { data: defaultDashboard, error: null };
  }

  // Create default dashboard if none exists
  return await handleCreateDashboard("Default", "Your default dashboard");
}

export async function handleReassignNote(
  noteId: string,
  dashboardId: string
): Promise<Response<Tables<"note">>> {
  const supabase = await createClient();
  
  const { data: updatedNote, error: noteError } = await supabase
    .from("note")
    .update({ dashboard_id: dashboardId })
    .eq("id", noteId)
    .select("*")
    .single();

  if (noteError) {
    console.error("Error reassigning note:", noteError.message);
    throw new Error(noteError.message);
  }

  return { data: updatedNote as Tables<"note">, error: null };
}

export async function handleGetDashboardNotes(dashboardId: string): Promise<Response<Tables<"note">[]>> {
  const supabase = await createClient();
  const { data: user, error: userError } = await handleGetUser();
  if (userError) {
    console.error("Error getting dashboard notes:", userError);
    throw new Error(userError);
  }

  const { data: notes, error: notesError } = await supabase
    .from("note")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("creator_id", user!.id);

  if (notesError) {
    console.error("Error getting dashboard notes:", notesError.message);
    throw new Error(notesError.message);
  }

  return { data: notes as Tables<"note">[], error: null };
}