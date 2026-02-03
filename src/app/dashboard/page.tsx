import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/deck-queries";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getUserDecks(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const isAtLimit = !hasUnlimitedDecks && decks.length >= 3;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              {hasUnlimitedDecks && (
                <Badge variant="secondary">Pro</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {hasUnlimitedDecks
                ? "Your flashcard decks"
                : `${decks.length}/3 decks`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAtLimit && (
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              </Link>
            )}
            <CreateDeckDialog isAtLimit={isAtLimit} />
          </div>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-center">
                You don&apos;t have any decks yet. Create your first deck to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`} className="block">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">{deck.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deck.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {deck.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="border-t text-xs text-muted-foreground">
                    Updated {new Date(deck.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
