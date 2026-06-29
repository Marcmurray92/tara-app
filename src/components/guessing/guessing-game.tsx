"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { GameHomeButton } from "@/components/games/game-home-button";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  advanceGuessingRound,
  answerGuessingRound,
  createGuessingProgress,
  getCurrentGuessingRound,
  getCurrentGuessingRoundRecord,
  getGuessingChoiceOrder,
  getGuessingMistakesRemaining,
  retryCurrentGuessingRound
} from "@/features/guessing/game/guessing-engine";
import type { GuessingChoice, GuessingGameData, GuessingProgress } from "@/features/guessing/game/guessing-game.types";
import {
  clearGuessingProgress,
  loadGuessingProgress,
  saveGuessingProgress
} from "@/features/guessing/game/guessing-storage";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { cn } from "@/lib/utils/cn";

const SUCCESS_LINES = [
  "You ate.",
  "Actually iconic.",
  "Letterboxd could never."
] as const;

const FAILURE_LINES = [
  "Not very slay.",
  "The review won this round.",
  "Cinema has humbled you."
] as const;

type ChoiceVisualState = "idle" | "incorrect" | "correct" | "revealed" | "inactive";

function getChoiceTitle(choice: GuessingChoice) {
  return choice.year ? `${choice.label} (${choice.year})` : choice.label;
}

function renderMistakeLabel(mistakesRemaining: number) {
  return `${mistakesRemaining} mistake${mistakesRemaining === 1 ? "" : "s"} remaining`;
}

