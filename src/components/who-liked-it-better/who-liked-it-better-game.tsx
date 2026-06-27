"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Home, RotateCcw, Star, Trophy } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  advanceWhoLikedItBetterQuestion,
  answerWhoLikedItBetterQuestion,
  createWhoLikedItBetterProgress,
  getCurrentWhoLikedItBetterQuestion,
  getWhoLikedItBetterAnswerRecord
} from "@/features/who-liked-it-better/game/who-liked-it-better-engine";
import type {
  WhoLikedItBetterChoice,
  WhoLikedItBetterGameData,
  WhoLikedItBetterProgress
} from "@/features/who-liked-it-better/game/who-liked-it-better-game.types";
import {
  clearWhoLikedItBetterProgress,
  loadWhoLikedItBetterProgress,
  saveWhoLikedItBetterProgress
} from "@/features/who-liked-it-better/game/who-liked-it-better-storage";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { cn } from "@/lib/utils/cn";

function formatRating(value: number) {
  return `${value.toFixed(1)} stars`;
}

function getWinnerLabel(answer: WhoLikedItBetterChoice, celebrityName: string) {
  return answer === "tara" ? "Tara liked it better." : `${celebrityName} liked it better.`;
}

export function WhoLikedItBetterGame({
  gameData,
  slug,
  contentVersion,
  title
}: {
  gameData: WhoLikedItBetterGameData;
  slug: string;
  contentVersion: number;
  title: string;
}) {
  const [loadState] = useState(() => {
    const emptyProgress = createWhoLikedItBetterProgress();

    if (typeof window === "undefined") {
      return {
        progress: emptyProgress,
        restored: false,
        completed: false
      };
    }

    const savedProgress = loadWhoLikedItBetterProgress(slug, contentVersion);

    return {
      progress: savedProgress ?? emptyProgress,
      restored: Boolean(savedProgress?.startedAt && !savedProgress?.completedAt),
      completed: Boolean(savedProgress?.completedAt)
    };
  });
  const [progress, setProgress] = useState<WhoLikedItBetterProgress>(loadState.progress);
  const [announcement, setAnnouncement] = useState(
    loadState.completed
      ? "Completed rating run restored on this device."
      : loadState.restored
        ? "Saved rating run restored."
        : "Guess who rated the movie higher."
  );
  const [brokenPosterQuestionIds, setBrokenPosterQuestionIds] = useState<string[]>([]);
  const [hiddenSourceImageIds, setHiddenSourceImageIds] = useState<string[]>([]);

  const birthdaySnapshot = useBirthdayProgress();
  const nextGame = getNextBirthdayGame(birthdaySnapshot, "who-liked-it-better");

  const currentQuestion = useMemo(
    () => getCurrentWhoLikedItBetterQuestion(gameData, progress),
    [gameData, progress]
  );
  const currentAnswer = useMemo(
    () => (currentQuestion ? getWhoLikedItBetterAnswerRecord(progress, currentQuestion.id) : null),
    [currentQuestion, progress]
  );
  const showResults = Boolean(progress.completedAt);
  const visibleSourceImage =
    currentQuestion?.sourceImage && !hiddenSourceImageIds.includes(currentQuestion.id) ? currentQuestion.sourceImage : null;
  const solvedCount = progress.answers.length;

  useEffect(() => {
    saveWhoLikedItBetterProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  function handleAnswer(selectedAnswer: WhoLikedItBetterChoice) {
    if (!currentQuestion || currentAnswer) {
      return;
    }

    const result = answerWhoLikedItBetterQuestion({
      gameData,
      progress,
      selectedAnswer,
      now: new Date().toISOString()
    });

    setProgress(result.progress);
    setAnnouncement(
      result.correct
        ? `${getCelebrationCopy("correct", progress.answers.length)}. ${getWinnerLabel(currentQuestion.correctAnswer, currentQuestion.celebrityName)}`
        : `${getWinnerLabel(currentQuestion.correctAnswer, currentQuestion.celebrityName)}`
    );
  }

  function handleAdvance() {
    setProgress((currentProgress) => advanceWhoLikedItBetterQuestion(gameData, currentProgress));
    setAnnouncement("Next rating round loaded.");
  }

  function handleRestart() {
    clearWhoLikedItBetterProgress(slug, contentVersion);
    setProgress(createWhoLikedItBetterProgress());
    setAnnouncement("Fresh rating run loaded.");
  }

  if (!currentQuestion || brokenPosterQuestionIds.includes(currentQuestion.id)) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 px-2 lg:px-0">
        <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
          {title}
        </h1>

        <Card>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
            <CardTitle>This poster failed the vibe check.</CardTitle>
            <CardDescription>The round can&apos;t load properly without the movie poster.</CardDescription>
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

  if (showResults) {
    return (
      <section className="mx-auto max-w-5xl space-y-4 px-2 lg:px-0">
        <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
          {title}
        </h1>

        <Card className="animate-solved-lift border-accent/25">
          <CardHeader className="space-y-3 p-4 pb-2 sm:p-5 sm:pb-3">
            <div className="flex items-center gap-3 text-accent">
              <Trophy className="h-5 w-5" />
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">Results</span>
            </div>
            <div>
              <CardTitle>{progress.score === gameData.questions.length ? "Taste detected." : "Cinema literacy check."}</CardTitle>
              <CardDescription>
                {progress.score === gameData.questions.length
                  ? getCelebrationCopy("perfect", progress.score)
                  : `${progress.score}/${gameData.questions.length} correct. Still main character behaviour.`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2 sm:p-5 sm:pt-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gameData.questions.map((question) => {
                const answer = getWhoLikedItBetterAnswerRecord(progress, question.id);

                return (
                  <div
                    key={question.id}
                    className={cn(
                      "rounded-[1rem] border p-3 text-sm leading-6",
                      answer?.correct ? "border-success/20 bg-success/10 text-text" : "border-white/10 bg-black/20 text-muted"
                    )}
                  >
                    <p className="font-display text-[1.1rem] leading-tight">{question.movieTitle}</p>
                    <p className="mt-2">{getWinnerLabel(question.correctAnswer, question.celebrityName)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]">
                      {answer?.correct ? "Correct" : "Missed"}
                    </p>
                  </div>
                );
              })}
            </div>

            <BirthdayProgress compact currentGame="who-liked-it-better" />

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
                  <TransitionLink href="/" direction="back">Back to Home</TransitionLink>
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

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-2 lg:px-0">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-surface/85 px-3 py-2.5">
        <Button asChild variant="ghost" size="sm" className="h-9 w-9 rounded-full border border-white/10 bg-black/20 p-0">
          <TransitionLink href="/" direction="back" aria-label="Back to Home">
            <ArrowLeft className="h-4 w-4" />
          </TransitionLink>
        </Button>

        <div className="flex flex-wrap items-center justify-end gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
          <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-text">
            {progress.currentQuestionIndex + 1}/{gameData.questions.length}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-text">
            {progress.score} correct
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="border-white/10">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/25">
              <Image
                src={currentQuestion.posterImage.src}
                alt={currentQuestion.posterImage.alt}
                width={currentQuestion.posterImage.width}
                height={currentQuestion.posterImage.height}
                priority={progress.currentQuestionIndex < 2}
                sizes="(max-width: 1024px) 100vw, 520px"
                className="h-auto w-full"
                onError={() =>
                  setBrokenPosterQuestionIds((current) =>
                    current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  {currentQuestion.year ?? "Film"}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  Rating face-off
                </span>
              </div>
              <CardTitle className="text-[1.8rem] leading-tight sm:text-[2.3rem]">{currentQuestion.movieTitle}</CardTitle>
              <CardDescription className="text-base">Who liked it better?</CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => handleAnswer("tara")}
                disabled={Boolean(currentAnswer)}
                className={cn(
                  "h-14 text-base",
                  currentAnswer?.selectedAnswer === "tara" && currentAnswer.correct
                    ? "border border-success/35 bg-success/15"
                    : currentAnswer?.selectedAnswer === "tara"
                      ? "border border-error/35 bg-error/15"
                      : ""
                )}
              >
                Tara
              </Button>
              <Button
                type="button"
                onClick={() => handleAnswer("celebrity")}
                disabled={Boolean(currentAnswer)}
                variant="secondary"
                className={cn(
                  "h-14 text-base",
                  currentAnswer?.selectedAnswer === "celebrity" && currentAnswer.correct
                    ? "border border-success/35 bg-success/15"
                    : currentAnswer?.selectedAnswer === "celebrity"
                      ? "border border-error/35 bg-error/15"
                      : ""
                )}
              >
                {currentQuestion.celebrityName}
              </Button>
            </div>

            {currentAnswer ? (
              <div className="space-y-4 rounded-[1.1rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-text">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                    {currentAnswer.correct ? "Correct" : "Not quite"}
                  </p>
                  <p className="mt-2 font-display text-[1.35rem] leading-tight">
                    {getWinnerLabel(currentQuestion.correctAnswer, currentQuestion.celebrityName)}
                  </p>
                  <p className="mt-2">
                    Tara: {formatRating(currentQuestion.taraRating)}
                    <br />
                    {currentQuestion.celebrityName}: {formatRating(currentQuestion.celebrityRating)}
                  </p>
                  {currentQuestion.explanation ? <p className="mt-2 text-muted">{currentQuestion.explanation}</p> : null}
                  {currentQuestion.celebrityRatingSource ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      Source: {currentQuestion.celebrityRatingSource}
                    </p>
                  ) : null}
                </div>

                {visibleSourceImage ? (
                  <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-black/25">
                    <Image
                      src={visibleSourceImage.src}
                      alt={visibleSourceImage.alt}
                      width={visibleSourceImage.width}
                      height={visibleSourceImage.height}
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="h-auto w-full"
                      onError={() =>
                        setHiddenSourceImageIds((current) =>
                          current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]
                        )
                      }
                    />
                  </div>
                ) : null}

                <Button onClick={handleAdvance}>
                  {progress.currentQuestionIndex >= gameData.questions.length - 1 ? "See Results" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <BirthdayProgress compact currentGame="who-liked-it-better" />

          <Card className="border-white/10">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Run status</CardTitle>
              <CardDescription>Progress saves locally while we build.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-2 text-sm leading-6 text-muted">
              <p>{solvedCount}/{gameData.questions.length} answered.</p>
              <p>Current celeb: {currentQuestion.celebrityName}</p>
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
