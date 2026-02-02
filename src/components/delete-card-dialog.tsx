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
import { deleteCard } from "@/actions/card-actions";
import { Trash2 } from "lucide-react";

interface DeleteCardDialogProps {
  card: {
    id: number;
    deckId: number;
    front: string;
  };
  trigger?: React.ReactNode;
}

export function DeleteCardDialog({ card, trigger }: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    try {
      await deleteCard({ cardId: card.id, deckId: card.deckId });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete card.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" type="button" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Are you sure you want to delete this card? This action cannot be undone.
          {card.front && (
            <span className="block mt-2 font-medium text-foreground">
              &ldquo;{card.front.length > 60 ? `${card.front.slice(0, 60)}…` : card.front}&rdquo;
            </span>
          )}
        </p>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
