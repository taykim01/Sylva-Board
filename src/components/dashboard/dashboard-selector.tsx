"use client";

import { Tables } from "@/database.types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { DashboardCreateDialog } from "./dashboard-create-dialog";

interface DashboardSelectorProps {
  currentDashboard: Tables<"dashboard"> | null;
  dashboards: Tables<"dashboard">[];
  onDashboardSelect: (dashboard: Tables<"dashboard">) => void;
  onDashboardCreate: (title: string, description?: string) => Promise<void>;
  loading?: boolean;
}

export function DashboardSelector({
  currentDashboard,
  dashboards,
  onDashboardSelect,
  onDashboardCreate,
  loading = false,
}: DashboardSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateDashboard = async (title: string, description?: string) => {
    await onDashboardCreate(title, description);
    setCreateDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="min-w-[160px] justify-between"
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span className="truncate">
                {currentDashboard?.title || "Select Dashboard"}
              </span>
            </div>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px]" align="start">
          <DropdownMenuGroup>
            {dashboards.map((dashboard) => (
              <DropdownMenuItem
                key={dashboard.id}
                onClick={() => onDashboardSelect(dashboard)}
                className={currentDashboard?.id === dashboard.id ? "bg-accent" : ""}
              >
                <div className="flex flex-col gap-1">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DashboardCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateDashboard={handleCreateDashboard}
      />
    </>
  );
}