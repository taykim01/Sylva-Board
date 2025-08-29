"use client";

import { BaseContainer } from "@/components/base/base-container";
import { BaseBoard } from "@/components/base/base-board";
import { BaseList } from "@/components/base/base-list";
import { BaseBottomBar } from "@/components/base/base-bottom-bar";
import { BaseSideDrawer } from "@/components/base/base-side-drawer";
import { AiChatbot } from "@/components/ai/ai-chatbot";
import { useDashboard } from "@/hooks/use-dashboard";
import { useDashboardManager } from "@/hooks/use-dashboard-manager";
import { BaseNote } from "@/components/base/base-note";
import { BaseTextEditor, BaseTextEditorProps, BaseTextEditorRef } from "@/components/base/base-text-editor";
import { forwardRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { Tables } from "@/database.types";
import useUserStore from "@/core/states/user.store";
const DashboardTextEditor = forwardRef<BaseTextEditorRef, BaseTextEditorProps>((props, ref) => {
  return <BaseTextEditor {...props} ref={ref} />;
});

DashboardTextEditor.displayName = "DashboardTextEditor";

function DashboardNote(props: { 
  data: Tables<"note">;
  dashboards?: Tables<"dashboard">[];
  currentDashboard?: Tables<"dashboard"> | null;
  onReassignNote?: (noteId: string, dashboardId: string) => Promise<void>;
}) {
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
      dashboards={props.dashboards}
      currentDashboard={props.currentDashboard}
      onReassignNote={props.onReassignNote}
    />
  );
}

export function DashboardContent({ userEmail }: { userEmail: string }) {
  const { user } = useUserStore();
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
    currentDashboard,
    dashboards,
    _setCurrentDashboard,
    _addDashboard,
  } = useDashboard();
  
  const {
    createDashboard,
    reassignNote,
    loading: dashboardLoading,
  } = useDashboardManager();

  const handleCreateNote = async () => {
    sendGAEvent("create_note");
    await createNote();
  };

  const handleDashboardSelect = (dashboard: Tables<"dashboard">) => {
    _setCurrentDashboard(dashboard);
  };

  const handleDashboardCreate = async (title: string, description?: string) => {
    const newDashboard = await createDashboard(title, description);
    _addDashboard(newDashboard);
    _setCurrentDashboard(newDashboard);
  };

  // Create a wrapper for reassignNote that doesn't return data
  const handleReassignNote = async (noteId: string, dashboardId: string) => {
    await reassignNote(noteId, dashboardId);
  };

  // Create a wrapped DashboardNote component with dashboard props
  const DashboardNoteWithProps = (props: { data: Tables<"note"> }) => (
    <DashboardNote
      data={props.data}
      dashboards={dashboards}
      currentDashboard={currentDashboard}
      onReassignNote={handleReassignNote}
    />
  );

  return (
    <BaseContainer
      className="relative"
      viewMode={viewMode as "board" | "list"}
      onToggleViewMode={toggleViewMode}
      accountName={userEmail}
      showSignOutButton={true}
      currentDashboard={currentDashboard}
      dashboards={dashboards}
      onDashboardSelect={handleDashboardSelect}
      onDashboardCreate={handleDashboardCreate}
      dashboardLoading={dashboardLoading}
    >
      <BaseBoard
        notes={notes}
        edges={edges}
        onMoveNote={moveNote}
        onCreateEdge={createEdge}
        onDeleteEdge={deleteEdge}
        nodeComponent={DashboardNoteWithProps}
      />
      <BaseList notes={notes} viewMode={viewMode as "board" | "list"} noteComponent={DashboardNoteWithProps} />
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
      {user?.id && <AiChatbot />}
    </BaseContainer>
  );
}
