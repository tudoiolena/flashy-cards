import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/deck-queries";
import { getCardsByDeckId } from "@/db/queries/card-queries";
import { StudyFlashcards } from "@/components/study-flashcards";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    notFound();
  }

  const deck = await getDeckById(deckIdNumber, userId);

  if (!deck) {
    notFound();
  }

  const cards = await getCardsByDeckId(deckIdNumber, userId);

  if (cards.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
        <p className="text-muted-foreground mb-6">
          This deck has no cards yet. Add cards to start studying.
        </p>
        <Link href={`/decks/${deckId}`}>
          <Button variant="default">Back to Deck</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/decks/${deckId}`}>
          <Button variant="ghost" size="sm">
            ← Back to Deck
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-muted-foreground truncate max-w-48" title={deck.title}>
          {deck.title}
        </h1>
        <div className="w-24" aria-hidden />
      </div>
      <StudyFlashcards
        deckId={deckId}
        cards={cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
      />
    </div>
  );
}
