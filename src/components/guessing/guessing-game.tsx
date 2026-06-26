"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { GameMasthead } from "@/components/games/game-masthead";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  advanceGuessingQuestion,
  answerGuessingQuestion,
  createGuessingProgress,
  getCurrentGuessingQuestion,
  getGuessingAnswerRecord,
  getGuessingChoiceOrder
} from "@/features/guessing/game/guessing-engine";
import type { GuessingGameData, GuessingProgress } from "@/features/guessing/game/guessing-game.types";
import {
  clearGuessingProgress,
  loadGuessingProgress,
  saveGuessingProgress
} from "@/features/guessing/game/guessing-storage";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils/cn";

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
    const emptyProgress = createGuessingProgress();

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
  const [message, setMessage] = useState(
    loadState.completed
      ? "Completed round restored on this device."
      : loadState.restored
        ? "Welcome back. Your run is still warm."
        : "Choose the film that best matches the review."
  );
  const [feedbackTone, setFeedbackTone] = useState<"neutral" | "success" | "error">("neutral");
  const [questionMotion, setQuestionMotion] = useState<"idle" | "out" | "in">("idle");

  const birthdaySnapshot = useBirthdayProgress();
  const prefersReducedMotion = usePrefersReducedMotion();
  const nextGame = getNextBirthdayGame(birthdaySnapshot, "guessing");

  const currentQuestion = useMemo(() => getCurrentGuessingQuestion(gameData, progress), [gameData, progress]);
  const currentAnswer = useMemo(
    () => (currentQuestion ? getGuessingAnswerRecord(progress, currentQuestion.id) : null),
    [currentQuestion, progress]
  );
  const orderedChoices = useMemo(
    () => (currentQuestion ? getGuessingChoiceOrder(currentQuestion) : []),
    [currentQuestion]
  );
  const recapItems = useMemo(
    () =>
      gameData.questions.map((question) => ({
        question,
        answer: getGuessingAnswerRecord(progress, question.id),
        correctLabel: question.choices.find((choice) => choice.id === question.correctChoiceId)?.label ?? "Unknown"
      })),
    [gameData.questions, progress]
  );
  const totalQuestions = gameData.questions.length;
  const answeredQuestions = progress.answers.length;
  const statusLabel = progress.completedAt ? "Round complete" : progress.startedAt ? "Continue" : "Fresh round";

  useEffect(() => {
    saveGuessingProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  useEffect(() => {
    if (questionMotion !== "in") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setQuestionMotion("idle");
    }, 240);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [questionMotion]);

  function handleAnswer(choiceId: string) {
    if (!currentQuestion || currentAnswer) {
      return;
    }

    const result = answerGuessingQuestion({
      gameData,
      progress,
      choiceId,
      now: new Date().toISOString()
    });
    const correctChoiceLabel =
      currentQuestion.choices.find((choice) => choice.id === currentQuestion.correctChoiceId)?.label ?? "the correct answer";

    setProgress(result.progress);
    setFeedbackTone(result.correct ? "success" : "error");
    setMessage(
      result.correct
        ? `${getCelebrationCopy("correct", progress.answers.length)}. ${correctChoiceLabel}.`
        : `Not quite. The answer was ${correctChoiceLabel}.`
    );
  }

  function handleNext() {
    if (prefersReducedMotion) {
      setProgress(advanceGuessingQuestion(gameData, progress));
      setFeedbackTone("neutral");
      setMessage("Choose the film that best matches the review.");
      return;
    }

    setQuestionMotion("out");

    window.setTimeout(() => {
      setProgress((current) => advanceGuessingQuestion(gameData, current));
      setFeedbackTone("neutral");
      setMessage("Choose the film that best matches the review.");
      setQuestionMotion("in");
    }, 170);
  }

  function handleRestart() {
    clearGuessingProgress(slug, contentVersion);
    setProgress(createGuessingProgress());
    setFeedbackTone("neutral");
    setQuestionMotion("idle");
    setMessage("Fresh round loaded. Choose the film that best matches the review.");
  }

  return (
    <section className="space-y-3 lg:space-y-5">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <Reveal disabled={loadState.restored || loadState.completed} delay={40}>
        <GameMasthead
          title={title}
          className="hidden lg:block"
          items={[
            { label: "status", value: statusLabel },
            { label: "score", value: `${progress.score}/${totalQuestions}` },
            { label: "streak", value: `${progress.streak}` },
            { label: "best", value: `${progress.bestStreak}` }
          ]}
        />
      </Reveal>

      <div className="safe-top px-2 pt-2 lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] border border-white/10 bg-surface/90 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent">
              Q{progress.currentQuestionIndex + 1}/{totalQuestions}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
              {statusLabel}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
              <span className="text-text">{progress.score}</span>
              <span className="ml-1.5">score</span>
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
              <span className="text-text">{progress.streak}</span>
              <span className="ml-1.5">streak</span>
            </span>
          </div>
        </div>
      </div>

      {progress.completedAt ? (
        <Card className="animate-solved-lift border-accent/25">
          <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
            <CardTitle className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-accent" />
              Round complete
            </CardTitle>
            <CardDescription>
              {birthdaySnapshot.allCompleted
                ? getCelebrationCopy("final", progress.score)
                : getCelebrationCopy(progress.score === totalQuestions ? "perfect" : "complete", progress.score)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-2 lg:p-6 lg:pt-3">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <span className="text-text">{progress.score}</span>
                <span className="ml-1.5">correct</span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <span className="text-text">{progress.bestStreak}</span>
                <span className="ml-1.5">best streak</span>
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {recapItems.map((item) => (
                <div
                  key={item.question.id}
                  className={cn(
                    "rounded-[1rem] border px-3 py-3 text-sm leading-6",
                    item.answer?.correct ? "border-success/25 bg-success/10 text-text" : "border-white/10 bg-black/20 text-muted"
                  )}
                >
                  <p className="font-medium">{item.correctLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em]">
                    {item.answer?.correct ? "Correct" : "Missed"}
                  </p>
                </div>
              ))}
            </div>

            <BirthdayProgress compact currentGame="guessing" />

            <div className="flex flex-col gap-3 sm:flex-row">
              {nextGame ? (
                <Button asChild className="sm:w-auto">
                  <TransitionLink href={nextGame.href} direction="forward">
                    Play {nextGame.shortTitle}
                    <ArrowRight className="h-4 w-4" />
                  </TransitionLink>
                </Button>
              ) : null}
              <Button variant={nextGame ? "outline" : "default"} className="sm:w-auto" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4" />
                Play again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!progress.completedAt && currentQuestion ? (
        <div className="grid gap-3 px-2 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:px-0">
          <div className="space-y-3 lg:space-y-4">
            <Reveal disabled={loadState.restored} delay={120}>
              <Card
                className={cn(
                  "transition-[opacity,transform] duration-200",
                  questionMotion === "out" ? "-translate-x-3 opacity-0" : "",
                  questionMotion === "in" ? "translate-x-3 opacity-0" : ""
                )}
              >
                <CardHeader className="space-y-3 p-4 pb-2 lg:p-6 lg:pb-3">
                  <div className="hidden flex-wrap gap-2 text-sm lg:flex">
                    <span className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-accent">
                      Question {progress.currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-muted">
                      {answeredQuestions} answered on this device
                    </span>
                  </div>
                  <div>
                    <CardTitle>Which film fits this review?</CardTitle>
                    <CardDescription className="hidden lg:block">Choose the best match to keep your streak moving.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-2 lg:space-y-6 lg:p-6 lg:pt-3">
                  <div
                    className={cn(
                      "rounded-[1rem] border border-white/10 bg-black/20 p-3.5 sm:p-5",
                      !progress.startedAt ? "animate-focus-pulse" : ""
                    )}
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Review clue</p>
                    {currentQuestion.reviewImage ? (
                      <div className="mt-3 overflow-hidden rounded-[0.9rem] border border-white/10 bg-black/40">
                        <Image
                          src={currentQuestion.reviewImage.src}
                          alt={currentQuestion.reviewImage.alt}
                          width={currentQuestion.reviewImage.width}
                          height={currentQuestion.reviewImage.height}
                          priority={progress.currentQuestionIndex === 0}
                          className="h-auto w-full"
                          sizes="(max-width: 1024px) 100vw, 900px"
                        />
                      </div>
                    ) : null}
                    {currentQuestion.reviewText ? (
                      <p className="mt-2.5 whitespace-pre-line font-display text-[1.35rem] leading-7 text-text sm:text-[2rem] sm:leading-10">
                        {currentQuestion.reviewText}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
                    {orderedChoices.map((choice) => {
                      const answered = currentAnswer !== null;
                      const selected = currentAnswer?.selectedChoiceId === choice.id;
                      const correct = currentQuestion.correctChoiceId === choice.id;

                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={answered}
                          className={cn(
                            "flex min-h-[5.25rem] h-full items-center rounded-[0.95rem] border px-3 py-3 text-left text-sm font-medium leading-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:min-h-[5.75rem] sm:rounded-[1.1rem] sm:px-4 sm:py-4 sm:leading-6",
                            !answered && "border-white/10 bg-surface/90 hover:border-accent/45 hover:bg-surface-strong",
                            answered && selected && correct && "animate-subtle-pop border-success/35 bg-success/10 text-text",
                            answered && selected && !correct && "animate-nudge-x border-error/35 bg-error/10 text-text",
                            answered && !selected && correct && "border-accent/35 bg-accent-soft text-text",
                            answered && !selected && !correct && "border-white/10 bg-surface/60 text-muted"
                          )}
                          onClick={() => handleAnswer(choice.id)}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className={cn(
                      "rounded-[1rem] border px-3.5 py-3 text-sm leading-6 sm:px-4",
                      feedbackTone === "success"
                        ? "border-success/25 bg-success/10 text-text"
                        : feedbackTone === "error"
                          ? "border-error/25 bg-error/10 text-text"
                          : "border-white/10 bg-black/20 text-muted"
                    )}
                  >
                    {message}
                  </div>

                  {currentAnswer ? (
                    <div className="flex flex-col gap-3 rounded-[1rem] border border-white/10 bg-surface/90 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                      <div className="text-sm leading-6 text-muted sm:leading-7">
                        {currentAnswer.correct ? "Correct. Keep the streak warm." : "Not this time. Reset the streak and keep moving."}
                      </div>
                      <Button className="h-10 px-4 sm:h-11" onClick={handleNext} disabled={progress.currentQuestionIndex >= totalQuestions - 1}>
                        Next question
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Reveal>

            <Button variant="outline" className="h-10 lg:hidden" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>

          <aside className="hidden space-y-4 lg:block">
            <BirthdayProgress compact currentGame="guessing" />
            <Card>
              <CardHeader>
                <CardTitle>Round feel</CardTitle>
                <CardDescription>Choice order is shuffled consistently so refreshes do not reshuffle a live question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted">
                <p>Answering a question updates score and streak immediately.</p>
                <p>Your place is saved locally, so you can come back without losing the run.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reset run</CardTitle>
                <CardDescription>Clear local progress for this guessing set and start again.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
