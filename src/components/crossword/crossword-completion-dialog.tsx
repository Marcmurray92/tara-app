"use client";

import { PartyPopper } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { listSeededCrosswordSummaries } from "@/features/crossword/seed/tara-crosswords";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";

export function CrosswordCompletionDialog({
  open,
  puzzle,
  slug,
  timeLabel,
  clueCount
}: {
  open: boolean;
  puzzle: CrosswordCompiledData;
  slug: string;
  timeLabel: string;
  clueCount: number;
}) {
  const snapshot = useBirthdayProgress();
  const crosswordSummaries = listSeededCrosswordSummaries();

  if (!open) {
    return null;
  }

  const nextGame = getNextBirthdayGame(snapshot, "crossword");
  const currentCrosswordIndex = crosswordSummaries.findIndex((crossword) => crossword.slug === slug);
  const nextCrossword =
    currentCrosswordIndex >= 0 ? crosswordSummaries[currentCrosswordIndex + 1] ?? null : null;
  const celebrationLine = snapshot.allCompleted ? getCelebrationCopy("final", clueCount) : getCelebrationCopy("complete", clueCount);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-complete-title"
        className="animate-answer-reveal w-full max-w-xl rounded-[1.8rem] border border-accent/30 bg-surface-strong p-6 shadow-glow sm:p-8"
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent-soft text-accent">
          <PartyPopper className="h-7 w-7" />
        </div>
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Crossword completed</p>
        <h2 id="crossword-complete-title" className="mt-2 font-display text-4xl">
          {puzzle.completion.title}
        </h2>
        <p className="mt-3 text-base leading-8 text-muted">{puzzle.completion.message}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
            <span className="text-text">{timeLabel}</span>
            <span className="ml-1.5">time</span>
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
            <span className="text-text">{clueCount}</span>
            <span className="ml-1.5">clues</span>
          </span>
        </div>

        <div className="mt-5 rounded-[1.2rem] border border-accent/20 bg-accent-soft/70 px-4 py-3 text-sm leading-6 text-text">
          {celebrationLine}
        </div>

        {snapshot.allCompleted ? (
          <div className="mt-3 rounded-[1rem] border border-accent/20 bg-black/20 px-4 py-3 text-sm leading-6 text-text">
            All {snapshot.items.length} birthday games are done. The allegations are true: you&apos;re brilliant.
          </div>
        ) : null}

        <div className="mt-5">
          <BirthdayProgress compact currentGame="crossword" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {nextCrossword ? (
            <Button asChild className="sm:w-auto">
              <TransitionLink href={nextCrossword.href} direction="forward">Next Crossword</TransitionLink>
            </Button>
          ) : null}
          {nextGame ? (
            <Button asChild variant={nextCrossword ? "secondary" : "default"} className="sm:w-auto">
              <TransitionLink href={nextGame.href} direction="forward">Next Puzzle</TransitionLink>
            </Button>
          ) : null}
          <Button asChild variant={nextCrossword || nextGame ? "outline" : "default"} className="sm:w-auto">
            <TransitionLink href="/" direction="back">
              Back to Home
            </TransitionLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
