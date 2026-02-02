import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/deck-queries";
import { getCardsByDeckId } from "@/db/queries/card-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCardDialog } from "@/components/add-card-dialog";
import Link from "next/link";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    notFound();
  }

  // Fetch deck and cards
  const deck = await getDeckById(deckIdNumber, userId);

  if (!deck) {
    notFound();
  }

  const cards = await getCardsByDeckId(deckIdNumber, userId);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Deck Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{deck.title}</h1>
              <Badge variant="secondary" className="text-sm">
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </Badge>
            </div>
            {deck.description && (
              <p className="text-muted-foreground text-lg">{deck.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="lg">
              Study Now
            </Button>
            <Button variant="outline" size="lg">
              Edit Deck
            </Button>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <AddCardDialog deckId={deckIdNumber} />
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No cards in this deck yet. Add your first card to get started!
              </p>
              <AddCardDialog
                deckId={deckIdNumber}
                trigger={
                  <Button variant="default" type="button">
                    Create First Card
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Front</CardTitle>
                  <CardDescription className="text-base font-normal text-foreground">
                    {card.front}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Back</p>
                    <p className="text-base">{card.back}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
