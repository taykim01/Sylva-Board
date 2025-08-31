"use client";

import useDemoStore from "@/core/states/demo.store";
import { Tables } from "@/database.types";
import {
  handleDemoCreateEdge,
  handleDemoGetEdges,
  handleDemoUpdateEdge,
  handleDemoDeleteEdge,
  handleDemoCreateEmptyNote,
  handleDemoDeleteNote,
  handleDemoGetMyNotes,
  handleDemoUpdateNote,
} from "@/features/demo-features";
import { Position } from "@xyflow/react";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function useDemo() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id") as string | undefined;
  const {
    notes,
    viewMode,
    _setNotes,
    _addNote,
    _updateNote,
    _deleteNote,
    _setViewMode,
    edges,
    _setEdges,
    _addEdge,
    _updateEdge,
    _deleteEdge,
  } = useDemoStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createEdge = async (
    sourceNoteId: string,
    targetNoteId: string,
    sourceHandle: Position,
    targetHandle: Position,
  ) => {
    setLoading(true);
    try {
      const { data, error } = await handleDemoCreateEdge(sourceNoteId, targetNoteId, sourceHandle, targetHandle);
      if (error) throw error;
      _addEdge(data!);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const readEdges = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleDemoGetEdges();
      if (error) throw error;
      _setEdges(data!);
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
      const { data, error } = await handleDemoUpdateEdge(id, updates);
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
      const { error } = await handleDemoDeleteEdge(id);
      if (error) throw error;
      _deleteEdge(id);
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  const createNote = async (position?: { x: number; y: number }) => {
    setLoading(true);
    try {
      const { data, error } = await handleDemoCreateEmptyNote(position);
      if (error) throw error;
      _addNote(data!);
      setNewNoteId(data!.id);
      setTimeout(() => setNewNoteId(null), 1000); // Highlight for 1 second
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const readMyNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleDemoGetMyNotes();
      if (error) throw error;
      _setNotes(data!);
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
      const { error } = await handleDemoUpdateNote(id, updates);
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
      const { error } = await handleDemoDeleteNote(id);
      if (error) throw error;
      _deleteNote(id);
      router.push("/demo");
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
        const { error } = await handleDemoUpdateNote(id, updates);
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
        const { error } = await handleDemoUpdateNote(id, updates);
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
      router.push("/demo");
      setTimeout(() => {
        router.push(`/demo?note_id=${id}`);
      }, 500);
    } else {
      router.push(`/demo?note_id=${id}`);
    }
  };

  const currentNote = notes?.find((note) => note.id === noteId);

  const toggleViewMode = () => {
    _setViewMode(viewMode === "board" ? "list" : "board");
  };

  const sortedNotes = notes?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    notes: sortedNotes,
    loading,
    error,
    createNote,
    readMyNotes,
    moveNote,
    deleteNote,
    currentNote,
    editNoteContent,
    selectNote,
    debounceUpdate,
    toggleViewMode,
    viewMode,
    edges,
    createEdge,
    updateEdge,
    deleteEdge,
    readEdges,
    newNoteId,
  };
}
