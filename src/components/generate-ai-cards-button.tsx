"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAIFlashcards } from "@/actions/ai-card-actions";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface GenerateAICardsButtonProps {
  deckId: number;
  hasDescription: boolean;
  hasAIGeneration: boolean;
}

export function GenerateAICardsButton({ deckId, hasDescription, hasAIGeneration }: GenerateAICardsButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const isDisabled = isGenerating || (hasAIGeneration && !hasDescription);
  const shouldShowTooltip = !hasAIGeneration || (hasAIGeneration && !hasDescription);

  async function handleClick() {
    if (!hasAIGeneration) {
      router.push("/pricing");
      return;
    }

    if (!hasDescription) {
      toast.error("Please add a description to your deck before generating AI cards.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIFlashcards({ deckId });
      toast.success(`Successfully generated ${result.count} cards!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate cards.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }

  const button = (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isDisabled}
      className="gap-2"
    >
      <Sparkles className="size-4" />
      {isGenerating ? "Generating..." : "Generate Cards with AI"}
    </Button>
  );

  // Show tooltip when button should have one (free users or Pro users without description)
  if (shouldShowTooltip) {
    // Wrap disabled button in span so tooltip works (disabled elements don't trigger hover events)
    if (isDisabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {!hasAIGeneration ? (
              <p>This is a paid feature. Click to upgrade to Pro.</p>
            ) : (
              <p>Please add a description to your deck first. The description helps AI create more relevant flashcards.</p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    // Button is enabled, tooltip works normally
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          {!hasAIGeneration ? (
            <p>This is a paid feature. Click to upgrade to Pro.</p>
          ) : (
            <p>Please add a description to your deck first. The description helps AI create more relevant flashcards.</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
