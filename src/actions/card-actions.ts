"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCardQuery,
  updateCardQuery,
  deleteCardQuery,
} from "@/db/queries/card-queries";

const createCardSchema = z.object({
  deckId: z.number().positive(),
  front: z.string().min(1, "Front side is required").max(1000),
  back: z.string().min(1, "Back side is required").max(1000),
});

const updateCardSchema = z.object({
  cardId: z.number().positive(),
  deckId: z.number().positive(),
  front: z.string().min(1, "Front side is required").max(1000),
  back: z.string().min(1, "Back side is required").max(1000),
});

const deleteCardSchema = z.object({
  cardId: z.number().positive(),
  deckId: z.number().positive(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function createCard(data: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = createCardSchema.parse(data);

  await createCardQuery({
    deckId: validated.deckId,
    userId,
    front: validated.front,
    back: validated.back,
  });

  revalidatePath(`/decks/${validated.deckId}`);
}

export async function updateCard(data: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = updateCardSchema.parse(data);

  const updated = await updateCardQuery(validated.cardId, userId, {
    front: validated.front,
    back: validated.back,
  });

  if (!updated) {
    throw new Error("Card not found or unauthorized");
  }

  revalidatePath(`/decks/${validated.deckId}`);
}

export async function deleteCard(data: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = deleteCardSchema.parse(data);

  await deleteCardQuery(validated.cardId, userId);

  revalidatePath(`/decks/${validated.deckId}`);
}
