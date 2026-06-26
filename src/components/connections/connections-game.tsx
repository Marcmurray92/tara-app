"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, RotateCcw, Sparkles } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { GameMasthead } from "@/components/games/game-masthead";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearConnectionsSelection,
  createConnectionsProgress,
  flattenConnectionsTiles,
  getConnectionsGroupById,
  getRemainingConnectionsGroups,
  getSolvedConnectionsGroups,
  shuffleConnectionsTiles,
  submitConnectionsSelection,
  toggleConnectionsSelection
} from "@/features/connections/game/connections-engine";
import type {
  ConnectionsGameData,
  ConnectionsProgress
} from "@/features/connections/game/connections-game.types";
import {
  clearConnectionsProgress,
  loadConnectionsProgress,
  saveConnectionsProgress
} from "@/features/connections/game/connections-storage";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils/cn";

function difficultyTone(difficulty?: 1 | 2 | 3 | 4) {
  switch (difficulty) {
    case 1:
      return "border-success/30 bg-success/10";
    case 2:
      return "border-accent/35 bg-accent-soft";
    case 3:
      return "border-active/35 bg-active/10";
    case 4:
      return "border-error/35 bg-error/10";
    default:
      return "border-white/10 bg-white/5";
  }
}

function hasSelectionLimit(progress: ConnectionsProgress) {
  return progress.selectedItemIds.length >= 4;
}

