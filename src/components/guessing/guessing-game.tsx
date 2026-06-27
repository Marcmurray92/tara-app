"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Home, RotateCcw, Sparkles, Trophy } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
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

const POSTER_TONES = [
  "from-[#1c1627] via-[#120f1a] to-[#08070d]",
  "from-[#26163a] via-[#171125] to-[#0b0911]",
  "from-[#161b2a] via-[#100f18] to-[#07070d]",
  "from-[#25111f] via-[#130d17] to-[#09070d]"
] as const;

type ChoiceVisualState = "idle" | "incorrect" | "correct" | "revealed" | "inactive";

function getChoiceTitle(choice: GuessingChoice) {
  return choice.year ? `${choice.label} (${choice.year})` : choice.label;
}

function getPosterTone(choiceId: string) {
  const score = choiceId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

  return POSTER_TONES[score % POSTER_TONES.length];
}

function renderMistakeLabel(mistakesRemaining: number) {
  return `${mistakesRemaining} mistake${mistakesRemaining === 1 ? "" : "s"} remaining`;
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
  const solvedCount = progress.roundRecords.filter((record) => record.result === "solved").length;
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
      <section className="mx-auto max-w-5xl space-y-4 px-2 lg:px-0">
        <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
          {title}
        </h1>

        <Card className="animate-solved-lift border-accent/25">
          <CardHeader className="space-y-3 p-4 pb-2 sm:p-5 sm:pb-3">
            <div className="flex items-center gap-3 text-accent">
              <Trophy className="h-5 w-5" />
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">Victory</span>
            </div>
            <div>
              <CardTitle>You got all 3.</CardTitle>
              <CardDescription>You ate. Letterboxd could never.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2 sm:p-5 sm:pt-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {recapItems.map(({ round, correctChoice }, index) => (
                <div
                  key={round.id}
                  className="rounded-[1rem] border border-success/20 bg-success/10 p-3 text-sm leading-6 text-text"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">{round.difficulty}</p>
                  <p className="mt-2 font-display text-[1.1rem] leading-tight">{correctChoice?.label ?? "Unknown film"}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Round {index + 1} cleared</p>
                </div>
              ))}
            </div>

            <BirthdayProgress compact currentGame="guessing" />

            <div className="flex flex-col gap-3 sm:flex-row">
              {nextGame ? (
                <Button asChild className="sm:w-auto">
                  <TransitionLink href={nextGame.href} direction="forward">
                    Next Puzzle
                    <ArrowRight className="h-4 w-4" />
                  </TransitionLink>
                </Button>
              ) : (
                <Button asChild className="sm:w-auto">
                  <TransitionLink href="/" direction="back">
                    Back to Home
                  </TransitionLink>
                </Button>
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
            <Button asChild>
              <TransitionLink href="/" direction="back">
                <Home className="h-4 w-4" />
                Back to Home
              </TransitionLink>
            </Button>
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

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-2 lg:px-0">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="border-white/10">
          <CardHeader className="space-y-4 p-4 pb-2 sm:p-5 sm:pb-3">
            <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
              <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-accent">
                {currentRound.difficulty}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                Round {progress.currentRoundIndex + 1}/{gameData.rounds.length}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-text">
                {renderMistakeLabel(mistakesRemaining)}
              </span>
            </div>

            <div>
              <CardTitle>Match the review to the movie.</CardTitle>
              <CardDescription>
                {successState
                  ? `${currentRound.difficulty} complete.`
                  : failedState
                    ? `${currentRound.difficulty} failed.`
                    : wrongAttemptIds.length > 0
                      ? "One miss locks. Choose carefully."
                      : "Pick the poster that best fits the screenshot."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-2 sm:p-5 sm:pt-3">
            <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/25">
              <Image
                src={currentRound.reviewImage.src}
                alt={currentRound.reviewImage.alt}
                width={currentRound.reviewImage.width}
                height={currentRound.reviewImage.height}
                priority={progress.currentRoundIndex === 0}
                sizes="(max-width: 1024px) 100vw, 840px"
                className="h-auto w-full"
                onError={() =>
                  setBrokenReviewRounds((current) => ({
                    ...current,
                    [currentRound.id]: true
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                      "group overflow-hidden rounded-[0.95rem] border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:rounded-[1.15rem]",
                      state === "idle" && "border-white/10 bg-surface/90 hover:border-accent/40 hover:bg-surface-strong",
                      state === "incorrect" && "border-error/35 bg-error/10",
                      state === "correct" && "border-success/35 bg-success/10",
                      state === "revealed" && "border-accent/35 bg-accent-soft",
                      state === "inactive" && "border-white/10 bg-black/20"
                    )}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-black/20">
                      {choice.posterImage ? (
                        <Image
                          src={choice.posterImage.src}
                          alt={choice.posterImage.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 220px"
                        />
                      ) : (
                        <div
                          className={cn(
                            "flex h-full w-full flex-col justify-between bg-gradient-to-b p-2 text-left",
                            getPosterTone(choice.id)
                          )}
                        >
                          <div className="flex items-center justify-between text-[0.5rem] uppercase tracking-[0.14em] text-muted">
                            <span>{choice.year ?? "Film"}</span>
                            <span>Guess</span>
                          </div>
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] text-muted">
                              <Sparkles className="h-3 w-3 text-accent" />
                              Poster
                            </span>
                            <p className="font-display text-[0.85rem] leading-tight text-text sm:text-[1rem]">
                              {choice.label}
                            </p>
                          </div>
                        </div>
                      )}

                      {state !== "idle" ? (
                        <div className="absolute inset-x-0 top-0 flex justify-end p-1.5 sm:p-2">
                          <span
                            className={cn(
                              "rounded-full border px-1.5 py-0.5 text-[0.5rem] font-medium uppercase tracking-[0.12em] sm:text-[0.58rem]",
                              state === "correct" && "border-success/30 bg-success/85 text-background",
                              state === "revealed" && "border-accent/30 bg-accent/85 text-background",
                              state === "incorrect" && "border-error/30 bg-error/85 text-background",
                              state === "inactive" && "border-white/15 bg-black/55 text-white/75"
                            )}
                          >
                            {state === "correct"
                              ? "Correct"
                              : state === "revealed"
                                ? "Answer"
                                : state === "incorrect"
                                  ? "Miss"
                                  : "Seen"}
                          </span>
                        </div>
                      ) : null}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-1.5 pb-1.5 pt-4 sm:px-2 sm:pb-2 sm:pt-6">
                        <p className="line-clamp-2 text-[0.55rem] font-medium leading-tight text-white/92 sm:text-[0.68rem]">
                          {choice.label}
                        </p>
                        <span className="mt-1 block text-[0.48rem] uppercase tracking-[0.12em] text-white/65 sm:text-[0.56rem]">
                          {choice.year ?? "Film"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {successState ? (
              <div className="rounded-[1.1rem] border border-success/25 bg-success/10 p-4 text-sm leading-6 text-text">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">{currentRound.difficulty} complete</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight">{currentCorrectChoice?.label}</p>
                <p className="mt-2">{SUCCESS_LINES[progress.currentRoundIndex % SUCCESS_LINES.length]}</p>
                {currentRound.celebrationQuote ? (
                  <blockquote className="mt-3 rounded-[0.95rem] border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-6 text-muted">
                    Tara review: “{currentRound.celebrationQuote}”
                  </blockquote>
                ) : null}
                <div className="mt-4">
                  <Button onClick={handleAdvance}>
                    {progress.completedAt ? "See Results" : "Next Round"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : failedState ? (
              <div className="rounded-[1.1rem] border border-error/25 bg-error/10 p-4 text-sm leading-6 text-text">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">{currentRound.difficulty} failed</p>
                <p className="mt-2 font-display text-[1.35rem] leading-tight">{currentCorrectChoice?.label}</p>
                <p className="mt-2">{FAILURE_LINES[progress.currentRoundIndex % FAILURE_LINES.length]}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleRetryRound}>
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button asChild variant="outline">
                    <TransitionLink href="/" direction="back">
                      <Home className="h-4 w-4" />
                      Back to Home
                    </TransitionLink>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-muted">
                {wrongAttemptIds.length > 0
                  ? `One miss banked. ${renderMistakeLabel(mistakesRemaining)}.`
                  : "Two misses per round. Wrong posters lock and stay dead."}
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="hidden space-y-4 lg:block">
          <BirthdayProgress compact currentGame="guessing" />

          <Card className="border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Run status</CardTitle>
              <CardDescription>Progress is saved locally on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-2 text-sm leading-6 text-muted">
              <p>{solvedCount}/{gameData.rounds.length} reviews cleared.</p>
              <p>{renderMistakeLabel(mistakesRemaining)} in the current round.</p>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            Restart Run
          </Button>
        </aside>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
