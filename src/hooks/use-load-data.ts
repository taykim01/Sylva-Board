"use client";

import { useDashboardStore } from "@/core/states";
import { handleGetEdges } from "@/features/edge-features";
import { handleGetMyNotes } from "@/features/note-features";
import { useEffect, useState } from "react";
import { useShareNote } from "./use-share-note";

export function useLoadData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _setNotes, notes, _setEdges, edges } = useDashboardStore();

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

  const readMyNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await handleGetMyNotes();
      if (error) throw error;
      _setNotes(data!);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const { noteStatus, loading: shareLoading } = useShareNote();
  const readData = async () => {
    if(noteStatus === "public" || shareLoading) return;
    await readMyNotes();
    await readEdges();
  }

  useEffect(() => {
    readData()
  }, [noteStatus, shareLoading]);

  return { loading, error, edges, notes };
}
