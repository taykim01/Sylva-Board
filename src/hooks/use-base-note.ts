import { Tables } from "@/database.types";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface BaseNoteStore {
  notes: Tables<"note">[] | null;
  viewMode: "board" | "list";
  _addNote: (note: Tables<"note">) => void;
  _updateNote: (id: string, updates: Partial<Tables<"note">>) => void;
  _deleteNote: (id: string) => void;
  _setViewMode: (mode: "board" | "list") => void;
}

export interface BaseNoteOperations {
  createNote: () => Promise<void>;
  moveNote: (id: string, updates: Partial<{ title: string; content: string; x: number; y: number }>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Tables<"note">>) => Promise<void>;
}

export function useBaseNote(store: BaseNoteStore, operations: BaseNoteOperations, basePath: string) {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id") as string | undefined;
  const { notes, viewMode, _updateNote, _deleteNote, _setViewMode } = store;
  const {
    createNote: createNoteOp,
    moveNote: moveNoteOp,
    deleteNote: deleteNoteOp,
    updateNote: updateNoteOp,
  } = operations;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createNote = async () => {
    setLoading(true);
    try {
      await createNoteOp();
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const moveNote = async (id: string, updates: Partial<{ title: string; content: string; x: number; y: number }>) => {
    setLoading(true);
    try {
      await moveNoteOp(id, updates);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      await deleteNoteOp(id);
      _deleteNote(id);
      router.push(basePath);
      toast("Note deleted successfully");
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const editNoteContent = async (id: string, updates: Partial<Tables<"note">>) => {
    _updateNote(id, updates);
    const debouncedUpdateNote = debounce(async (id: string, updates: Partial<Tables<"note">>) => {
      try {
        await updateNoteOp(id, updates);
      } catch (error) {
        setError(error as string);
      }
    }, 500);
    debouncedUpdateNote(id, updates);
  };

  const debounceUpdate = useRef(
    debounce(async (id: string, updates: Partial<Tables<"note">>) => {
      _updateNote(id, updates);
      try {
        await updateNoteOp(id, updates);
      } catch (error) {
        setError(error as string);
      }
    }, 300),
  ).current;

  const selectNote = (id: string) => {
    const prevNoteId = noteId;
    if (id === noteId) return;
    if (prevNoteId) {
      router.push(basePath);
      setTimeout(() => {
        router.push(`${basePath}?note_id=${id}`);
      }, 500);
    } else {
      router.push(`${basePath}?note_id=${id}`);
    }
  };

  const currentNote = notes?.find((note) => note.id === noteId);

  const toggleViewMode = () => {
    _setViewMode(viewMode === "board" ? "list" : "board");
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
    viewMode,
  };
}
