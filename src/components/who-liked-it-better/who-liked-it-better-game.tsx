"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Star, Trophy, X } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { GameResultActions } from "@/components/games/game-result-actions";
import { GameHomeButton } from "@/components/games/game-home-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  readLocalWhoLikedItBetterStatus,
  saveWhoLikedItBetterProgress
} from "@/features/who-liked-it-better/game/who-liked-it-better-storage";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { listSeededWhoLikedItBetterSummaries } from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";
import { cn } from "@/lib/utils/cn";

type WhoLikedItBetterQuestionRecord = WhoLikedItBetterGameData["questions"][number];
type RatingGlyphKind = "full" | "half" | "empty";

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

function pickRandomCelebrityImage(question: WhoLikedItBetterQuestionRecord | null) {
  if (!question) {
    return null;
  }

  if (question.celebrityImages && question.celebrityImages.length > 0) {
    return question.celebrityImages[Math.floor(Math.random() * question.celebrityImages.length)] ?? question.celebrityImages[0];
  }

  return question.celebrityImage ?? null;
}

function getDefaultCelebrityImage(question: WhoLikedItBetterQuestionRecord | null) {
  if (!question) {
    return null;
  }

  return question.celebrityImages?.[0] ?? question.celebrityImage ?? null;
}

function getQuestionSourceImages(question: WhoLikedItBetterQuestionRecord | null) {
  if (!question) {
    return [];
  }

  if (question.sourceImages && question.sourceImages.length > 0) {
    return question.sourceImages;
  }

  return question.sourceImage ? [question.sourceImage] : [];
}

function getRatingGlyphKinds(value: number) {
  const clamped = Math.max(0, Math.min(5, value));
  const glyphs: RatingGlyphKind[] = [];
  let remaining = clamped;

  for (let slot = 0; slot < 5; slot += 1) {
    if (remaining >= 1) {
      glyphs.push("full");
      remaining -= 1;
      continue;
    }

    if (remaining >= 0.5) {
      glyphs.push("half");
      remaining -= 0.5;
      continue;
    }

    glyphs.push("empty");
  }

  return glyphs;
}

function getAnimatedRatingGlyphCount(value: number) {
  return getRatingGlyphKinds(value).filter((glyph) => glyph !== "empty").length;
}

function getRatingRevealDurationMs(value: number, winner: boolean) {
  const glyphCount = getAnimatedRatingGlyphCount(value);
  const stepMs = winner ? 160 : 136;

  return glyphCount === 0 ? 0 : glyphCount * stepMs + (winner ? 110 : 0);
}

function getNextWhoLikedItBetterPuzzleHref(slug: string) {
  const games = listSeededWhoLikedItBetterSummaries();
  const currentIndex = games.findIndex((game) => game.slug === slug);
  const orderedGames =
    currentIndex >= 0
      ? [...games.slice(currentIndex + 1), ...games.slice(0, currentIndex)]
      : games;

  const nextIncompleteGame = orderedGames.find(
    (game) => readLocalWhoLikedItBetterStatus(game.slug, game.contentVersion) !== "completed"
  );

  if (nextIncompleteGame) {
    return nextIncompleteGame.href;
  }

  return currentIndex >= 0 ? games[currentIndex + 1]?.href ?? null : null;
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
          ? "bg-[linear-gradient(135deg,#ccff00_0%,#ccff00_24%,#050505_24%,#050505_58%,#fffb02_58%,#fffb02_100%)] text-black"
          : "bg-[linear-gradient(135deg,#02f1ff_0%,#02f1ff_24%,#050505_24%,#050505_58%,#ff0055_58%,#ff0055_100%)] text-white"
      )}
    >
      {monogram}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function RatingGlyph({
  kind,
  delayMs,
  durationMs
}: {
  kind: RatingGlyphKind;
  delayMs: number;
  durationMs: number;
}) {
  const overlayStyle = {
    animationDelay: `${delayMs}ms`,
    animationDuration: `${durationMs}ms`
  };

  return (
    <span aria-hidden="true" className="relative flex h-5 w-5 items-center justify-center">
      <Star className="h-5 w-5 text-white/18" strokeWidth={1.8} />
      {kind === "full" ? (
        <Star
          style={overlayStyle}
          className="absolute inset-0 h-full w-full fill-accent text-accent drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] animate-rating-glyph"
          strokeWidth={1.8}
        />
      ) : null}
      {kind === "half" ? (
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: "50%" }}>
          <Star
            style={overlayStyle}
            className="h-full w-full fill-accent text-accent drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] animate-rating-glyph"
            strokeWidth={1.8}
          />
        </span>
      ) : null}
    </span>
  );
}

