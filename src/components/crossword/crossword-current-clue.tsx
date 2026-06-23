import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { CrosswordCompiledEntry } from "@/features/crossword/game/crossword-game.types";
import { Button } from "@/components/ui/button";

export function CrosswordCurrentClue({
  entry,
  onPrevious,
  onNext,
  onToggleDirection
}: {
  entry: CrosswordCompiledEntry | null;
  onPrevious: () => void;
  onNext: () => void;
  onToggleDirection: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Current clue</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onPrevious} aria-label="Previous clue">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next clue">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleDirection}>
            <ArrowLeftRight className="h-4 w-4" />
            Switch
          </Button>
        </div>
      </div>
      {entry ? (
        <div aria-live="polite">
          <p className="mb-2 text-sm uppercase tracking-[0.22em] text-accent">
            {entry.number} {entry.direction}
          </p>
          <p className="text-base leading-7 text-text">{entry.clue}</p>
        </div>
      ) : (
        <p className="text-sm text-muted">Select a cell to begin.</p>
      )}
    </div>
  );
}

