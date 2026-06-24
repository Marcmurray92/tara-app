import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { CrosswordCompiledEntry, CrosswordDirection } from "@/features/crossword/game/crossword-game.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function CrosswordCurrentClue({
  entry,
  direction,
  onPrevious,
  onNext,
  onToggleDirection,
  compact = false
}: {
  entry: CrosswordCompiledEntry | null;
  direction: CrosswordDirection;
  onPrevious: () => void;
  onNext: () => void;
  onToggleDirection: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="rounded-[1rem] border border-white/10 bg-surface/90 px-2.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onPrevious} aria-label="Previous clue" className="h-9 w-9 px-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next clue" className="h-9 w-9 px-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={onToggleDirection}
            className="min-w-0 flex-1 rounded-[0.9rem] px-1.5 py-1.5 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label={`Current clue. Tap to switch direction. ${direction}.`}
          >
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">
              {entry ? `${entry.number}` : "Current clue"}
            </p>
            {entry ? (
              <>
                <p className="mt-1 text-sm leading-5 text-text">{entry.clue}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                  Tap clue to switch direction
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Select a cell to begin.</p>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[1.25rem] border border-white/10 bg-surface/90 p-3.5 sm:p-4")}>
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
