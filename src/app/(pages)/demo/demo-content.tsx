"use client";

import { BaseContainer } from "@/components/base/base-container";
import { BaseBoard } from "@/components/base/base-board";
import { BaseList } from "@/components/base/base-list";
import { BaseBottomBar } from "@/components/base/base-bottom-bar";
import { BaseSideDrawer } from "@/components/base/base-side-drawer";
import { useDemo } from "@/hooks/use-demo";
import { Tables } from "@/database.types";
import { BaseNote } from "@/components/base/base-note";
import { BaseTextEditor, BaseTextEditorProps, BaseTextEditorRef } from "@/components/base/base-text-editor";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

const DemoTextEditor = forwardRef<BaseTextEditorRef, BaseTextEditorProps>((props, ref) => {
  return <BaseTextEditor {...props} ref={ref} />;
});

DemoTextEditor.displayName = "DemoTextEditor";

function DemoNote(props: { data: Tables<"note"> }) {
  const { notes, selectNote, deleteNote, debounceUpdate, createEdge, currentNote, viewMode } = useDemo();
  return (
    <BaseNote
      note={props.data}
      handle={viewMode === "board"}
      selectNote={selectNote}
      deleteNote={deleteNote}
      debounceUpdate={debounceUpdate}
      createEdge={createEdge}
      textEditorComponent={DemoTextEditor}
      notes={notes}
      currentNote={currentNote}
    />
  );
}

export function DemoContent() {
  const { t } = useTranslation('common');
  const {
    notes,
    viewMode,
    edges,
    createNote,
    moveNote,
    deleteNote,
    editNoteContent,
    currentNote,
    toggleViewMode,
    createEdge,
    deleteEdge,
    debounceUpdate,
  } = useDemo();
  return (
    <BaseContainer
      className="relative"
      viewMode={viewMode ?? "board"}
      onToggleViewMode={toggleViewMode}
      accountName={t('demo.demoAccount')}
      showTryButton
    >
      <BaseBoard
        notes={notes}
        edges={edges}
        onMoveNote={moveNote}
        onCreateEdge={createEdge}
        onDeleteEdge={deleteEdge}
        nodeComponent={DemoNote}
      />
      <BaseList notes={notes} viewMode={viewMode} noteComponent={DemoNote} />
      <BaseSideDrawer
        currentNote={currentNote || null}
        onDeleteNote={deleteNote}
        onEditNoteContent={editNoteContent}
        redirectPath="/demo"
        textEditorComponent={DemoTextEditor}
        notes={notes}
        debounceUpdate={debounceUpdate}
      />
      <BaseBottomBar onCreateNote={createNote} />
    </BaseContainer>
  );
}
