"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Check, X, RotateCw, ListChecks, ArrowLeft } from "lucide-react";

type CardData = {
  id: number;
  front: string;
  back: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface StudyFlashcardsProps {
  deckId: string;
  cards: CardData[];
}

export function StudyFlashcards({ deckId, cards: initialCards }: StudyFlashcardsProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [incorrectCardIds, setIncorrectCardIds] = useState<Set<number>>(new Set());

  const currentCard = cards[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < cards.length - 1;
  const totalAnswered = correctCount + incorrectCount;
  const sessionComplete = cards.length > 0 && totalAnswered >= cards.length;

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
    setIsFlipped(false);
  }, [cards.length]);

  const flip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const shuffle = useCallback(() => {
    setCards((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIncorrectCardIds(new Set());
  }, []);

  const studyAgain = useCallback(() => {
    setCards(shuffleArray([...initialCards]));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIncorrectCardIds(new Set());
  }, [initialCards]);

  const runAgainIncorrect = useCallback(() => {
    const incorrectCards = initialCards.filter((c) => incorrectCardIds.has(c.id));
    if (incorrectCards.length === 0) return;
    setCards(shuffleArray(incorrectCards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIncorrectCardIds(new Set());
  }, [initialCards, incorrectCardIds]);

  const markCorrect = useCallback(() => {
    setCorrectCount((c) => c + 1);
    setIsFlipped(false);
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
  }, [cards.length]);

  const markIncorrect = useCallback(() => {
    setIncorrectCount((c) => c + 1);
    setIncorrectCardIds((prev) => new Set(prev).add(currentCard.id));
    setIsFlipped(false);
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
  }, [cards.length, currentCard.id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (hasPrev) goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (hasNext) goNext();
          break;
        case " ":
          e.preventDefault();
          flip();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrev, hasNext, goPrev, goNext, flip]);

  if (sessionComplete) {
    const hasIncorrect = incorrectCardIds.size > 0;
    return (
      <div className="space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Session complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <strong>{correctCount}</strong> correct
              </span>
              <span className="flex items-center gap-2 text-destructive">
                <X className="h-5 w-5" />
                <strong>{incorrectCount}</strong> incorrect
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default" onClick={studyAgain} className="gap-2">
                <RotateCw className="h-4 w-4" />
                Study again
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/decks/${deckId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to deck
                </Link>
              </Button>
              {hasIncorrect ? (
                <Button variant="secondary" onClick={runAgainIncorrect} className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  Run again incorrect ones
                </Button>
              ) : (
                <Button variant="secondary" disabled className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  No incorrect cards
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress: correct / incorrect counts and bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm font-normal">
              {currentIndex + 1} / {cards.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={shuffle}
              aria-label="Shuffle deck"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              {correctCount}
            </span>
            <span className="flex items-center gap-1.5 text-destructive">
              <X className="h-4 w-4" />
              {incorrectCount}
            </span>
          </div>
        </div>
        {totalAnswered > 0 && (
          <div className="space-y-1.5">
            <Progress
              value={(correctCount / totalAnswered) * 100}
              className="h-2 **:data-[slot=progress-indicator]:bg-green-600 **:data-[slot=progress-indicator]:dark:bg-green-500"
            />
            <p className="text-xs text-muted-foreground">
              Correct: {correctCount} · Incorrect: {incorrectCount}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ← → Previous / Next · Space Flip card
      </p>

      <Card
        role="button"
        tabIndex={0}
        className="min-h-[280px] flex flex-col justify-center cursor-pointer transition-all hover:shadow-lg active:scale-[0.99] select-none touch-manipulation border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        onClick={flip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        aria-label={isFlipped ? "Show question" : "Show answer"}
      >
        <CardContent className="p-8 flex flex-1 flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {isFlipped ? "Answer" : "Question"}
          </p>
          <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Tap to {isFlipped ? "show question" : "show answer"}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={!hasPrev}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsFlipped(false);
            setCurrentIndex(0);
          }}
          disabled={currentIndex === 0}
          aria-label="Start over"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start over
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={!hasNext}
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isFlipped && (
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            size="sm"
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            onClick={markCorrect}
          >
            <Check className="h-4 w-4 mr-2" />
            Correct
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={markIncorrect}
          >
            <X className="h-4 w-4 mr-2" />
            Incorrect
          </Button>
        </div>
      )}
    </div>
  );
}
