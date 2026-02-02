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
import { updateDeck } from "@/actions/deck-actions";
import { Pencil } from "lucide-react";

interface EditDeckDialogProps {
  deck: {
    id: number;
    title: string;
    description: string | null;
  };
  trigger?: React.ReactNode;
}

export function EditDeckDialog({ deck, trigger }: EditDeckDialogProps) {
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
      await updateDeck({ deckId: deck.id, title, description });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deck.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="lg" type="button" className="gap-2">
            <Pencil className="size-4" />
            Edit Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-deck-title">Title</Label>
            <Input
              id="edit-deck-title"
              name="title"
              placeholder="Deck title"
              required
              maxLength={255}
              disabled={isPending}
              defaultValue={deck.title}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-deck-description">Description (optional)</Label>
            <Textarea
              id="edit-deck-description"
              name="description"
              placeholder="Brief description of this deck"
              maxLength={2000}
              disabled={isPending}
              defaultValue={deck.description ?? ""}
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
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
