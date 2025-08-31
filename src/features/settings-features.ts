"use server"

import { createClient } from "@/infrastructures/supabase/server";
import { Tables } from "@/database.types";

export async function updateSettings(id: string, newSettings: Partial<Tables<"settings">>){
    if (!id || id === "undefined" || id === "null") {
      const error = "Invalid settings ID provided";
      console.error("Error updating settings:", error);
      throw new Error(error);
    }

    const supabase = await createClient();
    const { data: updatedSettings, error: settingsError } = await supabase
      .from("settings")
      .update(newSettings)
      .eq("id", id)
      .select("*")
      .single();
    if (settingsError) {
      console.error("Error updating settings:", settingsError.message);
      throw new Error(settingsError.message);
    }
    return { data: updatedSettings as Tables<"settings">, error: null };
}

export async function getSettingsByUserId(userId: string) {
    const supabase = await createClient();
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (settingsError) {
      console.error("Error getting settings:", settingsError.message);
      return { data: null, error: settingsError.message };
    }
    return { data: settings as Tables<"settings">, error: null };
}

export async function updateUserLanguage(userId: string, language: string) {
    const supabase = await createClient();
    const { data: updatedSettings, error: settingsError } = await supabase
      .from("settings")
      .update({ language })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (settingsError) {
      console.error("Error updating language:", settingsError.message);
      return { data: null, error: settingsError.message };
    }
    return { data: updatedSettings as Tables<"settings">, error: null };
}