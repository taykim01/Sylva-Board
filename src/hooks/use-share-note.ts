"use client";

import { useDashboardStore } from "@/core/states";
import { handleGetUser } from "@/features/auth-features";
import { handleReadSingleNote, handleToggleShareable } from "@/features/note-features";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type NoteStatus = "mine" | "public" | "restricted" | null;

export function useShareNote() {
  const { notes, _updateNote } = useDashboardStore();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note_id") as string;
  const currentNote = notes.find((note) => note.id === noteId);
  const router = useRouter();

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

  const [loading, setLoading] = useState(true);
  const [noteStatus, setNoteStatus] = useState<NoteStatus>(null);

  const checkShareable = async (): Promise<NoteStatus> => {
    setLoading(true);
    if (!noteId) {
      setLoading(false);
      return null;
    }
    const { data: user } = await handleGetUser();
    const { data } = await handleReadSingleNote(noteId);
    if (data?.creator_id === user?.id) {
      setLoading(false);
      setNoteStatus("mine");
      return "mine";
    } else if (!user && noteId) {
      setLoading(false);
      const status = data?.shareable ? "public" : "restricted";
      setNoteStatus(status);
      return status;
    }
    setNoteStatus("restricted");
    setLoading(false);
    alert("This note is not public.");
    router.push("/sign-in");
    return "restricted";
  };
  // TODO: 여기에 권한 없는 노트에 접근했을 때 핸들링 안 된 에러 뜸
  // TODO: public 노트에 접근했을 때 아무것도 안 뜸

  useEffect(() => {
    checkShareable();
  }, [noteId]);

  return { isShareable, toggleShareable, noteStatus, loading };
}
