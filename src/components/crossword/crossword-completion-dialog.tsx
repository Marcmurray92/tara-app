"use client";

import { PartyPopper } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";

export function CrosswordCompletionDialog({
  open,
  puzzle,
  timeLabel,
  clueCount
}: {
  open: boolean;
  puzzle: CrosswordCompiledData;
  timeLabel: string;
  clueCount: number;
}) {
  const snapshot = useBirthdayProgress();

  if (!open) {
    return null;
  }

  const nextGame = getNextBirthdayGame(snapshot, "crossword");
  const celebrationLine = snapshot.allCompleted ? getCelebrationCopy("final", clueCount) : getCelebrationCopy("complete", clueCount);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-complete-title"
        className="w-full max-w-xl rounded-[1.8rem] border border-accent/30 bg-surface-strong p-6 shadow-glow sm:p-8"
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

        <div className="mt-5">
          <BirthdayProgress compact currentGame="crossword" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {nextGame ? (
            <Button asChild className="sm:w-auto">
              <TransitionLink href={nextGame.href} direction="forward">Play {nextGame.shortTitle}</TransitionLink>
            </Button>
          ) : null}
          <Button asChild variant={nextGame ? "outline" : "default"} className="sm:w-auto">
            <TransitionLink href={puzzle.completion.actionHref ?? "/"} direction={nextGame ? "fade" : "back"}>
              {puzzle.completion.actionLabel ?? "Back home"}
            </TransitionLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
