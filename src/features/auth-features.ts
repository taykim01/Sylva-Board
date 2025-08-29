"use server";

import { User } from "./../../node_modules/@supabase/auth-js/dist/module/lib/types.d";
import { createClient } from "@/infrastructures/supabase/server";
import { Response } from "@/core/types";
import { Tables } from "@/database.types";

export async function handleSignIn(email: string, password: string): Promise<Response<
  { user: Tables<"user">; settings: Tables<"settings"> } | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    const isInvalidCredentials = error.message.includes("Invalid login credentials");
    console.error("Error signing in:", error.message);
    if (isInvalidCredentials) return { data: null, error: "Invalid email or password" };
    else return { data: null, error: error.message };
  }
  const userId = data?.user?.id;
  if (!userId) {
    console.error("Error signing in: User ID not found");
    return { data: null, error: "User ID not found" };
  }

  const { data: userData, error: userError } = await supabase.from("user").select("*").eq("id", userId).single();
  if (userError || !userData) {
    console.error("Error getting user data:", userError?.message || "User not found");
    return { data: null, error: userError?.message || "User not found" };
  }

  const { data: settingsData, error: settingsError } = await supabase.from("settings").select("*").eq("user_id", userId).single();
  if(settingsError || !settingsData) {
    const errMsg = settingsError?.message || "Settings not found";
    console.error("Error getting settings data:", errMsg);
    return { data: null, error: errMsg };
  }

  return { data: {user: userData as Tables<"user">, settings: settingsData as Tables<"settings">}, error: null };
}

export async function handleSignUp(
  email: string,
  password: string,
): Promise<Response<{ user: Tables<"user">; dashboard: Tables<"dashboard">; notes: Tables<"note">[]; edges: Tables<"edge">[], settings: Tables<"settings"> } | null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    const isEmailTaken = error.message.includes("unique constraint");
    console.error("Error signing up:", error.message);
    if (isEmailTaken) return { data: null, error: "Email is already taken" };
    else return { data: null, error: error.message };
  }
  const userId = user?.id;
  if (!userId) {
    console.error("Error signing up: User ID not found");
    return { data: null, error: "User ID not found" };
  }

  const newUser: Omit<Tables<"user">, "created_at"> = {
    id: userId,
    email,
    push_subscription: null,
  };
  const { data: createdUser, error: userError } = await supabase.from("user").insert(newUser).select("*").single();
  if (userError) {
    console.error("Error creating user:", userError.message);
    return { data: null, error: userError.message };
  }

  // Create default dashboard
  const defaultDashboard: Omit<Tables<"dashboard">, "id" | "created_at"> = {
    user_id: userId,
    title: "My First Dashboard",
    description: "Welcome to your first dashboard!"
  };
  const { data: createdDashboard, error: dashboardError } = await supabase.from("dashboard").insert(defaultDashboard).select("*").single();
  if (dashboardError) {
    console.error("Error creating default dashboard:", dashboardError.message);
    return { data: null, error: dashboardError.message };
  }

  const dashboardId = createdDashboard.id;

  const defaultNotes: Omit<Tables<"note">, "id" | "created_at">[] = [
    {
      dashboard_id: dashboardId,
      title: "Welcome to Sylva!",
      content: "<p>Sylva is a note-taking app that allows you to create and manage notes.</p>",
      x: -450,
      y: -150,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Create a note",
      content: "<p>Create a note by clicking the + button.</p>",
      x: -850,
      y: 270,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Writing notes",
      content: "<p>Use <strong><em><mark>markdown</mark></em></strong> to format your notes.</p>",
      x: -550,
      y: 270,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Connect notes",
      content: "<p>Connect two notes by dragging from one note...</p>",
      x: -100,
      y: 100,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Connect notes",
      content: "<p>to another note.</p>",
      x: 270,
      y: 300,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Delete notes",
      content: "<p>Delete a note by clicking the trash can icon or the ellipses button.</p>",
      x: -350,
      y: 650,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
    {
      dashboard_id: dashboardId,
      title: "Have fun!",
      content: "<p></p>",
      x: 0,
      y: 650,
      color: "#ffffff",
      embedding: null,
      shareable: false,
    },
  ];
  const { data: createdNotes, error: noteError } = await supabase.from("note").insert(defaultNotes).select("*");
  if (noteError) {
    console.error("Error creating default notes:", noteError.message);
    return { data: null, error: noteError.message };
  }

  const defaultEdge: Omit<Tables<"edge">, "id"> = {
    source_handle: "node-right",
    source_note_id: createdNotes.find(
      (note) => note.content === "<p>Connect two notes by dragging from one note...</p>",
    )?.id,
    target_handle: "node-target-left",
    target_note_id: createdNotes.find((note) => note.content === "<p>to another note.</p>")?.id,
  };
  const { data: createdEdge, error: edgeError } = await supabase.from("edge").insert(defaultEdge).select("*").single();
  if (edgeError) {
    console.error("Error creating default edge:", edgeError.message);
    return { data: null, error: edgeError.message };
  }

  const defaultSettings: Omit<Tables<"settings">, "id"> = {
    user_id: userId,
    view: "board",
  };
  const { data: createdSettings, error: settingsError } = await supabase
    .from("settings")
    .insert(defaultSettings)
    .select("*")
    .single();

    if(settingsError) {
    console.error("Error creating default settings:", settingsError.message);
    return { data: null, error: settingsError.message };
  }

  return {
    data: {
      user: createdUser as Tables<"user">,
      dashboard: createdDashboard as Tables<"dashboard">,
      notes: createdNotes as Tables<"note">[],
      edges: [createdEdge as Tables<"edge">],
      settings: createdSettings as Tables<"settings">,
    },
    error: null,
  };
}

export async function handleSignOut(): Promise<Response<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

export async function handleGetUser(): Promise<Response<User>> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const userData = user?.user;
  if (!userData) {
    return { data: null, error: "User not found" };
  }
  return { data: userData, error: null };
}
