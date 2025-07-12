"use client";

import "../notes/text-editor.scss";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import SlashCommands from "../notes/slash-commands";
import { Tables } from "@/database.types";
import { DebouncedFunc } from "lodash";

export interface BaseTextEditorProps {
  noteId: string;
  isSideDrawer?: boolean;
  notes: Tables<"note">[];
  debounceUpdate: DebouncedFunc<
    (
      id: string,
      updates: Partial<{
        title: string;
        content: string;
      }>,
    ) => Promise<void>
  >;
  currentNote?: Tables<"note">;
  color?: string;
}

export interface BaseTextEditorRef {
  editor: {
    commands: {
      focus: () => void;
    };
  };
}

export const BaseTextEditor = forwardRef<BaseTextEditorRef, BaseTextEditorProps>((props, ref) => {
  const note = props.notes?.find((note) => note.id === props.noteId);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: props.isSideDrawer ? "Start typing..." : "",
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Highlight,
      SlashCommands,
    ],
    content: note?.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      props.debounceUpdate(props.noteId, { content });
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      editor: {
        commands: {
          focus: () => editor?.commands.focus(),
        },
      },
    }),
    [editor],
  );

  useEffect(() => {
    if (editor && note?.content !== editor.getHTML()) {
      editor.commands.setContent(note?.content || "");
    }
  }, [note?.content, editor]);

  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.setAttribute("data-editor-id", props.isSideDrawer ? "side-drawer" : "note");
      editorElement.setAttribute("data-is-drawer-open", props.currentNote ? "true" : "false");
    }
  }, [editor, props.isSideDrawer, props.currentNote]);

  return (
    <div className="notion-style-editor h-full" data-dropdown-menu style={{ backgroundColor: props.color || '#f8fafc' }}>
      <EditorContent
        editor={editor}
        className="prose max-w-none focus:outline-none cursor-text h-full"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
});

BaseTextEditor.displayName = "BaseTextEditor";
