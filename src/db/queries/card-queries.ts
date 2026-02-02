import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all cards for a deck, verifying the deck belongs to the user
 */
export async function getCardsByDeckId(deckId: number, userId: string) {
  // First verify deck ownership
  const deck = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (deck.length === 0) {
    return [];
  }
  
  // Then fetch cards
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}

/**
 * Get a single card by ID, verifying it belongs to a deck owned by the user
 */
export async function getCardById(cardId: number, userId: string) {
  // Verify card belongs to a deck owned by the user
  const [card] = await db
    .select({
      id: cardsTable.id,
      deckId: cardsTable.deckId,
      front: cardsTable.front,
      back: cardsTable.back,
      createdAt: cardsTable.createdAt,
      updatedAt: cardsTable.updatedAt,
      deckUserId: decksTable.userId,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!card) {
    return null;
  }
  
  // Return card without deckUserId
  return {
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

/**
 * Create a new card in a deck, verifying the deck belongs to the user
 */
export async function createCardQuery(data: {
  deckId: number;
  userId: string;
  front: string;
  back: string;
}) {
  // Verify deck ownership
  const deck = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, data.deckId),
      eq(decksTable.userId, data.userId)
    ))
    .limit(1);
  
  if (deck.length === 0) {
    throw new Error("Deck not found or unauthorized");
  }
  
  // Create card
  const [card] = await db
    .insert(cardsTable)
    .values({
      deckId: data.deckId,
      front: data.front,
      back: data.back,
    })
    .returning();
  
  return card;
}

/**
 * Update an existing card, verifying it belongs to a deck owned by the user
 */
export async function updateCardQuery(
  cardId: number,
  userId: string,
  data: { front?: string; back?: string }
) {
  // Verify card belongs to a deck owned by the user
  const card = await getCardById(cardId, userId);
  
  if (!card) {
    return null;
  }
  
  // Update card
  const [updatedCard] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return updatedCard;
}

/**
 * Delete a card, verifying it belongs to a deck owned by the user
 */
export async function deleteCardQuery(cardId: number, userId: string) {
  // Verify card belongs to a deck owned by the user
  const card = await getCardById(cardId, userId);
  
  if (!card) {
    throw new Error("Card not found or unauthorized");
  }
  
  // Delete card
  await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}
