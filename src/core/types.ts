import { Tables } from "@/database.types";

export interface UserState {
  user: Tables<"user">;
  _setUser: (user: Tables<"user">) => void;
  _resetUser: () => void;
}

export interface NoteState {
  notes: Tables<"note">[];
  viewMode: "board" | "list";
  _setNotes: (notes: Tables<"note">[]) => void;
  _setViewMode: (viewMode: "board" | "list") => void;
  _addNote: (note: Tables<"note">) => void;
  _updateNote: (id: string, note: Partial<Tables<"note">>) => void;
  _deleteNote: (id: string) => void;
  _resetNotes: () => void;
}

export interface EdgeState {
  edges: Tables<"edge">[];
  _setEdges: (edges: Tables<"edge">[]) => void;
  _addEdge: (edge: Tables<"edge">) => void;
  _updateEdge: (id: string, edge: Partial<Tables<"edge">>) => void;
  _deleteEdge: (id: string) => void;
  _resetEdges: () => void;
}

export interface DemoStore {
  edges: Tables<"edge">[];
  _setEdges: (edges: Tables<"edge">[]) => void;
  _addEdge: (edge: Tables<"edge">) => void;
  _updateEdge: (id: string, edge: Partial<Tables<"edge">>) => void;
  _deleteEdge: (id: string) => void;
  _resetEdges: () => void;
  notes: Tables<"note">[];
  viewMode: "board" | "list";
  _setNotes: (notes: Tables<"note">[]) => void;
  _setViewMode: (viewMode: "board" | "list") => void;
  _addNote: (note: Tables<"note">) => void;
  _updateNote: (id: string, note: Partial<Tables<"note">>) => void;
  _deleteNote: (id: string) => void;
  _resetAll: () => void;
}

export interface Response<T> {
  data: T | null;
  error: string | null;
}

export interface NoteNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Tables<"note">;
}

export interface NoteNodeProps {
  data: Tables<"note">;
  isConnectable: boolean;
}