export function ConnectionsGame({
  gameData,
  slug,
  contentVersion,
  title
}: {
  gameData: ConnectionsGameData;
  slug: string;
  contentVersion: number;
  title: string;
  subtitle?: string;
}) {
  const [loadState] = useState(() => {
    const emptyProgress = createConnectionsProgress(gameData);

    if (typeof window === "undefined") {
      return {
        progress: emptyProgress,
        restored: false,
        completed: false
      };
    }

    const savedProgress = loadConnectionsProgress(slug, contentVersion);

    return {
      progress: savedProgress ?? emptyProgress,
      restored: Boolean(savedProgress?.startedAt && !savedProgress?.completedAt),
      completed: Boolean(savedProgress?.completedAt)
    };
  });
  const [progress, setProgress] = useState<ConnectionsProgress>(loadState.progress);
  const [message, setMessage] = useState(
    loadState.completed
      ? "Solved board restored on this device."
      : loadState.restored
        ? "Welcome back. Your saved board is ready."
        : "Select four movie titles that belong together."
  );
  const [feedbackTone, setFeedbackTone] = useState<"neutral" | "success" | "warning" | "error">("neutral");
  const [boardFeedback, setBoardFeedback] = useState<null | "one-away" | "miss">(null);
  const [recentSolvedGroupId, setRecentSolvedGroupId] = useState<string | null>(null);
  const [celebratingTileIds, setCelebratingTileIds] = useState<string[]>([]);
  const [boardLocked, setBoardLocked] = useState(false);

  const birthdaySnapshot = useBirthdayProgress();
  const prefersReducedMotion = usePrefersReducedMotion();
  const nextGame = getNextBirthdayGame(birthdaySnapshot, "connections");

  const tileMap = useMemo(() => new Map(flattenConnectionsTiles(gameData).map((tile) => [tile.id, tile])), [gameData]);
  const selectedIds = useMemo(() => new Set(progress.selectedItemIds), [progress.selectedItemIds]);
  const unsolvedTiles = useMemo(
    () =>
      progress.remainingTileIds
        .map((tileId) => tileMap.get(tileId))
        .filter((tile): tile is NonNullable<typeof tile> => Boolean(tile)),
    [progress.remainingTileIds, tileMap]
  );
  const solvedGroups = useMemo(
    () => getSolvedConnectionsGroups(gameData, progress.solvedGroupIds),
    [gameData, progress.solvedGroupIds]
  );
  const remainingGroups = useMemo(
    () => getRemainingConnectionsGroups(gameData, progress.solvedGroupIds),
    [gameData, progress.solvedGroupIds]
  );
  const mistakesLeft = Math.max(0, 4 - progress.mistakes);
  const introHighlightTileId = !progress.startedAt ? unsolvedTiles[0]?.id ?? null : null;
  const statusLabel = progress.status === "won" ? "Cleared" : progress.startedAt ? "Continue" : "Fresh board";

  useEffect(() => {
    saveConnectionsProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  useEffect(() => {
    if (!boardFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBoardFeedback(null);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [boardFeedback]);

  useEffect(() => {
    if (!recentSolvedGroupId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentSolvedGroupId(null);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [recentSolvedGroupId]);

  function updateProgress(nextProgress: ConnectionsProgress) {
    setProgress(nextProgress);
  }

  function handleToggle(tileId: string) {
    if (boardLocked) {
      return;
    }

    if (!selectedIds.has(tileId) && hasSelectionLimit(progress)) {
      setFeedbackTone("warning");
      setMessage("You can only select four titles at a time.");
      return;
    }

    setFeedbackTone("neutral");
    updateProgress(toggleConnectionsSelection(progress, tileId, new Date().toISOString()));
  }

  function handleSubmit() {
    if (boardLocked) {
      return;
    }

    if (progress.selectedItemIds.length !== 4) {
      setFeedbackTone("warning");
      setMessage("Choose exactly four titles before you submit.");
      return;
    }

    const result = submitConnectionsSelection({
      gameData,
      progress,
      now: new Date().toISOString()
    });

    if (result.feedback.type === "solved") {
      const solvedGroupId = result.feedback.groupId;
      const solvedGroup = getConnectionsGroupById(gameData, solvedGroupId);
      const solvedMessage = `${getCelebrationCopy(
        result.progress.solvedGroupIds.length === gameData.groups.length ? "complete" : "group",
        result.progress.solvedGroupIds.length
      )}. ${solvedGroup?.category ?? "Group solved"}.`;

      setFeedbackTone("success");
      setMessage(solvedMessage);
      setBoardFeedback(null);

      if (prefersReducedMotion) {
        updateProgress(result.progress);
        setRecentSolvedGroupId(solvedGroupId);
        return;
      }

      setBoardLocked(true);
      setCelebratingTileIds([...progress.selectedItemIds]);

      window.setTimeout(() => {
        updateProgress(result.progress);
        setRecentSolvedGroupId(solvedGroupId);
        setCelebratingTileIds([]);
        setBoardLocked(false);
      }, 220);
      return;
    }

    updateProgress(result.progress);

    if (result.feedback.type === "one-away") {
      setBoardFeedback("one-away");
      setFeedbackTone("warning");
      setMessage("One away. That combo was nearly serving.");
      return;
    }

    if (result.feedback.type === "duplicate") {
      setFeedbackTone("warning");
      setMessage("You already tried that exact set of four movies.");
      return;
    }

    setBoardFeedback("miss");
    setFeedbackTone(result.feedback.type === "lost" ? "error" : "warning");
    setMessage(result.feedback.type === "lost" ? "That was the fourth miss. The remaining categories are below." : "Not quite. Try another combo.");
  }

  function handleRestart() {
    clearConnectionsProgress(slug, contentVersion);
    setProgress(createConnectionsProgress(gameData));
    setFeedbackTone("neutral");
    setBoardFeedback(null);
    setRecentSolvedGroupId(null);
    setCelebratingTileIds([]);
    setBoardLocked(false);
    setMessage("Board reset. Fresh eyes, fresh grid.");
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
            { label: "solved", value: `${progress.solvedGroupIds.length}/4` },
            { label: "mistakes left", value: `${mistakesLeft}` }
          ]}
        />
      </Reveal>

      <div className="safe-top px-2 pt-2 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-surface/90 px-3 py-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2.5 w-2.5 rounded-full border border-white/20",
                  index < mistakesLeft ? "bg-accent/80" : "bg-white/10"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
              {statusLabel}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
              <span className="text-text">{progress.selectedItemIds.length}/4</span>
              <span className="ml-1.5">selected</span>
            </div>
          </div>
        </div>
      </div>

      {solvedGroups.length > 0 ? (
        <Reveal disabled={loadState.restored} delay={90}>
          <div className="grid gap-2 px-2 lg:grid-cols-2 lg:gap-4 lg:px-0">
            {solvedGroups.map((group) => (
              <Card
                key={group.id}
                className={cn(
                  "border-white/10 transition-transform duration-200",
                  difficultyTone(group.difficulty),
                  recentSolvedGroupId === group.id ? "animate-solved-lift" : ""
                )}
                style={recentSolvedGroupId === group.id ? { animationDelay: "40ms" } : undefined}
              >
                <CardHeader className="p-3 pb-2 lg:p-6 lg:pb-3">
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span>{group.category}</span>
                    <span className="text-sm font-normal text-muted">Solved</span>
                  </CardTitle>
                  <CardDescription>{group.items.join(" • ")}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Reveal>
      ) : null}

      <div className="grid gap-3 px-2 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:px-0">
        <div className="space-y-3 lg:space-y-4">
          <Reveal disabled={loadState.restored || loadState.completed} delay={120}>
            <div className="rounded-[1.05rem] border border-white/10 bg-surface/90 p-2.5 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3 lg:mb-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Create four groups of four</p>
                  <p className="mt-1 hidden text-sm leading-6 text-muted lg:block">
                    Select four movie titles that belong together.
                  </p>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm text-muted lg:block">
                  <span className="text-text">{progress.selectedItemIds.length}/4</span>
                  <span className="ml-1.5">selected</span>
                </div>
              </div>

              <div
                className={cn(
                  "grid grid-cols-4 gap-1.5 transition-transform sm:gap-3",
                  boardFeedback === "miss" ? "animate-nudge-x" : "",
                  boardFeedback === "one-away" ? "animate-one-away" : ""
                )}
              >
                {unsolvedTiles.map((tile) => {
                  const selected = selectedIds.has(tile.id);
                  const celebrating = celebratingTileIds.includes(tile.id);

                  return (
                    <button
                      key={tile.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={boardLocked}
                      className={cn(
                        "aspect-square min-h-0 rounded-[0.9rem] border px-1.5 py-2 text-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:rounded-[1.25rem] sm:px-4 sm:py-5 sm:text-sm sm:leading-6",
                        "text-[0.72rem] leading-[0.95rem] sm:text-sm",
                        celebrating ? "animate-tile-solve border-success/35 bg-success/10 text-text" : "",
                        selected
                          ? "scale-[0.985] border-accent bg-accent text-background shadow-glow ring-1 ring-accent/60"
                          : "border-white/10 bg-surface-strong text-text hover:border-accent/45 hover:bg-surface",
                        introHighlightTileId === tile.id ? "animate-focus-pulse" : ""
                      )}
                      onClick={() => handleToggle(tile.id)}
                    >
                      {tile.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="h-10 px-2 text-xs sm:order-2 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={() => updateProgress(shuffleConnectionsTiles(progress, new Date().toISOString()))}
                  disabled={boardLocked}
                >
                  <RefreshCw className="h-4 w-4" />
                  Shuffle
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-2 text-xs sm:order-3 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={() => updateProgress(clearConnectionsSelection(progress))}
                  disabled={boardLocked}
                >
                  Deselect
                </Button>
                <Button
                  className="h-10 px-2 text-xs sm:order-1 sm:col-span-2 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={handleSubmit}
                  disabled={progress.selectedItemIds.length !== 4 || progress.status !== "playing" || boardLocked}
                >
                  <Sparkles className="h-4 w-4" />
                  Submit
                </Button>
                <Button
                  variant="ghost"
                  className="col-span-3 h-10 text-xs sm:col-span-2 sm:h-11 sm:text-sm"
                  onClick={handleRestart}
                  disabled={boardLocked}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
              </div>

              <div
                className={cn(
                  "mt-2.5 rounded-[0.95rem] border px-3 py-2.5 text-sm leading-6 sm:mt-4 sm:rounded-[1.15rem] sm:p-4 sm:leading-7",
                  feedbackTone === "success"
                    ? "border-success/25 bg-success/10 text-text"
                    : feedbackTone === "error"
                      ? "border-error/25 bg-error/10 text-text"
                      : feedbackTone === "warning"
                        ? "border-accent/25 bg-accent-soft text-text"
                        : "border-white/10 bg-black/20 text-muted"
                )}
              >
                {message}
              </div>
            </div>
          </Reveal>

          {progress.status === "lost" ? (
            <Card className="animate-solved-lift">
              <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
                <CardTitle>Remaining answers</CardTitle>
                <CardDescription>The unsolved categories are revealed after the fourth miss.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-2 text-sm text-muted lg:p-6 lg:pt-3">
                {remainingGroups.map((group) => (
                  <div key={group.id} className={cn("rounded-xl border p-3", difficultyTone(group.difficulty))}>
                    <p className="font-medium text-text">{group.category}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{group.items.join(" • ")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {progress.status === "won" ? (
            <Card className="animate-solved-lift border-accent/25">
              <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
                <CardTitle>Board cleared</CardTitle>
                <CardDescription>
                  {birthdaySnapshot.allCompleted ? getCelebrationCopy("final", progress.mistakes) : getCelebrationCopy("complete", progress.solvedGroupIds.length)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-2 lg:p-6 lg:pt-3">
                {birthdaySnapshot.allCompleted ? (
                  <div className="rounded-[1rem] border border-accent/25 bg-accent-soft px-4 py-3 text-sm leading-6 text-text">
                    All three birthday games are done. Another win for women.
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    <span className="text-text">{progress.solvedGroupIds.length}</span>
                    <span className="ml-1.5">groups</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    <span className="text-text">{progress.mistakes}</span>
                    <span className="ml-1.5">mistakes used</span>
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {solvedGroups.map((group, index) => (
                    <div
                      key={group.id}
                      className={cn("animate-answer-reveal rounded-[1rem] border px-3 py-3 text-sm leading-6", difficultyTone(group.difficulty))}
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <p className="font-medium text-text">{group.category}</p>
                      <p className="mt-1 text-muted">{group.items.join(" • ")}</p>
                    </div>
                  ))}
                </div>

                <BirthdayProgress compact currentGame="connections" />

                <div className="flex flex-col gap-3 sm:flex-row">
                  {nextGame ? (
                    <Button asChild className="sm:w-auto">
                      <TransitionLink href={nextGame.href} direction="forward">
                        Play {nextGame.shortTitle}
                        <ArrowRight className="h-4 w-4" />
                      </TransitionLink>
                    </Button>
                  ) : (
                    <Button asChild className="sm:w-auto">
                      <TransitionLink href="/" direction="back">Back to all games</TransitionLink>
                    </Button>
                  )}
                  <Button variant={nextGame ? "outline" : "secondary"} className="sm:w-auto" onClick={handleRestart}>
                    <RotateCcw className="h-4 w-4" />
                    Play again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <BirthdayProgress compact currentGame="connections" />
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>Find all four categories before the fourth mistake lands.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted">
              <p>Select up to four tiles at once.</p>
              <p>Use Shuffle when a visual regroup helps.</p>
              <p>One-away feedback appears when exactly three titles belong together.</p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
