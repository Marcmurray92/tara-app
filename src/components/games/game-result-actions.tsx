import { ArrowRight, Undo2 } from "lucide-react";

import { GameHomeButton } from "@/components/games/game-home-button";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";

export function GameResultActions({
  nextHref,
  onBackToPuzzle
}: {
  nextHref?: string | null;
  onBackToPuzzle: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {nextHref ? (
        <Button asChild className="sm:w-auto">
          <TransitionLink href={nextHref} direction="forward">
            Next Puzzle
            <ArrowRight className="h-4 w-4" />
          </TransitionLink>
        </Button>
      ) : (
        <Button disabled className="sm:w-auto">
          Next Puzzle
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      <Button variant="outline" className="sm:w-auto" onClick={onBackToPuzzle}>
        <Undo2 className="h-4 w-4" />
        Back to Puzzle
      </Button>

      <GameHomeButton ariaLabel="Go Home" className="sm:w-auto" label="Go Home" size="default" />
    </div>
  );
}
