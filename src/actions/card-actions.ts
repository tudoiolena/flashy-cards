"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCardQuery } from "@/db/queries/card-queries";

const createCardSchema = z.object({
  deckId: z.number().positive(),
  front: z.string().min(1, "Front side is required").max(1000),
  back: z.string().min(1, "Back side is required").max(1000),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

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
