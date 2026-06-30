"use client";

import { PartyPopper } from "lucide-react";

import { GameResultActions } from "@/components/games/game-result-actions";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { listSeededCrosswordSummaries } from "@/features/crossword/seed/tara-crosswords";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";

export function CrosswordCompletionDialog({
  open,
  puzzle,
  slug,
  timeLabel,
  clueCount,
  onBackToPuzzle
}: {
  open: boolean;
  puzzle: CrosswordCompiledData;
  slug: string;
  timeLabel: string;
  clueCount: number;
  onBackToPuzzle: () => void;
}) {
  const snapshot = useBirthdayProgress();
  const crosswordSummaries = listSeededCrosswordSummaries();

  if (!open) {
    return null;
  }

  const currentCrosswordIndex = crosswordSummaries.findIndex((crossword) => crossword.slug === slug);
  const nextCrossword =
    currentCrosswordIndex >= 0 ? crosswordSummaries[currentCrosswordIndex + 1] ?? null : null;
  const nextGame = nextCrossword ?? getNextBirthdayGame(snapshot, "crossword");
  const celebrationLine = snapshot.allCompleted ? getCelebrationCopy("final", clueCount) : getCelebrationCopy("complete", clueCount);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-complete-title"
        className="arcade-screen animate-answer-reveal w-full max-w-2xl rounded-[1rem] border-arcade-yellow p-6 shadow-glow sm:p-8"
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[0.8rem] border-2 border-white bg-arcade-yellow text-black">
          <PartyPopper className="h-7 w-7" />
        </div>
        <p className="font-body text-[0.72rem] uppercase tracking-[0.24em] text-arcade-blue">Crossword completed</p>
        <h2 id="crossword-complete-title" className="mt-2 font-display text-4xl uppercase sm:text-5xl">
          {puzzle.completion.title}
        </h2>
        <p className="mt-3 font-body text-base leading-8 text-white">{puzzle.completion.message}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <span className="rounded-md border-2 border-white bg-black px-3 py-1.5">
            <span className="text-text">{timeLabel}</span>
            <span className="ml-1.5">time</span>
          </span>
          <span className="rounded-md border-2 border-white bg-black px-3 py-1.5">
            <span className="text-text">{clueCount}</span>
            <span className="ml-1.5">clues</span>
          </span>
        </div>

        <div className="mt-5 rounded-[0.85rem] border-2 border-arcade-yellow bg-[#171700] px-4 py-3 font-body text-sm leading-6 text-text">
          {celebrationLine}
        </div>

        {snapshot.allCompleted ? (
          <div className="mt-3 rounded-[0.85rem] border-2 border-white bg-[#111111] px-4 py-3 font-body text-sm leading-6 text-text">
            All {snapshot.items.length} birthday games are done. The allegations are true: you&apos;re brilliant.
          </div>
        ) : null}

        <GameResultActions nextHref={nextGame?.href ?? null} onBackToPuzzle={onBackToPuzzle} />
      </div>
    </div>
  );
}
