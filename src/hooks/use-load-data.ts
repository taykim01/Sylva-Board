"use client";

import { useDashboardStore } from "@/core/states";
import { handleGetEdges } from "@/features/edge-features";
import { handleGetMyNotes } from "@/features/note-features";
import { handleGetUserDashboards, handleGetOrCreateDefaultDashboard } from "@/features/dashboard-features";
import { useEffect, useState } from "react";

export function useLoadData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    _setNotes, 
    notes, 
    _setEdges, 
    edges, 
    currentDashboard,
    _setCurrentDashboard,
    _setDashboards,
    dashboards
  } = useDashboardStore();

  const readEdges = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleGetEdges();
      if (error) throw error;
      _setEdges(data!);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleGetUserDashboards();
      if (error) throw error;
      
      _setDashboards(data!);
      
      // Set current dashboard if not already set
      if (data!.length > 0 && !currentDashboard) {
        const defaultDashboard = data!.find(d => d.title === "Default") || data![0];
        _setCurrentDashboard(defaultDashboard);
        return defaultDashboard;
      } else if (data!.length === 0) {
        // Create default dashboard if none exists
        const { data: defaultDashboard, error: defaultError } = await handleGetOrCreateDefaultDashboard();
        if (defaultError) throw new Error(defaultError);
        
        _setDashboards([defaultDashboard!]);
        _setCurrentDashboard(defaultDashboard!);
        return defaultDashboard!;
      }
      
      return currentDashboard;
    } catch (error) {
      setError(error as string);
      alert(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const readMyNotes = async (dashboardId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await handleGetMyNotes(dashboardId);
      if (error) throw error;
      _setNotes(data!);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // First load dashboards and set current dashboard
      const activeDashboard = await loadDashboards();
      
      // Then load notes for the current dashboard
      if (activeDashboard) {
        await readMyNotes(activeDashboard.id);
      }
      
      // Load edges
      await readEdges();
    };

    initializeData();
  }, []);

  // Reload notes when current dashboard changes
  useEffect(() => {
    if (currentDashboard) {
      readMyNotes(currentDashboard.id);
    }
  }, [currentDashboard?.id]);

  return { loading, error, edges, notes, dashboards, currentDashboard };
}
