import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { CrosswordCompiledEntry, CrosswordDirection } from "@/features/crossword/game/crossword-game.types";
import { Button } from "@/components/ui/button";

export function CrosswordCurrentClue({
  entry,
  direction,
  onPrevious,
  onNext,
  onToggleDirection
}: {
  entry: CrosswordCompiledEntry | null;
  direction: CrosswordDirection;
  onPrevious: () => void;
  onNext: () => void;
  onToggleDirection: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Current clue</p>
          {entry ? (
            <div aria-live="polite">
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
                <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-accent">
                  {entry.number}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-muted">
                  {direction}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-text sm:text-base sm:leading-7">{entry.clue}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Select a cell to begin.</p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button variant="ghost" size="sm" onClick={onPrevious} aria-label="Previous clue">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next clue">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleDirection}>
            <ArrowLeftRight className="h-4 w-4" />
            {direction === "across" ? "Across" : "Down"}
          </Button>
        </div>
      </div>
    </div>
  );
}
