"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Home, RotateCcw, Trophy } from "lucide-react";

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
  WhoLikedItBetterImageAsset,
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

function getMonogram(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function FaceOffArt({
  image,
  label,
  monogram,
  accent = "accent",
  onImageError
}: {
  image?: WhoLikedItBetterImageAsset | null;
  label: string;
  monogram: string;
  accent?: "accent" | "neutral";
  onImageError?: () => void;
}) {
  if (image) {
    return (
      <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-black/25">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 640px) 40vw, 180px"
          className="h-20 w-full object-contain"
          onError={onImageError}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-20 items-center justify-center rounded-[1rem] border border-white/10 text-[1.9rem] font-display",
        accent === "accent"
          ? "bg-[radial-gradient(circle_at_top,_rgba(177,139,255,0.34),_rgba(37,24,58,0.9)_72%)] text-text"
          : "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(24,18,35,0.95)_72%)] text-text"
      )}
    >
      {monogram}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function WhoLikedItBetterResultDialog({
  open,
  correct,
  question,
  celebrityImage,
  sourceImage,
  continueLabel,
  onContinue
}: {
  open: boolean;
  correct: boolean;
  question: WhoLikedItBetterGameData["questions"][number];
  celebrityImage?: WhoLikedItBetterImageAsset | null;
  sourceImage?: WhoLikedItBetterImageAsset | null;
  continueLabel: string;
  onContinue: () => void;
}) {
  if (!open) {
    return null;
  }

  const actionLabel = correct ? "Correct and gorgeous" : "The vibes were incorrect";
  const celebrationLine = correct ? "Taste detected." : "Not very slay.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="who-liked-it-better-result-title"
        className="animate-answer-reveal w-full max-w-md rounded-[1.7rem] border border-accent/20 bg-surface-strong p-5 shadow-glow"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">{actionLabel}</p>
        <h2 id="who-liked-it-better-result-title" className="mt-2 font-display text-[2rem] leading-none text-text">
          {getWinnerLabel(question.correctAnswer, question.celebrityName)}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{celebrationLine}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-3">
            <FaceOffArt label="Tara" monogram="T" accent="accent" />
            <p className="mt-3 text-[0.68rem] uppercase tracking-[0.22em] text-muted">Tara</p>
            <p className="mt-1 font-display text-[1.35rem] text-text">{formatRating(question.taraRating)}</p>
          </div>
          <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-3">
            <FaceOffArt
              image={celebrityImage}
              label={question.celebrityName}
              monogram={getMonogram(question.celebrityName)}
              accent="neutral"
            />
            <p className="mt-3 text-[0.68rem] uppercase tracking-[0.22em] text-muted">{question.celebrityName}</p>
            <p className="mt-1 font-display text-[1.35rem] text-text">{formatRating(question.celebrityRating)}</p>
          </div>
        </div>

        {question.explanation ? (
          <div className="mt-4 rounded-[1rem] border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-6 text-muted">
            {question.explanation}
          </div>
        ) : null}

        {sourceImage ? (
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-white/10 bg-black/25">
            <Image
              src={sourceImage.src}
              alt={sourceImage.alt}
              width={sourceImage.width}
              height={sourceImage.height}
              sizes="(max-width: 640px) 100vw, 480px"
              className="h-auto w-full object-contain"
            />
          </div>
        ) : null}

        <Button className="mt-5 w-full" onClick={onContinue}>
          {continueLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
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
  const [resultsScreenOpen, setResultsScreenOpen] = useState(loadState.completed);
  const [announcement, setAnnouncement] = useState(
    loadState.completed
      ? "Completed rating run restored on this device."
      : loadState.restored
        ? "Saved rating run restored."
        : "Guess who rated the movie higher."
  );
  const [brokenPosterQuestionIds, setBrokenPosterQuestionIds] = useState<string[]>([]);
  const [hiddenCelebrityImageIds, setHiddenCelebrityImageIds] = useState<string[]>([]);
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
  const showResults = resultsScreenOpen;
  const visibleCelebrityImage =
    currentQuestion?.celebrityImage && !hiddenCelebrityImageIds.includes(currentQuestion.id)
      ? currentQuestion.celebrityImage
      : null;
  const visibleSourceImage =
    currentQuestion?.sourceImage && !hiddenSourceImageIds.includes(currentQuestion.id) ? currentQuestion.sourceImage : null;
  const isFinalQuestion = progress.currentQuestionIndex >= gameData.questions.length - 1;

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
        : `The vibes were incorrect. ${getWinnerLabel(currentQuestion.correctAnswer, currentQuestion.celebrityName)}`
    );
  }

  function handleAdvance() {
    if (progress.completedAt || progress.currentQuestionIndex >= gameData.questions.length - 1) {
      setResultsScreenOpen(true);
      setAnnouncement("Final rating summary opened.");
      return;
    }

    setProgress((currentProgress) => advanceWhoLikedItBetterQuestion(gameData, currentProgress));
    setAnnouncement("Next rating round loaded.");
  }

  function handleRestart() {
    clearWhoLikedItBetterProgress(slug, contentVersion);
    setProgress(createWhoLikedItBetterProgress());
    setResultsScreenOpen(false);
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
            <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <div className="overflow-hidden self-start rounded-[1.2rem] border border-white/10 bg-black/25">
                <Image
                  src={currentQuestion.posterImage.src}
                  alt={currentQuestion.posterImage.alt}
                  width={currentQuestion.posterImage.width}
                  height={currentQuestion.posterImage.height}
                  priority={progress.currentQuestionIndex < 2}
                  sizes="(max-width: 640px) 124px, 144px"
                  className="h-auto w-full"
                  onError={() =>
                    setBrokenPosterQuestionIds((current) =>
                      current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]
                    )
                  }
                />
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      {currentQuestion.year ?? "Film"}
                    </span>
                  </div>
                  <CardTitle className="text-[1.75rem] leading-[0.95] sm:text-[2.2rem]">
                    {currentQuestion.movieTitle}
                  </CardTitle>
                  <CardDescription className="text-lg leading-7">Who liked it better?</CardDescription>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => handleAnswer("tara")}
                disabled={Boolean(currentAnswer)}
                aria-pressed={currentAnswer?.selectedAnswer === "tara"}
                className={cn(
                  "h-auto min-h-[10.5rem] flex-col items-stretch rounded-[1.35rem] border border-white/10 bg-accent/85 p-3 text-left text-base shadow-none",
                  currentAnswer?.selectedAnswer === "tara" && currentAnswer.correct
                    ? "border-success/35 bg-success/15"
                    : currentAnswer?.selectedAnswer === "tara"
                      ? "border-error/35 bg-error/15"
                      : currentAnswer && currentQuestion.correctAnswer === "tara"
                        ? "border-success/20 bg-success/10"
                        : ""
                )}
              >
                <FaceOffArt label="Tara" monogram="T" accent="accent" />
                <div className="mt-3 text-left">
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/70">Face-off choice</p>
                  <p className="mt-1 font-display text-[1.35rem] leading-tight text-white">Tara</p>
                </div>
              </Button>
              <Button
                type="button"
                onClick={() => handleAnswer("celebrity")}
                disabled={Boolean(currentAnswer)}
                aria-pressed={currentAnswer?.selectedAnswer === "celebrity"}
                variant="outline"
                className={cn(
                  "h-auto min-h-[10.5rem] flex-col items-stretch rounded-[1.35rem] border border-white/10 bg-surface-strong/95 p-3 text-left text-base shadow-none",
                  currentAnswer?.selectedAnswer === "celebrity" && currentAnswer.correct
                    ? "border-success/35 bg-success/15"
                    : currentAnswer?.selectedAnswer === "celebrity"
                      ? "border-error/35 bg-error/15"
                      : currentAnswer && currentQuestion.correctAnswer === "celebrity"
                        ? "border-success/20 bg-success/10"
                        : ""
                )}
              >
                <FaceOffArt
                  image={visibleCelebrityImage}
                  label={currentQuestion.celebrityName}
                  monogram={getMonogram(currentQuestion.celebrityName)}
                  accent="neutral"
                  onImageError={() =>
                    setHiddenCelebrityImageIds((current) =>
                      current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]
                    )
                  }
                />
                <div className="mt-3 text-left">
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">Face-off choice</p>
                  <p className="mt-1 font-display text-[1.35rem] leading-tight text-text">{currentQuestion.celebrityName}</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="hidden space-y-4 lg:block">
          <BirthdayProgress compact currentGame="who-liked-it-better" />

          <Button variant="outline" className="w-full" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            Restart Run
          </Button>
        </aside>
      </div>

      <WhoLikedItBetterResultDialog
        open={Boolean(currentAnswer)}
        correct={Boolean(currentAnswer?.correct)}
        question={currentQuestion}
        celebrityImage={visibleCelebrityImage}
        sourceImage={visibleSourceImage}
        continueLabel={isFinalQuestion ? "See Results" : "Next"}
        onContinue={handleAdvance}
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
