"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { ChevronsRight, TrashIcon } from "lucide-react";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import Wrapper from "../notes/wrapper";
import { BaseTextEditorProps, BaseTextEditorRef } from "./base-text-editor";
import { DebouncedFunc } from "lodash";

interface BaseSideDrawerProps {
  currentNote: Tables<"note"> | null;
  onDeleteNote: (id: string) => Promise<void>;
  onEditNoteContent: (id: string, updates: Partial<{ title: string; content: string }>) => Promise<void>;
  redirectPath: string;
  textEditorComponent: React.ForwardRefExoticComponent<BaseTextEditorProps & React.RefAttributes<BaseTextEditorRef>>;
  notes: Tables<"note">[];
  debounceUpdate: DebouncedFunc<(id: string, updates: Partial<Tables<"note">>) => Promise<void>>;
}

const NOTE_COLORS = [
  "#ffffff", // pure white
  "#fffbea", // very light yellow
  "#fff5f5", // very light red
  "#f5f7ff", // very light blue
  "#f3fff7", // very light green
  "#fff5fa", // very light pink
  "#fff7f0", // very light orange
  "#f7fafd", // very light gray
  "#fffde7", // very light gold
  "#f0fbff", // very light sky
];
function getContrastingColor(bg: string) {
  if (!bg) return "#222";
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7 ? "#222" : "#fff";
}

export function BaseSideDrawer({
  currentNote,
  onDeleteNote,
  redirectPath,
  textEditorComponent: TextEditor,
  notes,
  debounceUpdate,
  onEditNoteContent,
}: BaseSideDrawerProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<BaseTextEditorRef>(null);
  const { resetFocus } = useClickOutside({
    ref: divRef,
    redirectPath,
  });

  const [dialog, setDialog] = useState(false);
  const [localColor, setLocalColor] = useState(currentNote?.color || "#f8fafc");
  useEffect(() => {
    setLocalColor(currentNote?.color || "#f8fafc");
  }, [currentNote?.color]);
  const handleColorChange = useCallback(
    (color: string) => {
      if (!currentNote) return;
      setLocalColor(color); // Optimistic UI
      debounceUpdate(currentNote.id, { color });
    },
    [currentNote, debounceUpdate],
  );

  const date = new Date(currentNote?.created_at || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!currentNote) setDialog(false);
  }, [currentNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentNote) {
        resetFocus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentNote, resetFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.editor?.commands?.focus();
    }
  };

  return (
    <div
      ref={divRef}
      className={`
        fixed border-t-8 bg-white
        ${currentNote ? "translate-y-[10%] sm:translate-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"}
        top-0 transition-all duration-500 ease-in-out sm:right-0 bottom-0 w-full sm:w-1/2 max-w-[720px] flex flex-col shadow-lg
      `}
      style={{
        zIndex: 50,
        visibility: currentNote ? "visible" : "hidden",
        borderTopColor: getContrastingColor(localColor),
      }}
    >
      {currentNote && (
        <>
          <div className="sm:pr-10 sm:pl-4 sm:pt-3 flex items-center justify-between">
            <Wrapper
              onClick={resetFocus}
              className="hidden sm:block"
              style={{ backgroundColor: getContrastingColor(localColor) + "22" }}
            >
              <ChevronsRight className="" style={{ color: getContrastingColor(localColor) }} />
            </Wrapper>
          </div>
          <div className="px-5 sm:px-10 pt-8 sm:pt-12 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <input
                className="text-b18 sm:text-b32 outline-none polymath text-gray-800"
                value={currentNote.title || ""}
                onChange={async (e) => await onEditNoteContent(currentNote.id, { title: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="New Note"
              />
              <AlertDialog open={dialog} onOpenChange={setDialog}>
                <AlertDialogTrigger asChild>
                  <Wrapper style={{ backgroundColor: getContrastingColor(localColor) + "22" }}>
                    <TrashIcon size={20} style={{ color: getContrastingColor(localColor) }} />
                  </Wrapper>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ zIndex: 9999 }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from
                      our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialog(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onDeleteNote(currentNote.id);
                        setDialog(false);
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="text-r12 sm:text-r14 py-8 grid grid-cols-[1fr_5fr] gap-x-10 gap-y-5">
              <div className="text-slate-500">created at</div>
              <div className="text-slate-700">{date}</div>
              <div className="text-slate-500">color</div>
              <div className="flex flex-wrap gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`
                      w-6 h-6 rounded-full border-2 transition-transform duration-150
                      hover:scale-110 hover:shadow-md ${
                        localColor === color
                          ? "border-gray-500"
                          : color === "#ffffff"
                          ? "border-gray-300"
                          : "border-transparent"
                      }`}
                    style={{
                      backgroundColor: color,
                      boxShadow: color === "#ffffff" ? "0 0 0 1px rgba(0,0,0,0.1)" : "none",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(color);
                    }}
                    aria-label={`Set note color to ${color}`}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-10 py-8 flex-grow overflow-scroll no-scrollbar" data-dropdown-menu>
            <TextEditor
              ref={editorRef}
              noteId={currentNote.id}
              isSideDrawer
              notes={notes}
              debounceUpdate={debounceUpdate}
              currentNote={currentNote}
              color={localColor}
            />
          </div>
        </>
      )}
    </div>
  );
}
