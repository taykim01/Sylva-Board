import { create } from "zustand";
import { DashboardState } from "../types";

const useDashboardStore = create<DashboardState>()((set) => ({
  notes: [],
  viewMode: "board",
  currentDashboard: null,
  dashboards: [],
  _setNotes: (notes) => set({ notes: notes }),
  _setViewMode: (viewMode) => set({ viewMode }),
  _setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  _setDashboards: (dashboards) => set({ dashboards }),
  _addDashboard: (dashboard) => set((state) => ({ dashboards: [...state.dashboards, dashboard] })),
  _addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  _updateNote: (id, note) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...note } : n)),
    })),
  _deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
  _resetNotes: () => set({ notes: [] }),
  edges: [],
  _setEdges: (edges) => set({ edges: edges }),
  _addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  _updateEdge: (id, edge) =>
    set((state) => ({
      edges: state.edges.map((e) => (e.id === id ? { ...e, ...edge } : e)),
    })),
  _deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),
  _resetEdges: () => set({ edges: [] }),
}));

export default useDashboardStore;
