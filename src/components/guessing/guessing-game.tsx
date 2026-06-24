"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { GameMasthead } from "@/components/games/game-masthead";
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
import { cn } from "@/lib/utils/cn";

export function GuessingGame({
  gameData,
  slug,
  contentVersion,
  title,
  subtitle
}: {
  gameData: GuessingGameData;
  slug: string;
  contentVersion: number;
  title: string;
  subtitle?: string;
}) {
  const [progress, setProgress] = useState<GuessingProgress>(() => createGuessingProgress());
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const currentQuestion = useMemo(() => getCurrentGuessingQuestion(gameData, progress), [gameData, progress]);
  const currentAnswer = useMemo(
    () => (currentQuestion ? getGuessingAnswerRecord(progress, currentQuestion.id) : null),
    [currentQuestion, progress]
  );
  const orderedChoices = useMemo(
    () => (currentQuestion ? getGuessingChoiceOrder(currentQuestion) : []),
    [currentQuestion]
  );

  useEffect(() => {
    const saved = loadGuessingProgress(slug, contentVersion);
    if (saved) {
      setProgress(saved);
    }

    setHasLoadedStorage(true);
  }, [contentVersion, slug]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    saveGuessingProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, hasLoadedStorage, progress, slug]);

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

    setProgress(result.progress);
  }

  function handleNext() {
    setProgress(advanceGuessingQuestion(gameData, progress));
  }

  function handleRestart() {
    clearGuessingProgress(slug, contentVersion);
    setProgress(createGuessingProgress());
  }

  const totalQuestions = gameData.questions.length;
  const answeredQuestions = progress.answers.length;

  return (
    <section className="space-y-3 lg:space-y-5">
      <GameMasthead
        eyebrow="Letterboxd energy"
        title={title}
        subtitle={subtitle}
        className="hidden lg:block"
        items={[
          { label: "score", value: `${progress.score}/${totalQuestions}` },
          { label: "streak", value: `${progress.streak}` },
          { label: "best", value: `${progress.bestStreak}` }
        ]}
      />

      <div className="safe-top px-2 pt-2 lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] border border-white/10 bg-surface/90 px-3 py-2">
          <div className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent">
            Q{progress.currentQuestionIndex + 1}/{totalQuestions}
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
        <Card>
          <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
            <CardTitle className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-accent" />
              Round complete
            </CardTitle>
            <CardDescription>
              You finished all {totalQuestions} questions with {progress.score} correct.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4 pt-2 sm:flex-row sm:items-center sm:justify-between lg:p-6 lg:pt-3">
            <div className="text-sm leading-7 text-muted">
              Final streak: {progress.streak}. Best streak: {progress.bestStreak}.
            </div>
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!progress.completedAt && currentQuestion ? (
        <div className="grid gap-3 px-2 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:px-0">
          <div className="space-y-3 lg:space-y-4">
            <Card>
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
                <div className="rounded-[1rem] border border-white/10 bg-black/20 p-3.5 sm:p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Review clue</p>
                  <p className="mt-2.5 whitespace-pre-line font-display text-[1.35rem] leading-7 text-text sm:text-[2rem] sm:leading-10">
                    {currentQuestion.reviewText}
                  </p>
                </div>

                <div className="grid gap-2.5 lg:gap-3">
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
                          "min-h-12 rounded-[0.95rem] border px-3 py-3 text-left text-sm font-medium leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:min-h-14 sm:rounded-[1.1rem] sm:px-4 sm:py-4 sm:leading-6",
                          !answered && "border-white/10 bg-surface/90 hover:border-accent/45 hover:bg-surface-strong",
                          answered && selected && correct && "border-success/35 bg-success/10 text-text",
                          answered && selected && !correct && "border-error/35 bg-error/10 text-text",
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

                {currentAnswer ? (
                  <div className="flex flex-col gap-3 rounded-[1rem] border border-white/10 bg-surface/90 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                    <div className="text-sm leading-6 text-muted sm:leading-7">
                      {currentAnswer.correct
                        ? "Correct. Keep the streak warm."
                        : `Not this time. The answer was ${
                            currentQuestion.choices.find((choice) => choice.id === currentQuestion.correctChoiceId)?.label
                          }.`}
                    </div>
                    <Button className="h-10 px-4 sm:h-11" onClick={handleNext} disabled={progress.currentQuestionIndex >= totalQuestions - 1}>
                      Next question
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            <Button variant="outline" className="h-10 lg:hidden" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>

          <aside className="hidden space-y-4 lg:block">
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
    </section>
  );
}
