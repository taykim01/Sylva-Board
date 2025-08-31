"use client";

import { Tables } from "@/database.types";
import { ChangeEvent, useEffect, useState, useRef, useCallback } from "react";
import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Handles } from "../notes/handles";
import Wrapper from "../notes/wrapper";
import { Position } from "@xyflow/react";
import { DebouncedFunc } from "lodash";
import { BaseTextEditorProps, BaseTextEditorRef } from "./base-text-editor";
import { NoteDashboardReassign } from "../dashboard/note-dashboard-reassign";
import { useTranslation } from "react-i18next";

const NOTE_COLORS = [
  "#f3f3f3", // light gray (was #ffffff)
  "#f7e9b0", // light yellow (was #fffbea)
  "#f7d6d6", // light red (was #fff5f5)
  "#dbe3fa", // light blue (was #f5f7ff)
  "#d6f7e6", // light green (was #f3fff7)
  "#f7d6e6", // light pink (was #fff5fa)
  "#f7e2c6", // light orange (was #fff7f0)
  "#e3e8ee", // light gray (was #f7fafd)
  "#f7f2b0", // light gold (was #fffde7)
  "#cbeaf7", // light sky (was #f0fbff)
];

function getContrastingColor(bg: string) {
  // Simple luminance check for contrast
  if (!bg) return "#222";
  const hex = bg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7 ? "#222" : "#fff";
}

type BaseNoteProps = {
  note: Tables<"note">;
  handle?: boolean;
  selectNote: (id: string) => void;
  deleteNote: (id: string) => Promise<void>;
  debounceUpdate: DebouncedFunc<(id: string, updates: Partial<Tables<"note">>) => Promise<void>>;
  createEdge: (
    sourceNoteId: string,
    targetNoteId: string,
    sourceHandle: Position,
    targetHandle: Position,
  ) => Promise<void>;
  textEditorComponent: React.ForwardRefExoticComponent<BaseTextEditorProps & React.RefAttributes<BaseTextEditorRef>>;
  notes: Tables<"note">[];
  currentNote: Tables<"note"> | undefined;
  // Dashboard reassignment props
  dashboards?: Tables<"dashboard">[];
  currentDashboard?: Tables<"dashboard"> | null;
  onReassignNote?: (noteId: string, dashboardId: string) => Promise<void>;
  isNew?: boolean;
};

export function BaseNote({
  note,
  handle,
  selectNote,
  deleteNote,
  debounceUpdate,
  createEdge,
  textEditorComponent: TextEditor,
  notes,
  currentNote,
  dashboards = [],
  currentDashboard,
  onReassignNote,
  isNew,
}: BaseNoteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [localColor, setLocalColor] = useState(note.color || "#f8fafc");
  const editorRef = useRef<{ editor: { commands: { focus: () => void } } }>(null);
  const { t } = useTranslation("common");

  const dateToLocaleString = new Date(note.created_at).toLocaleString("en-US", {
    dateStyle: "short",
  });

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    setLocalColor(note.color || "#f8fafc");
  }, [note.color]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debounceUpdate(note.id, { title: newTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.editor?.commands?.focus();
    }
  };

  const handleColorChange = useCallback(
    (color: string) => {
      setLocalColor(color); // Optimistic UI
      debounceUpdate(note.id, { color });
    },
    [note.id, debounceUpdate],
  );

  return (
    <div
      data-note-node
      onClick={() => selectNote(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex-shrink-0 w-full sm:w-[240px] h-[240px] border-t-4 p-3 pb-4 cursor-pointer shadow relative transition-all duration-500 ${
        isNew ? "animate-pulse-and-glow" : ""
      }`}
      style={{ backgroundColor: localColor, borderTopColor: getContrastingColor(localColor) }}
    >
      {handle && <Handles note={{ ...note, color: localColor }} isHovered={isHovered} createEdge={createEdge} />}
      <div className="flex flex-col gap-2 h-full">
        <div className="w-full flex justify-between items-center">
          <div className="text-m14 polymath" style={{ color: getContrastingColor(localColor) }}>
            Note
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Wrapper
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: getContrastingColor(localColor) + "22" }}
              >
                <Ellipsis size={20} className="" style={{ color: getContrastingColor(localColor) }} />
              </Wrapper>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                variant="destructive"
                onClick={async (e) => {
                  e.stopPropagation();
                  await deleteNote(note.id);
                }}
              >
                Delete
              </DropdownMenuItem>
              {onReassignNote && dashboards.length > 1 && (
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full">
                    <span>{t("notes.moveToDashboard")}</span>
                    <NoteDashboardReassign
                      note={note}
                      dashboards={dashboards}
                      currentDashboard={currentDashboard || null}
                      onReassign={onReassignNote}
                    />
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <div className="flex flex-col gap-2 items-start">
                  <span className="text-xs text-slate-500 mb-1 text-left">{t("notes.changeColor")}</span>
                  <div className="flex flex-wrap gap-1">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black hover:scale-110 hover:shadow-md ${
                          localColor === color
                            ? "border-black"
                            : color.startsWith("#f3")
                            ? "border-gray-300"
                            : "border-transparent"
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow: color.startsWith("#f3") ? "0 0 0 1px rgba(0,0,0,0.1)" : "none",
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-3 h-full nowheel overflow-scroll no-scrollbar">
          <input
            className="text-b18 text-slate-800 outline-none w-full polymath"
            placeholder={t("notes.newNote")}
            value={title || ""}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-grow relative">
            <TextEditor
              ref={editorRef}
              noteId={note.id}
              notes={notes}
              debounceUpdate={debounceUpdate}
              currentNote={currentNote}
              color={localColor}
            />
          </div>
        </div>
        <div className="text-r12 text-slate-500 flex justify-between">{dateToLocaleString}</div>
      </div>
    </div>
  );
}
