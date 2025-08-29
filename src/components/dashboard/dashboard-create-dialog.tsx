"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DashboardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDashboard: (title: string, description?: string) => Promise<void>;
}

export function DashboardCreateDialog({
  open,
  onOpenChange,
  onCreateDashboard,
}: DashboardCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreateDashboard(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(value: string) => setTitle(value)}
                placeholder="Enter dashboard title..."
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(value: string) => setDescription(value)}
                placeholder="Enter dashboard description..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || loading}
            >
              {loading ? "Creating..." : "Create Dashboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}