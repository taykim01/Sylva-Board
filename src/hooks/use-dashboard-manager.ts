"use client";

import { Tables } from "@/database.types";
import { 
  handleGetUserDashboards, 
  handleCreateDashboard, 
  handleGetOrCreateDefaultDashboard,
  handleReassignNote,
  handleGetDashboardNotes
} from "@/features/dashboard-features";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useDashboardManager() {
  const [dashboards, setDashboards] = useState<Tables<"dashboard">[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Tables<"dashboard"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user dashboards
  const loadDashboards = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleGetUserDashboards();
      if (error) throw new Error(error);
      
      setDashboards(data!);
      
      // Set current dashboard to default or first available
      if (data!.length > 0 && !currentDashboard) {
        const defaultDashboard = data!.find(d => d.title === "Default") || data![0];
        setCurrentDashboard(defaultDashboard);
      }
    } catch (err) {
      setError(err as string);
      toast.error("Failed to load dashboards");
    } finally {
      setLoading(false);
    }
  };

  // Create a new dashboard
  const createDashboard = async (title: string, description?: string) => {
    setLoading(true);
    try {
      const { data, error } = await handleCreateDashboard(title, description);
      if (error) throw new Error(error);
      
      setDashboards(prev => [...prev, data!]);
      toast.success("Dashboard created successfully");
      return data!;
    } catch (err) {
      setError(err as string);
      toast.error("Failed to create dashboard");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get or create default dashboard
  const ensureDefaultDashboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleGetOrCreateDefaultDashboard();
      if (error) throw new Error(error);
      
      // Update dashboards list if we created a new one
      const exists = dashboards.find(d => d.id === data!.id);
      if (!exists) {
        setDashboards(prev => [data!, ...prev]);
      }
      
      if (!currentDashboard) {
        setCurrentDashboard(data!);
      }
      
      return data!;
    } catch (err) {
      setError(err as string);
      toast.error("Failed to create default dashboard");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different dashboard
  const switchDashboard = (dashboard: Tables<"dashboard">) => {
    setCurrentDashboard(dashboard);
    toast.success(`Switched to ${dashboard.title}`);
  };

  // Reassign a note to a different dashboard
  const reassignNote = async (noteId: string, dashboardId: string) => {
    try {
      const { data, error } = await handleReassignNote(noteId, dashboardId);
      if (error) throw new Error(error);
      
      const targetDashboard = dashboards.find(d => d.id === dashboardId);
      toast.success(`Note moved to ${targetDashboard?.title || "dashboard"}`);
      return data!;
    } catch (err) {
      setError(err as string);
      toast.error("Failed to reassign note");
      throw err;
    }
  };

  // Get notes for a specific dashboard
  const getDashboardNotes = async (dashboardId: string) => {
    try {
      const { data, error } = await handleGetDashboardNotes(dashboardId);
      if (error) throw new Error(error);
      return data!;
    } catch (err) {
      setError(err as string);
      toast.error("Failed to load dashboard notes");
      throw err;
    }
  };

  // Load dashboards on hook initialization
  useEffect(() => {
    loadDashboards();
  }, []);

  return {
    dashboards,
    currentDashboard,
    loading,
    error,
    loadDashboards,
    createDashboard,
    ensureDefaultDashboard,
    switchDashboard,
    reassignNote,
    getDashboardNotes,
    setCurrentDashboard,
  };
}