function GuessingRoundDialog({
  open,
  solved,
  roundLabel,
  movieTitle,
  celebrationQuote,
  continueLabel,
  onContinue
}: {
  open: boolean;
  solved: boolean;
  roundLabel: string;
  movieTitle: string;
  celebrationQuote?: string | null;
  continueLabel: string;
  onContinue: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guessing-round-dialog-title"
        className={cn(
          "arcade-screen w-full max-w-xl rounded-[1rem] p-5 sm:p-6",
          solved ? "border-arcade-green" : "border-arcade-pink"
        )}
      >
        <p className={cn("font-display text-[0.95rem] uppercase leading-none", solved ? "text-arcade-green" : "text-arcade-pink")}>
          {solved ? "Correct And Cinema-Pilled!" : "Round Over, Babe"}
        </p>
        <p className="mt-2 font-body text-[0.72rem] uppercase tracking-[0.22em] text-arcade-blue">{roundLabel}</p>
        <h2 id="guessing-round-dialog-title" className="mt-3 font-display text-[2.5rem] uppercase leading-none text-text sm:text-[3rem]">
          {movieTitle}
        </h2>
        <p className="mt-3 font-body text-base leading-7 text-muted">
          {solved ? "Correct. Cinema literacy intact." : "Nope. The review dragged you this time."}
        </p>

        {solved && celebrationQuote ? (
          <blockquote className="mt-4 rounded-[0.8rem] border-2 border-white bg-[#111111] px-3 py-3 font-body text-sm leading-6 text-white">
            Tara review: “{celebrationQuote}”
          </blockquote>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onContinue}>
            {continueLabel}
            {solved ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>

          {!solved ? <GameHomeButton /> : null}
        </div>
      </div>
    </div>
  );
}

export function GuessingGame({
  gameData,
  slug,
  contentVersion,
  title
}: {
  gameData: GuessingGameData;
  slug: string;
  contentVersion: number;
  title: string;
  subtitle?: string;
}) {
  const [loadState] = useState(() => {
    const emptyProgress = createGuessingProgress(gameData);

    if (typeof window === "undefined") {
      return {
        progress: emptyProgress,
        restored: false,
        completed: false
      };
    }

    const savedProgress = loadGuessingProgress(slug, contentVersion);

    return {
      progress: savedProgress ?? emptyProgress,
      restored: Boolean(savedProgress?.startedAt && !savedProgress?.completedAt),
      completed: Boolean(savedProgress?.completedAt)
    };
  });
  const [progress, setProgress] = useState<GuessingProgress>(loadState.progress);
  const [showResults, setShowResults] = useState(loadState.completed);
  const [announcement, setAnnouncement] = useState(
    loadState.completed
      ? "Completed review run restored on this device."
      : loadState.restored
        ? "Welcome back. Your review round is waiting."
        : "Pick the poster that matches the review."
  );
  const [brokenReviewRounds, setBrokenReviewRounds] = useState<Record<string, boolean>>({});

  const birthdaySnapshot = useBirthdayProgress();
  const nextGame = getNextBirthdayGame(birthdaySnapshot, "guessing");

  const currentRound = useMemo(() => getCurrentGuessingRound(gameData, progress), [gameData, progress]);
  const currentRecord = useMemo(() => getCurrentGuessingRoundRecord(gameData, progress), [gameData, progress]);
  const orderedChoices = useMemo(
    () => (currentRound ? getGuessingChoiceOrder(currentRound) : []),
    [currentRound]
  );
  const currentCorrectChoice = currentRound?.choices.find((choice) => choice.id === currentRound.correctChoiceId) ?? null;
  const mistakesRemaining =
    currentRound && currentRecord ? getGuessingMistakesRemaining(currentRound, currentRecord) : 0;
  const showVictory = Boolean(progress.completedAt && showResults);
  const recapItems = useMemo(
    () =>
      gameData.rounds.map((round) => ({
        round,
        record: progress.roundRecords.find((record) => record.roundId === round.id) ?? null,
        correctChoice: round.choices.find((choice) => choice.id === round.correctChoiceId) ?? null
      })),
    [gameData.rounds, progress.roundRecords]
  );

  useEffect(() => {
    saveGuessingProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  function handleChoice(choiceId: string) {
    if (!currentRound || !currentRecord) {
      return;
    }

    const result = answerGuessingRound({
      gameData,
      progress,
      choiceId,
      now: new Date().toISOString()
    });

    setProgress(result.progress);

    const updatedRound = getCurrentGuessingRound(gameData, result.progress);
    const updatedRecord = getCurrentGuessingRoundRecord(gameData, result.progress);
    const updatedMistakesRemaining =
      updatedRound && updatedRecord ? getGuessingMistakesRemaining(updatedRound, updatedRecord) : 0;

    if (result.correct) {
      setAnnouncement(`${SUCCESS_LINES[progress.currentRoundIndex % SUCCESS_LINES.length]} ${currentCorrectChoice?.label ?? ""}`.trim());
      return;
    }

    if (result.result === "failed") {
      setAnnouncement(`${FAILURE_LINES[progress.currentRoundIndex % FAILURE_LINES.length]} The right answer was ${currentCorrectChoice?.label ?? "that film"}.`);
      return;
    }

    setAnnouncement(`Nope. ${renderMistakeLabel(updatedMistakesRemaining)}.`);
  }

  function handleAdvance() {
    if (progress.completedAt) {
      setShowResults(true);
      setAnnouncement("Results ready.");
      return;
    }

    setProgress((currentProgress) => advanceGuessingRound(gameData, currentProgress));
    setAnnouncement("Next round loaded.");
  }

  function handleRetryRound() {
    setProgress((currentProgress) => retryCurrentGuessingRound(gameData, currentProgress));
    setAnnouncement("Round reset. Two mistakes back in play.");
  }

  function handleRestart() {
    clearGuessingProgress(slug, contentVersion);
    setProgress(createGuessingProgress(gameData));
    setShowResults(false);
    setAnnouncement("Fresh review run loaded.");
  }

  if (showVictory) {
    return (
      <section className="mx-auto max-w-5xl px-2 lg:px-0">
        <div className="flex min-h-[100svh] flex-col justify-center gap-4 py-4">
          <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
            {title}
          </h1>

          <Card className="arcade-screen animate-solved-lift rounded-[1rem] border-arcade-green">
            <CardHeader className="space-y-3 p-4 pb-2 sm:p-6 sm:pb-3">
              <div className="flex items-center gap-3 text-arcade-green">
                <Trophy className="h-6 w-6" />
                <span className="font-body text-[0.72rem] uppercase tracking-[0.22em] text-arcade-green">Victory Mode</span>
              </div>
              <div>
                <CardTitle className="text-[2.6rem] sm:text-[3.2rem]">You Got All 3</CardTitle>
                <CardDescription className="text-base text-white">You ate. Letterboxd could never.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-4 pt-2 sm:p-6 sm:pt-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {recapItems.map(({ round, correctChoice }, index) => (
                  <div
                    key={round.id}
                    className="rounded-[0.85rem] border-2 border-white bg-[#111111] p-3 font-body text-sm leading-6 text-text"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-arcade-blue">{round.difficulty}</p>
                    <p className="mt-2 font-display text-[1.25rem] uppercase leading-tight">{correctChoice?.label ?? "Unknown film"}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-arcade-green">Round {index + 1} cleared</p>
                  </div>
                ))}
              </div>

              <BirthdayProgress compact currentGame="guessing" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {nextGame ? (
                  <Button asChild className="sm:w-auto">
                    <TransitionLink href={nextGame.href} direction="forward">
                      Next Puzzle
                      <ArrowRight className="h-4 w-4" />
                    </TransitionLink>
                  </Button>
                ) : (
                  <GameHomeButton className="sm:w-auto" size="default" />
                )}
                <Button variant={nextGame ? "outline" : "secondary"} className="sm:w-auto" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </section>
    );
  }

  if (!currentRound || !currentRecord || brokenReviewRounds[currentRound.id]) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 px-2 lg:px-0">
        <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
          {title}
        </h1>

        <Card>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle>This review has vanished into the gothic mist.</CardTitle>
            <CardDescription>The vibes failed to load, so this round cannot be played safely.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-2 sm:flex-row sm:p-5 sm:pt-3">
            <GameHomeButton size="default" />
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const wrongAttemptIds = currentRecord.attemptedChoiceIds.filter((choiceId) => choiceId !== currentRound.correctChoiceId);
  const successState = currentRecord.result === "solved";
  const failedState = currentRecord.result === "failed";
  const roundDialogOpen = successState || failedState;

  return (
    <section className="mx-auto max-w-5xl px-2 lg:px-0">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <div className="flex min-h-[100svh] flex-col gap-4 py-3 lg:min-h-0 lg:py-4">
        <div className="flex items-center justify-between gap-3">
          <GameHomeButton />

          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            {currentRound.difficulty}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-lg leading-7 text-text">What movie is this review about?</p>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>Round:</span>
            <div className="flex items-center gap-2">
              {gameData.rounds.map((round, index) => {
                const record = progress.roundRecords.find((candidate) => candidate.roundId === round.id);
                const current = index === progress.currentRoundIndex;
                const cleared = record?.result === "solved";

                return (
                  <span
                    key={round.id}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                      current || cleared
                        ? "border-accent bg-accent-soft text-text"
                        : "border-white/20 bg-black/20 text-muted"
                    )}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/25">
          <Image
            src={currentRound.reviewImage.src}
            alt={currentRound.reviewImage.alt}
            width={currentRound.reviewImage.width}
            height={currentRound.reviewImage.height}
            priority={progress.currentRoundIndex === 0}
            sizes="(max-width: 1024px) 100vw, 840px"
            className="h-auto max-h-[38svh] w-full object-contain"
            onError={() =>
              setBrokenReviewRounds((current) => ({
                ...current,
                [currentRound.id]: true
              }))
            }
          />
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {orderedChoices.map((choice) => {
            const selectedWrong = wrongAttemptIds.includes(choice.id);
            const isCorrect = choice.id === currentRound.correctChoiceId;

            let state: ChoiceVisualState = "idle";
            if (successState && isCorrect) {
              state = "correct";
            } else if (failedState && isCorrect) {
              state = "revealed";
            } else if (selectedWrong) {
              state = "incorrect";
            } else if (successState || failedState) {
              state = "inactive";
            }

            const disabled = state !== "idle";

            return (
              <button
                key={choice.id}
                type="button"
                disabled={disabled}
                aria-label={getChoiceTitle(choice)}
                onClick={() => handleChoice(choice.id)}
                className={cn(
                  "min-w-0 rounded-[1rem] border p-1.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:p-2",
                  state === "idle" && "border-white/10 bg-surface/90 hover:border-accent/40 hover:bg-surface-strong",
                  state === "incorrect" && "border-error/35 bg-error/10 opacity-70",
                  state === "correct" && "border-success/35 bg-success/10",
                  state === "revealed" && "border-accent/35 bg-accent-soft",
                  state === "inactive" && "border-white/10 bg-black/20 opacity-75"
                )}
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-[0.7rem] border border-white/10 bg-black/30">
                  {choice.posterImage ? (
                    <Image
                      src={choice.posterImage.src}
                      alt={choice.posterImage.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 180px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center font-display text-[0.8rem] leading-tight text-text">
                      {choice.label}
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-[0.68rem] leading-tight text-text sm:text-xs">{choice.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex items-center gap-3 text-sm text-muted">
          <span>Mistakes Remaining</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-4 w-4 rounded-full border",
                  index < mistakesRemaining ? "border-white bg-white" : "border-white/70 bg-transparent"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <GuessingRoundDialog
        open={roundDialogOpen}
        solved={successState}
        roundLabel={successState ? `${currentRound.difficulty} complete` : `${currentRound.difficulty} failed`}
        movieTitle={currentCorrectChoice?.label ?? "Unknown film"}
        celebrationQuote={successState ? currentRound.celebrationQuote : null}
        continueLabel={successState ? (progress.completedAt ? "See Results" : "Next Round") : "Try Again"}
        onContinue={successState ? handleAdvance : handleRetryRound}
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
