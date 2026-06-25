import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="w-full shrink-0 border-y border-white/10 bg-background px-1 py-0.5">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onPrevious} aria-label="Previous clue" className="h-10 w-10 px-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <button
            type="button"
            onClick={onToggleDirection}
            className="min-w-0 flex-1 rounded-[0.9rem] px-2 py-1.5 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label={`Current clue ${entry?.number ?? ""}. ${entry?.clue ?? "Select a cell to begin."} Switches direction when tapped. Current direction ${direction}.`}
          >
            {entry ? (
              <>
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">{entry.number}</p>
                <p className="mt-0.5 text-[0.94rem] leading-5 text-text">{entry.clue}</p>
              </>
            ) : (
              <p className="text-[0.94rem] text-muted">Select a cell to begin.</p>
            )}
          </button>
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next clue" className="h-10 w-10 px-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[1.25rem] border border-white/10 bg-surface/90 p-3.5 sm:p-4")}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPrevious} aria-label="Previous clue" className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <button
          key={`${entry?.id ?? "none"}-${direction}`}
          type="button"
          onClick={onToggleDirection}
          className="min-w-0 flex-1 rounded-[1rem] px-2 py-1.5 text-left transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label={`Current clue ${entry?.number ?? ""}. ${entry?.clue ?? "Select a cell to begin."} Switches direction when clicked. Current direction ${direction}.`}
        >
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Current clue</p>
          {entry ? (
            <div aria-live="polite" className="animate-subtle-pop">
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
        </button>

        <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next clue" className="shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
