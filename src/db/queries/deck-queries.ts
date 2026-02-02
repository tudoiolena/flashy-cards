import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Get all decks for a specific user, ordered by most recently updated
 */
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

/**
 * Get a single deck by ID, verifying it belongs to the user
 */
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return deck || null;
}

/**
 * Create a new deck for a user
 */
export async function createDeckQuery(data: {
  userId: string;
  title: string;
  description?: string | null;
}) {
  const [deck] = await db
    .insert(decksTable)
    .values({
      userId: data.userId,
      title: data.title,
      description: data.description,
    })
    .returning();
  
  return deck;
}

/**
 * Update an existing deck, verifying it belongs to the user
 */
export async function updateDeckQuery(
  deckId: number,
  userId: string,
  data: { title?: string; description?: string | null }
) {
  const [deck] = await db
    .update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return deck || null;
}

/**
 * Delete a deck, verifying it belongs to the user
 */
export async function deleteDeckQuery(deckId: number, userId: string) {
  await db
    .delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
}
