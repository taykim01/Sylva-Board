"use client";

import { Tables } from "@/database.types";
import { BaseTextEditorProps, BaseTextEditorRef } from "../base/base-text-editor";

export function NoteViewer({
  currentNote,
  textEditorComponent: TextEditor,
}: {
  currentNote: Tables<"note"> | null;
  textEditorComponent: React.ForwardRefExoticComponent<BaseTextEditorProps & React.RefAttributes<BaseTextEditorRef>>;
}) {
  const date = new Date(currentNote?.created_at || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`
        fixed bg-white border-t-8 border-slate-500
        ${currentNote ? "translate-y-[10%] sm:translate-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"}
        top-0 transition-all duration-500 ease-in-out sm:right-0 bottom-0 w-full sm:w-1/2 max-w-[720px] flex flex-col shadow-lg
      `}
      style={{
        zIndex: 50,
        visibility: currentNote ? "visible" : "hidden",
      }}
    >
      {currentNote && (
        <>
          <div className="px-5 sm:px-10 pt-8 sm:pt-12 border-b border-slate-200">
            <div className="flex justify-between">
              <input
                className="text-b18 sm:text-b32 text-slate-900 outline-none polymath"
                value={currentNote.title || ""}
                readOnly
                placeholder="New Note"
              />
            </div>
            <div className="flex gap-10 sm:gap-20 text-r12 sm:text-r14 pt-8 pb-7">
              <div className="text-slate-500">created at</div>
              <div className="text-slate-700">{date}</div>
            </div>
          </div>
          <div className="px-5 sm:px-10 pt-8 h-full overflow-scroll no-scrollbar" data-dropdown-menu>
            <TextEditor
              noteId={currentNote.id}
              isSideDrawer
              currentNote={currentNote}
            />
          </div>
        </>
      )}
    </div>
  );
}
