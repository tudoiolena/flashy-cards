"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createDeckQuery, updateDeckQuery, deleteDeckQuery, getUserDecks } from "@/db/queries/deck-queries";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional().nullable(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(data: CreateDeckInput) {
  const { has, userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = createDeckSchema.parse(data);

  // Check for unlimited_decks feature
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });

  // Enforce 3-deck limit for free users
  if (!hasUnlimitedDecks) {
    const decks = await getUserDecks(userId);
    if (decks.length >= 3) {
      throw new Error(
        "You've reached the maximum of 3 decks. Upgrade to Pro for unlimited decks."
      );
    }
  }

  const deck = await createDeckQuery({
    userId,
    title: validated.title,
    description: validated.description ?? null,
  });

  revalidatePath("/dashboard");
  return deck;
}

const updateDeckSchema = z.object({
  deckId: z.number().positive(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional().nullable(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(data: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = updateDeckSchema.parse(data);

  const deck = await updateDeckQuery(validated.deckId, userId, {
    title: validated.title,
    description: validated.description ?? null,
  });

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  revalidatePath(`/decks/${validated.deckId}`);
  revalidatePath("/dashboard");
}

const deleteDeckSchema = z.object({
  deckId: z.number().positive(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(data: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = deleteDeckSchema.parse(data);

  await deleteDeckQuery(validated.deckId, userId);

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${validated.deckId}`);
}
