"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteDeck } from "@/actions/deck-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteDeckDialogProps {
  deck: {
    id: number;
    title: string;
    cardCount?: number;
  };
  trigger?: React.ReactNode;
}

export function DeleteDeckDialog({ deck, trigger }: DeleteDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    try {
      await deleteDeck({ deckId: deck.id });
      setOpen(false);
      toast.success("Deck and all its cards have been deleted.");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deck.");
    } finally {
      setIsPending(false);
    }
  }

  const cardLabel =
    deck.cardCount === undefined
      ? "all cards in this deck"
      : deck.cardCount === 1
        ? "1 card"
        : `${deck.cardCount} cards`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="lg"
            type="button"
            className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <Trash2 className="size-4" />
            Delete Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Are you sure you want to delete &ldquo;{deck.title}&rdquo;? This will
          permanently delete the deck and {cardLabel}. This action cannot be
          undone.
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
            {isPending ? "Deleting…" : "Delete Deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
