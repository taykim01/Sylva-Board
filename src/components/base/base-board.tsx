"use client";

import { Position, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useBoardState } from "@/hooks/use-board-state";
import { Tables } from "@/database.types";
import { BaseBottomBar } from "./base-bottom-bar";
import { useCallback } from "react";

interface BaseBoardProps {
  notes: Tables<"note">[] | null;
  edges: Tables<"edge">[] | null;
  onMoveNote: (id: string, position: { x: number; y: number }) => Promise<void>;
  onCreateEdge: (
    sourceNoteId: string,
    targetNoteId: string,
    sourceHandle: Position,
    targetHandle: Position,
  ) => Promise<void>;
  onDeleteEdge: (id: string) => Promise<void>;
  onCreateNote: (position: { x: number; y: number }) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeComponent: React.ComponentType<any>;
}

const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: "#D0D5DD" },
};

function BoardContent({
  notes,
  edges,
  onMoveNote,
  onCreateEdge,
  onDeleteEdge,
  nodeComponent,
  onCreateNote,
}: BaseBoardProps) {
  const {
    nodes,
    flowEdges,
    mounted,
    onNodesChange,
    onNodeDragStop,
    onEdgesChange,
    onConnectStart,
    onConnectEnd,
    onConnect,
  } = useBoardState({
    notes,
    edges,
    onMoveNote,
    onCreateEdge,
    onDeleteEdge,
  });
  const { screenToFlowPosition } = useReactFlow();

  const handleCreateNote = useCallback(async () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });
    const position = {
      x: flowPosition.x - 120,
      y: flowPosition.y - 120,
    };
    await onCreateNote(position);
  }, [onCreateNote, screenToFlowPosition]);

  if (!mounted) {
    return <div style={{ width: "100%" }} className="h-[calc(100vh-40px)]" />;
  }

  return (
    <div style={{ width: "100%" }} className="h-[calc(100vh-40px)] relative">
      <ReactFlow
        style={{
          backgroundColor: "#FAFAFA",
          width: "100%",
          height: "100%",
        }}
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={{ note: nodeComponent }}
        edges={flowEdges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      />
      <BaseBottomBar onCreateNote={handleCreateNote} />
    </div>
  );
}

export function BaseBoard(props: BaseBoardProps) {
  return (
    <ReactFlowProvider>
      <BoardContent {...props} />
    </ReactFlowProvider>
  );
}
