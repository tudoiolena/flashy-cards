"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateDeckQuery } from "@/db/queries/deck-queries";

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
