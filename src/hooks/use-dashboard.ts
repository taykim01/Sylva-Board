"use client";

import { useDashboardStore } from "@/core/states";
import { Tables } from "@/database.types";
import { handleCreateEdge, handleUpdateEdge, handleDeleteEdge } from "@/features/edge-features";
import { handleCreateEmptyNote, handleDeleteNote, handleUpdateNote } from "@/features/note-features";
import { updateSettings } from "@/features/settings-features";
import { Position } from "@xyflow/react";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/core/states";

export function useDashboard() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id") as string | undefined;
  const {
    edges,
    notes,
    _addNote,
    _updateNote,
    _deleteNote,
    _addEdge,
    _updateEdge,
    _deleteEdge,
  } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { settings, _setSettings } = useSettingsStore();

  const createNote = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleCreateEmptyNote();
      if (error) throw error;
      _addNote(data!);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const moveNote = async (id: string, updates: { x: number; y: number }) => {
    setLoading(true);
    try {
      _updateNote(id, updates);
      const { error } = await handleUpdateNote(id, updates);
      if (error) throw error;
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await handleDeleteNote(id);
      if (error) throw error;
      _deleteNote(id);
      router.push("/dashboard");
      toast("Note deleted successfully");
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const editNoteContent = async (id: string, updates: Partial<{ title: string; content: string }>) => {
    _updateNote(id, updates);
    const debouncedUpdateNote = debounce(async (id: string, updates: Partial<{ title: string; content: string }>) => {
      try {
        const { error } = await handleUpdateNote(id, updates);
        if (error) throw error;
      } catch (error) {
        setError(error as string);
      }
    }, 500);
    debouncedUpdateNote(id, updates);
  };

  const debounceUpdate = useRef(
    debounce(async (id: string, updates: Partial<{ title: string; content: string }>) => {
      _updateNote(id, updates);
      try {
        const { error } = await handleUpdateNote(id, updates);
        if (error) throw error;
      } catch (error) {
        setError(error as string);
      }
    }, 300),
  ).current;

  const selectNote = (id: string) => {
    const prevNoteId = noteId;
    if (id === noteId) return;
    if (prevNoteId) {
      router.push("/dashboard");
      setTimeout(() => {
        router.push(`/dashboard?note_id=${id}`);
      }, 500);
    } else {
      router.push(`/dashboard?note_id=${id}`);
    }
  };

  const currentNote = notes?.find((note) => note.id === noteId);

  const toggleViewMode = async () => {
    const {data: newSettings} = await updateSettings(settings.id, { view: settings.view === "board" ? "list" : "board" });
    _setSettings(newSettings!);
  };

  const createEdge = async (
    sourceNoteId: string,
    targetNoteId: string,
    sourceHandle: Position,
    targetHandle: Position,
  ) => {
    setLoading(true);
    try {
      const { data, error } = await handleCreateEdge(sourceNoteId, targetNoteId, sourceHandle, targetHandle);
      if (error) throw error;
      _addEdge(data!);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const updateEdge = async (id: string, updates: Partial<Tables<"edge">>) => {
    setLoading(true);
    try {
      const { data, error } = await handleUpdateEdge(id, updates);
      if (error) throw error;
      _updateEdge(id, data!);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEdge = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await handleDeleteEdge(id);
      if (error) throw error;
      _deleteEdge(id);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    notes: notes?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    loading,
    error,
    createNote,
    moveNote,
    deleteNote,
    currentNote,
    editNoteContent,
    selectNote,
    debounceUpdate,
    toggleViewMode,
    viewMode: settings.view,
    createEdge,
    updateEdge,
    deleteEdge,
    edges,
  };
}
