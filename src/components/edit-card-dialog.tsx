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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCard } from "@/actions/card-actions";
import { Pencil } from "lucide-react";

interface EditCardDialogProps {
  card: {
    id: number;
    deckId: number;
    front: string;
    back: string;
  };
  trigger?: React.ReactNode;
}

export function EditCardDialog({ card, trigger }: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const front = (formData.get("front") as string)?.trim() ?? "";
    const back = (formData.get("back") as string)?.trim() ?? "";

    if (!front || !back) {
      setError("Front and back are required.");
      return;
    }

    setIsPending(true);
    try {
      await updateCard({ cardId: card.id, deckId: card.deckId, front, back });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update card.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" type="button" className="gap-2">
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-card-front">Front</Label>
            <Textarea
              id="edit-card-front"
              name="front"
              placeholder="Question or term"
              required
              maxLength={1000}
              disabled={isPending}
              rows={4}
              className="resize-none min-h-[80px] bg-background"
              defaultValue={card.front}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-card-back">Back</Label>
            <Textarea
              id="edit-card-back"
              name="back"
              placeholder="Answer or definition"
              required
              maxLength={1000}
              disabled={isPending}
              rows={4}
              className="resize-none min-h-[80px] bg-background"
              defaultValue={card.back}
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
