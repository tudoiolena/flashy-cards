"use server";

import { auth } from "@clerk/nextjs/server";
import { openai, OpenAIChatLanguageModelOptions } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getDeckById } from '@/db/queries/deck-queries';
import { createCardQuery } from '@/db/queries/card-queries';

const generateFlashcardsSchema = z.object({
  deckId: z.number().positive(),
});

type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

const flashcardSchema = z.object({
  front: z.string().describe('The question or prompt side of the flashcard'),
  back: z.string().describe('The answer or response side of the flashcard'),
});

const flashcardsSchema = z.object({
  cards: z.array(flashcardSchema).describe('An array of flashcards'),
});

export async function generateAIFlashcards(data: GenerateFlashcardsInput) {
  // 1. Authenticate
  const { has, userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validated = generateFlashcardsSchema.parse(data);

  // 3. Check feature access
  const hasAIGeneration = has({ feature: "ai_flashcard_generation" });
  if (!hasAIGeneration) {
    throw new Error("AI flashcard generation requires Pro subscription. Upgrade at /pricing");
  }

  // 4. Verify deck ownership and get deck details
  const deck = await getDeckById(validated.deckId, userId);
  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 5. Check that deck has both title and description
  if (!deck.title || !deck.description || deck.description.trim() === '') {
    throw new Error("Please add a description to your deck before generating AI cards. The description helps AI create more relevant flashcards.");
  }

  // 6. Build context-aware prompt from deck title and description
  const topic = deck.title;
  const context = deck.description;
  
  const prompt = `Generate exactly 20 flashcards about "${topic}".

Context: ${context}

Analyze the deck title and description to determine the most appropriate flashcard format:

- For language learning/vocabulary decks (e.g., "English to Spanish", "Learn French words"): Use a simple format where the front contains just the word or phrase, and the back contains the translation. Example: Front: "Book" → Back: "Libro". Do NOT use questions like "How do you say X?" - put the word/phrase directly.

- For other educational topics (history, science, concepts, etc.): Use a question-answer format where the front asks a clear question or presents a term, and the back provides a concise answer or definition.

- Adapt the format based on what makes sense for the specific topic. The format should be consistent across all cards in the deck and appropriate for effective studying.

Generate flashcards that are educational, accurate, and useful for studying. Ensure they cover different aspects of the topic and vary in difficulty level when appropriate.`;

  // 8. Generate flashcards using AI
  const result = await generateObject({
    model: openai.chat('gpt-4o-2024-08-06'),
    providerOptions: {
      openai: {
        strictJsonSchema: false,
      } satisfies OpenAIChatLanguageModelOptions,
    },
    schemaName: 'flashcards',
    schemaDescription: `A collection of 20 flashcards about ${topic}.`,
    schema: flashcardsSchema,
    prompt,
  });

  // 9. Create cards in database
  const createdCards = [];
  for (const card of result.object.cards) {
    const createdCard = await createCardQuery({
      deckId: validated.deckId,
      userId,
      front: card.front.trim(),
      back: card.back.trim(),
    });
    createdCards.push(createdCard);
  }

  // 10. Revalidate
  revalidatePath(`/decks/${validated.deckId}`);

  return { count: createdCards.length };
}
