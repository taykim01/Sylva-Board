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

const NOTE_COLORS = [
  "#ffffff", // white
  "#fef08a", // yellow
  "#fca5a5", // red
  "#a5b4fc", // blue
  "#6ee7b7", // green
  "#f9a8d4", // pink
  "#fdba74", // orange
  "#cbd5e1", // gray
  "#fcd34d", // gold
  "#38bdf8", // sky
];

type BaseNoteProps = {
  note: Tables<"note">;
  handle?: boolean;
  selectNote: (id: string) => void;
  deleteNote: (id: string) => Promise<void>;
  debounceUpdate: DebouncedFunc<
    (
      id: string,
      updates: Partial<Tables<"note">>,
    ) => Promise<void>
  >;
  createEdge: (
    sourceNoteId: string,
    targetNoteId: string,
    sourceHandle: Position,
    targetHandle: Position,
  ) => Promise<void>;
  textEditorComponent: React.ForwardRefExoticComponent<BaseTextEditorProps & React.RefAttributes<BaseTextEditorRef>>;
  notes: Tables<"note">[];
  currentNote: Tables<"note"> | undefined;
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
}: BaseNoteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [title, setTitle] = useState(note.title);
  const editorRef = useRef<{ editor: { commands: { focus: () => void } } }>(null);

  const dateToLocaleString = new Date(note.created_at).toLocaleString("en-US", {
    dateStyle: "short",
  });

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

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
      debounceUpdate(note.id, { color });
    },
    [note.id, debounceUpdate]
  );

  return (
    <div
      data-note-node
      onClick={() => selectNote(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-shrink-0 w-full sm:w-[240px] h-[240px] border-t-4 border-slate-500 p-3 pb-4 cursor-pointer shadow relative"
      style={{ backgroundColor: note.color || "#ffffff" }}
    >
      {handle && <Handles note={note} isHovered={isHovered} createEdge={createEdge} />}
      <div className="flex flex-col gap-2 h-full">
        <div className="w-full flex justify-between items-center">
          <div className="text-m14 text-slate-500 polymath">Note</div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Wrapper onClick={(e) => e.stopPropagation()}>
                <Ellipsis size={20} className="text-slate-300" />
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
              <DropdownMenuItem asChild>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-500 mb-1">Change color</span>
                  <div className="flex flex-wrap gap-1">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${note.color === color ? "border-black" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
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
            placeholder="New Note"
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
            />
          </div>
        </div>
        <div className="text-r12 text-slate-500 flex justify-between">{dateToLocaleString}</div>
      </div>
    </div>
  );
}
