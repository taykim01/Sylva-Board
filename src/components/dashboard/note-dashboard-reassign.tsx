"use client";

import { Tables } from "@/database.types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Move, LayoutDashboard } from "lucide-react";

interface NoteDashboardReassignProps {
  note: Tables<"note">;
  dashboards: Tables<"dashboard">[];
  currentDashboard: Tables<"dashboard"> | null;
  onReassign: (noteId: string, dashboardId: string) => Promise<void>;
  loading?: boolean;
}

export function NoteDashboardReassign({
  note,
  dashboards,
  currentDashboard,
  onReassign,
  loading = false,
}: NoteDashboardReassignProps) {
  // Filter out the current dashboard from the list
  const availableDashboards = dashboards.filter(d => d.id !== currentDashboard?.id);

  if (availableDashboards.length === 0) {
    return null; // Don't show if there are no other dashboards to move to
  }

  const handleReassign = async (dashboardId: string) => {
    await onReassign(note.id, dashboardId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <Move size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[180px]" align="end">
        <DropdownMenuGroup>
          {availableDashboards.map((dashboard) => (
            <DropdownMenuItem
              key={dashboard.id}
              onClick={() => handleReassign(dashboard.id)}
            >
              <LayoutDashboard size={14} className="mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{dashboard.title}</span>
                {dashboard.description && (
                  <span className="text-xs text-muted-foreground">
                    {dashboard.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}