function AnimatedRatingStrip({
  rating,
  winner,
  animationKey
}: {
  rating: number;
  winner: boolean;
  animationKey: string;
}) {
  const glyphs = getRatingGlyphKinds(rating);
  const stepMs = winner ? 160 : 136;
  const durationMs = winner ? 300 : 240;
  let revealIndex = 0;

  return (
    <div key={animationKey} className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1">
        {glyphs.map((glyph, index) => {
          const delayMs = glyph === "empty" ? 0 : revealIndex++ * stepMs;

          return <RatingGlyph key={`${glyph}-${index}`} kind={glyph} delayMs={delayMs} durationMs={durationMs} />;
        })}
      </div>
      <p className="text-xs text-muted">{formatRating(rating)}</p>
    </div>
  );
}

function SourceImageStrip({
  images,
  onImageError
}: {
  images: WhoLikedItBetterImageAsset[];
  onImageError: (src: string) => void;
}) {
  if (images.length === 0) {
    return null;
  }

  const multiple = images.length > 1;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">Receipts</p>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image) => (
          <div
            key={image.src}
            className={cn(
              "snap-start overflow-hidden rounded-[1rem] border border-white/10 bg-black/25",
              multiple ? "w-[80%] shrink-0" : "w-full"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={multiple ? "(max-width: 640px) 80vw, 420px" : "(max-width: 640px) 100vw, 480px"}
              className="h-32 w-full object-contain sm:h-40"
              onError={() => onImageError(image.src)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WhoLikedItBetterResultDialog({
  open,
  correct,
  question,
  celebrityImage,
  sourceImages,
  continueLabel,
  onContinue,
  onSourceImageError
}: {
  open: boolean;
  correct: boolean;
  question: WhoLikedItBetterQuestionRecord;
  celebrityImage?: WhoLikedItBetterImageAsset | null;
  sourceImages: WhoLikedItBetterImageAsset[];
  continueLabel: string;
  onContinue: () => void;
  onSourceImageError: (src: string) => void;
}) {
  const [comparisonSettled, setComparisonSettled] = useState(false);

  const taraWins = question.correctAnswer === "tara";
  const losingRating = taraWins ? question.celebrityRating : question.taraRating;
  const lowerRevealDurationMs = getRatingRevealDurationMs(losingRating, false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setComparisonSettled(false);
    const timeoutId = window.setTimeout(() => {
      setComparisonSettled(true);
    }, lowerRevealDurationMs + 180);

    return () => window.clearTimeout(timeoutId);
  }, [lowerRevealDurationMs, open, question.id]);

  if (!open) {
    return null;
  }

  const actionLabel = correct ? "Correct and gorgeous" : "The vibes were incorrect";
  const celebrationLine = correct ? "Taste detected." : "Not very slay.";
  const taraStateClass = cn(
    "rounded-[0.9rem] border-2 p-3 transition-opacity duration-300",
    taraWins ? "border-arcade-green bg-[#101b00]" : "border-white bg-black",
    comparisonSettled && !taraWins ? "opacity-70" : "",
    comparisonSettled && taraWins ? "animate-rating-winner" : ""
  );
  const celebrityStateClass = cn(
    "rounded-[0.9rem] border-2 p-3 transition-opacity duration-300",
    !taraWins ? "border-arcade-green bg-[#101b00]" : "border-white bg-black",
    comparisonSettled && taraWins ? "opacity-70" : "",
    comparisonSettled && !taraWins ? "animate-rating-winner" : ""
  );
  const taraScore = question.taraRating.toString().replace(/\.0$/, "");
  const celebrityScore = question.celebrityRating.toString().replace(/\.0$/, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="who-liked-it-better-result-title"
        className="arcade-screen animate-answer-reveal w-full max-w-3xl rounded-[1rem] p-4 sm:p-5"
      >
        <p className={cn("font-display text-[1rem] uppercase leading-none", correct ? "text-arcade-green" : "text-arcade-pink")}>
          {actionLabel}
        </p>
        <h2 id="who-liked-it-better-result-title" className="mt-2 font-display text-[2.5rem] uppercase leading-none text-text sm:text-[3rem]">
          {getWinnerLabel(question.correctAnswer, question.celebrityName)}
        </h2>
        <p className="mt-3 font-body text-base leading-7 text-muted">{celebrationLine}</p>

        <div className="mt-5 space-y-3">
          <div className={celebrityStateClass}>
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.15rem] items-center gap-3 sm:grid-cols-[6.8rem_minmax(0,1fr)_6.5rem]">
              <FaceOffArt
                image={celebrityImage}
                label={question.celebrityName}
                monogram={getMonogram(question.celebrityName)}
                accent="neutral"
              />
              <div className="min-w-0">
                <p className={cn("font-display text-[1.8rem] uppercase leading-none", !taraWins ? "text-arcade-green" : "text-arcade-pink")}>
                  {question.celebrityName}
                </p>
                <AnimatedRatingStrip
                  animationKey={`${question.id}-celebrity`}
                  rating={question.celebrityRating}
                  winner={!taraWins}
                />
              </div>
              <div className="flex min-w-0 justify-end">
                <p className="pr-1 font-display text-[3.15rem] leading-[0.82] text-white sm:text-[4.75rem]">{celebrityScore}</p>
              </div>
            </div>
          </div>

          <div className={taraStateClass}>
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.15rem] items-center gap-3 sm:grid-cols-[6.8rem_minmax(0,1fr)_6.5rem]">
              <FaceOffArt label="Tara" monogram="T" accent="accent" />
              <div className="min-w-0">
                <p className={cn("font-display text-[1.8rem] uppercase leading-none", taraWins ? "text-arcade-green" : "text-arcade-pink")}>
                  Tara
                </p>
                <AnimatedRatingStrip
                  animationKey={`${question.id}-tara`}
                  rating={question.taraRating}
                  winner={taraWins}
                />
              </div>
              <div className="flex min-w-0 justify-end">
                <p className="pr-1 font-display text-[3.15rem] leading-[0.82] text-white sm:text-[4.75rem]">{taraScore}</p>
              </div>
            </div>
          </div>
        </div>

        {question.explanation ? (
          <div className="mt-4 rounded-[0.85rem] border-2 border-white bg-[#111111] px-3 py-3 font-body text-sm leading-6 text-white">
            {question.explanation}
          </div>
        ) : null}

        <SourceImageStrip images={sourceImages} onImageError={onSourceImageError} />

        <div className="mt-5 flex justify-end">
          <Button className="min-w-[12rem]" onClick={onContinue}>
            {continueLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
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
  const [progress, setProgress] = useState<WhoLikedItBetterProgress>(() => createWhoLikedItBetterProgress());
  const [resultsScreenOpen, setResultsScreenOpen] = useState(false);
  const [dismissedResultsToPuzzle, setDismissedResultsToPuzzle] = useState(false);
  const [announcement, setAnnouncement] = useState("Guess who rated the movie higher.");
  const [hasLoadedStoredProgress, setHasLoadedStoredProgress] = useState(false);
  const [brokenPosterQuestionIds, setBrokenPosterQuestionIds] = useState<string[]>([]);
  const [hiddenCelebrityImageIds, setHiddenCelebrityImageIds] = useState<string[]>([]);
  const [hiddenSourceImageSrcs, setHiddenSourceImageSrcs] = useState<string[]>([]);
  const [randomizedCelebrityImageIds, setRandomizedCelebrityImageIds] = useState<string[]>([]);
  const [selectedCelebrityImages, setSelectedCelebrityImages] = useState<Record<string, WhoLikedItBetterImageAsset>>(
    () => {
      const initialQuestion = gameData.questions[0] ?? null;
      const initialImage = getDefaultCelebrityImage(initialQuestion);

      return initialQuestion && initialImage ? { [initialQuestion.id]: initialImage } : {};
    }
  );

  const currentQuestion = useMemo(
    () => getCurrentWhoLikedItBetterQuestion(gameData, progress),
    [gameData, progress]
  );
  const currentAnswer = useMemo(
    () => (currentQuestion ? getWhoLikedItBetterAnswerRecord(progress, currentQuestion.id) : null),
    [currentQuestion, progress]
  );
  const showResults = resultsScreenOpen;
  const chosenCelebrityImage = currentQuestion ? selectedCelebrityImages[currentQuestion.id] : null;
  const visibleCelebrityImage =
    currentQuestion && !hiddenCelebrityImageIds.includes(currentQuestion.id)
      ? chosenCelebrityImage ?? currentQuestion.celebrityImage ?? null
      : null;
  const visibleSourceImages = useMemo(
    () =>
      getQuestionSourceImages(currentQuestion).filter((image) => !hiddenSourceImageSrcs.includes(image.src)),
    [currentQuestion, hiddenSourceImageSrcs]
  );
  const isFinalQuestion = progress.currentQuestionIndex >= gameData.questions.length - 1;
  const progressDots = useMemo(
    () =>
      gameData.questions.map((question, index) => ({
        id: question.id,
        answer: getWhoLikedItBetterAnswerRecord(progress, question.id),
        current: index === progress.currentQuestionIndex
      })),
    [gameData.questions, progress]
  );
  const nextPuzzleHref = useMemo(() => getNextWhoLikedItBetterPuzzleHref(slug), [slug]);

  useEffect(() => {
    const savedProgress = loadWhoLikedItBetterProgress(slug, contentVersion);

    if (savedProgress) {
      setProgress(savedProgress);
      setResultsScreenOpen(Boolean(savedProgress.completedAt));
      setDismissedResultsToPuzzle(false);
      setAnnouncement(
        savedProgress.completedAt
          ? "Completed rating run restored on this device."
          : savedProgress.startedAt
            ? "Saved rating run restored."
            : "Guess who rated the movie higher."
      );
    }

    setHasLoadedStoredProgress(true);
  }, [contentVersion, slug]);

  useEffect(() => {
    if (!hasLoadedStoredProgress) {
      return;
    }
    saveWhoLikedItBetterProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, hasLoadedStoredProgress, progress, slug]);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    if (randomizedCelebrityImageIds.includes(currentQuestion.id)) {
      return;
    }

    const nextImage = pickRandomCelebrityImage(currentQuestion);
    if (!nextImage) {
      return;
    }

    setSelectedCelebrityImages((current) => ({
      ...current,
      [currentQuestion.id]: nextImage
    }));
    setRandomizedCelebrityImageIds((current) =>
      current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]
    );
  }, [currentQuestion, randomizedCelebrityImageIds]);

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
      setDismissedResultsToPuzzle(false);
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
    setDismissedResultsToPuzzle(false);
    setHiddenCelebrityImageIds([]);
    setHiddenSourceImageSrcs([]);
    setRandomizedCelebrityImageIds([]);
    setSelectedCelebrityImages(() => {
      const firstQuestion = gameData.questions[0] ?? null;
      const randomImage = getDefaultCelebrityImage(firstQuestion);

      return firstQuestion && randomImage ? { [firstQuestion.id]: randomImage } : {};
    });
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

  if (showResults) {
    return (
      <section className="mx-auto max-w-5xl px-2 lg:px-0">
        <div className="flex min-h-[100svh] flex-col justify-center gap-4 py-4">
          <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
            {title}
          </h1>

          <Card className="arcade-screen animate-solved-lift rounded-[1rem] border-arcade-pink">
            <CardHeader className="space-y-3 p-4 pb-2 sm:p-6 sm:pb-3">
              <div className="flex items-center gap-3 text-arcade-pink">
                <Trophy className="h-6 w-6" />
                <span className="font-body text-[0.72rem] uppercase tracking-[0.22em] text-arcade-pink">Results</span>
              </div>
              <div>
                <CardTitle className="text-[2.4rem] sm:text-[3rem]">
                  {progress.score === gameData.questions.length ? "Taste Detected" : "Cinema Literacy Check"}
                </CardTitle>
                <CardDescription className="text-base text-white">
                  {progress.score === gameData.questions.length
                    ? getCelebrationCopy("perfect", progress.score)
                    : `${progress.score}/${gameData.questions.length} correct. Still main character behaviour.`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-4 pt-2 sm:p-6 sm:pt-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {gameData.questions.map((question) => {
                  const answer = getWhoLikedItBetterAnswerRecord(progress, question.id);

                  return (
                    <div
                      key={question.id}
                      className={cn(
                        "rounded-[0.85rem] border-2 p-3 font-body text-sm leading-6",
                        answer?.correct ? "border-arcade-green bg-[#101b00] text-text" : "border-white bg-[#111111] text-muted"
                      )}
                    >
                      <p className="font-display text-[1.15rem] uppercase leading-tight">{question.movieTitle}</p>
                      <p className="mt-2">{getWinnerLabel(question.correctAnswer, question.celebrityName)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white">
                        {answer?.correct ? "Correct" : "Missed"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <GameResultActions
                nextHref={nextPuzzleHref}
                onBackToPuzzle={() => {
                  setResultsScreenOpen(false);
                  setDismissedResultsToPuzzle(true);
                  setAnnouncement("Back to the face-off board.");
                }}
              />
            </CardContent>
          </Card>

          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-2 lg:px-0">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-surface/85 px-3 py-2.5">
        <GameHomeButton className="h-9 px-3" />

        <div className="flex items-center gap-2" aria-label={`Question ${progress.currentQuestionIndex + 1} of ${gameData.questions.length}`}>
          {progressDots.map((dot, index) => {
            if (dot.answer?.correct) {
              return (
                <span
                  key={dot.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/70 bg-emerald-500/20 text-emerald-100"
                  aria-label={`Question ${index + 1}: correct`}
                >
                  <Check className="h-4 w-4" />
                </span>
              );
            }

            if (dot.answer && !dot.answer.correct) {
              return (
                <span
                  key={dot.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-300/70 bg-rose-500/20 text-rose-100"
                  aria-label={`Question ${index + 1}: wrong`}
                >
                  <X className="h-4 w-4" />
                </span>
              );
            }

            return (
              <span
                key={dot.id}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border",
                  dot.current
                    ? "border-accent/70 bg-accent-soft text-text"
                    : "border-white/12 bg-black/15 text-muted"
                )}
                aria-label={`Question ${index + 1}: ${dot.current ? "current" : "up next"}`}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", dot.current ? "bg-accent" : "bg-white/18")} />
              </span>
            );
          })}
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
        open={Boolean(currentAnswer) && !(progress.completedAt && (showResults || dismissedResultsToPuzzle))}
        correct={Boolean(currentAnswer?.correct)}
        question={currentQuestion}
        celebrityImage={visibleCelebrityImage}
        sourceImages={visibleSourceImages}
        continueLabel={isFinalQuestion ? "See Results" : "Next"}
        onContinue={handleAdvance}
        onSourceImageError={(src) =>
          setHiddenSourceImageSrcs((current) => (current.includes(src) ? current : [...current, src]))
        }
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
