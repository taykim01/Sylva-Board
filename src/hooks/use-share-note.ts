"use client";

import { useDashboardStore } from "@/core/states";
import { handleToggleShareable } from "@/features/note-features";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useShareNote() {
  const { notes, _updateNote } = useDashboardStore();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id") as string;
  const currentNote = notes.find((note) => note.id === noteId);

  const toggleShareable = async (toggle: boolean) => {
    if (!noteId) {
      console.error("Note ID is required to toggle shareable status.");
      return;
    }
    const { data, error } = await handleToggleShareable(noteId, toggle);
    if (error || !data) {
      console.error("Error toggling shareable status:", error);
      return;
    }
    _updateNote(noteId, data);
    if (data.shareable === true) {
      toast(`"${currentNote?.title}" is now public.`, {
        description: "Anyone with the link can view this note.",
        action: {
          label: "Copy Link",
          onClick: () => {
            navigator.clipboard.writeText(`${window.location.origin}/dashboard?note_id=${data.id}`);
            toast("Link copied to clipboard!");
          },
        },
      });
    }
  };

  const isShareable = currentNote?.shareable || false;

  return { isShareable, toggleShareable };
}
