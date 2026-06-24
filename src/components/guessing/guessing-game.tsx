"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <section className="space-y-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-surface/90 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit">Letterboxd energy</Badge>
            <div>
              <h1 className="font-display text-4xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted">
              Score {progress.score}/{totalQuestions}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted">
              Streak {progress.streak}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted">
              Best streak {progress.bestStreak}
            </div>
          </div>
        </div>
      </div>

      {progress.completedAt ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-accent" />
              Round complete
            </CardTitle>
            <CardDescription>
              You finished all {totalQuestions} questions with {progress.score} correct.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle>
                Question {progress.currentQuestionIndex + 1} of {totalQuestions}
              </CardTitle>
              <CardDescription>{answeredQuestions} answered so far on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Review clue</p>
                <p className="mt-4 whitespace-pre-line font-display text-2xl leading-10 text-text">
                  {currentQuestion.reviewText}
                </p>
              </div>

              <div className="grid gap-3">
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
                        "rounded-[1.1rem] border px-4 py-4 text-left text-sm font-medium leading-6 transition",
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
                <div className="flex flex-col gap-4 rounded-[1.25rem] border border-white/10 bg-surface/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm leading-7 text-muted">
                    {currentAnswer.correct
                      ? "Correct. Keep the streak warm."
                      : `Not this time. The answer was ${
                          currentQuestion.choices.find((choice) => choice.id === currentQuestion.correctChoiceId)?.label
                        }.`}
                  </div>
                  <Button onClick={handleNext} disabled={progress.currentQuestionIndex >= totalQuestions - 1}>
                    Next question
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <aside className="space-y-4">
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
