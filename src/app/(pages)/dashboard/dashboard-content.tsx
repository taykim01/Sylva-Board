"use client";

import { BaseContainer } from "@/components/base/base-container";
import { BaseBoard } from "@/components/base/base-board";
import { BaseList } from "@/components/base/base-list";
import { BaseBottomBar } from "@/components/base/base-bottom-bar";
import { BaseSideDrawer } from "@/components/base/base-side-drawer";
import { useDashboard } from "@/hooks/use-dashboard";
import { BaseNote } from "@/components/base/base-note";
import { BaseTextEditor, BaseTextEditorProps, BaseTextEditorRef } from "@/components/base/base-text-editor";
import { forwardRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { Tables } from "@/database.types";
import { useShareNote } from "@/hooks/use-share-note";
import Spinner from "@/components/common/spinner";
import { NoteViewer } from "@/components/notes/note-viewer";
import { useAuth } from "@/hooks/use-auth";
const DashboardTextEditor = forwardRef<BaseTextEditorRef, BaseTextEditorProps>((props, ref) => {
  return <BaseTextEditor {...props} ref={ref} />;
});

DashboardTextEditor.displayName = "DashboardTextEditor";

function DashboardNote(props: { data: Tables<"note"> }) {
  const { notes, selectNote, deleteNote, debounceUpdate, createEdge, currentNote, viewMode } = useDashboard();
  return (
    <BaseNote
      note={props.data}
      handle={viewMode === "board"}
      selectNote={selectNote}
      deleteNote={deleteNote}
      debounceUpdate={debounceUpdate}
      createEdge={createEdge}
      textEditorComponent={DashboardTextEditor}
      notes={notes}
      currentNote={currentNote}
    />
  );
}

export function DashboardContent() {
  const {
    notes,
    viewMode,
    createNote,
    moveNote,
    deleteNote,
    editNoteContent,
    currentNote,
    toggleViewMode,
    edges,
    createEdge,
    deleteEdge,
    debounceUpdate,
  } = useDashboard();

  const handleCreateNote = async () => {
    sendGAEvent("create_note");
    await createNote();
  };

  const { noteStatus, loading } = useShareNote();
  if (loading && noteStatus !== null)
    return (
      <BaseContainer
      className="relative"
      viewMode={viewMode as "board" | "list"}
      onToggleViewMode={toggleViewMode}
      accountName={"User"}
      showSignOutButton={true}
    >
        <Spinner />
      </BaseContainer>
    );

  const { user } = useAuth();

  if (noteStatus === "public" && !loading)
    return <NoteViewer currentNote={currentNote || null} textEditorComponent={DashboardTextEditor} />;

  return (
    <BaseContainer
      className="relative"
      viewMode={viewMode as "board" | "list"}
      onToggleViewMode={toggleViewMode}
      accountName={user.email || "User"}
      showSignOutButton={true}
    >
      <BaseBoard
        notes={notes}
        edges={edges}
        onMoveNote={moveNote}
        onCreateEdge={createEdge}
        onDeleteEdge={deleteEdge}
        nodeComponent={DashboardNote}
      />
      <BaseList notes={notes} viewMode={viewMode as "board" | "list"} noteComponent={DashboardNote} />
      <BaseSideDrawer
        currentNote={currentNote || null}
        onDeleteNote={deleteNote}
        onEditNoteContent={editNoteContent}
        redirectPath="/dashboard"
        textEditorComponent={DashboardTextEditor}
        notes={notes}
        debounceUpdate={debounceUpdate}
      />
      <BaseBottomBar onCreateNote={handleCreateNote} />
    </BaseContainer>
  );
}
