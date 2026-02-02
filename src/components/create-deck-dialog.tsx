"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createDeck } from "@/actions/deck-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateDeckDialogProps {
  trigger?: React.ReactNode;
}

export function CreateDeckDialog({ trigger }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim() ?? "";
    const descriptionRaw = formData.get("description");
    const description =
      descriptionRaw === null || descriptionRaw === ""
        ? null
        : (descriptionRaw as string).trim() || null;

    if (!title) {
      setError("Title is required.");
      return;
    }

    setIsPending(true);
    try {
      await createDeck({ title, description });
      setOpen(false);
      form.reset();
      toast.success("Deck created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="gap-2">
            <Plus className="size-4" />
            Create New Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-deck-title">Title</Label>
            <Input
              id="create-deck-title"
              name="title"
              placeholder="Deck title"
              required
              maxLength={255}
              disabled={isPending}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-deck-description">Description (optional)</Label>
            <Textarea
              id="create-deck-description"
              name="description"
              placeholder="Brief description of this deck"
              maxLength={2000}
              disabled={isPending}
              rows={4}
              className="resize-none min-h-[80px] bg-background"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
