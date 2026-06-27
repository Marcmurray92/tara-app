"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, RefreshCw, RotateCcw, Sparkles } from "lucide-react";

import { BirthdayProgress } from "@/components/games/birthday-progress";
import { GameMasthead } from "@/components/games/game-masthead";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearConnectionsSelection,
  createConnectionsProgress,
  flattenConnectionsTiles,
  getConnectionsGuessEmojiRows,
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
  const [submittedTileIds, setSubmittedTileIds] = useState<string[]>([]);
  const [boardLocked, setBoardLocked] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

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
  const revealedGroups = useMemo(
    () => (progress.status === "lost" ? [...solvedGroups, ...remainingGroups] : solvedGroups),
    [progress.status, remainingGroups, solvedGroups]
  );
  const guessEmojiRows = useMemo(() => getConnectionsGuessEmojiRows(gameData, progress), [gameData, progress]);
  const mistakesLeft = Math.max(0, 4 - progress.mistakes);
  const introHighlightTileId = !progress.startedAt ? unsolvedTiles[0]?.id ?? null : null;
  const statusLabel =
    progress.status === "won"
      ? "Won"
      : progress.status === "lost"
        ? "Lost"
        : progress.startedAt
          ? "Continue"
          : "Fresh board";
  const canInteract = progress.status === "playing" && !boardLocked;

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
    if (!canInteract) {
      return;
    }

    setSubmittedTileIds([]);
    if (!selectedIds.has(tileId) && hasSelectionLimit(progress)) {
      setFeedbackTone("warning");
      setMessage("You can only select four titles at a time.");
      return;
    }

    setFeedbackTone("neutral");
    updateProgress(toggleConnectionsSelection(progress, tileId, new Date().toISOString()));
  }

  function handleSubmit() {
    if (!canInteract) {
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
      setSubmittedTileIds([]);

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

    setSubmittedTileIds([...progress.selectedItemIds]);
    updateProgress(result.progress);

    if (result.feedback.type === "one-away") {
      setBoardFeedback("one-away");
      setFeedbackTone("neutral");
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
    setMessage(result.feedback.type === "lost" ? "That was the fourth miss. The board is over." : "Not quite. Try another combo.");
  }

  function handleRestart() {
    clearConnectionsProgress(slug, contentVersion);
    setProgress(createConnectionsProgress(gameData));
    setFeedbackTone("neutral");
    setBoardFeedback(null);
    setRecentSolvedGroupId(null);
    setCelebratingTileIds([]);
    setSubmittedTileIds([]);
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

              <div className="relative">
                {boardFeedback === "one-away" ? (
                  <div className="pointer-events-none absolute inset-x-0 -top-2 z-10 flex justify-center">
                    <div className="animate-answer-reveal rounded-full border border-accent/30 bg-background/95 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-text shadow-glow">
                      One Away...
                    </div>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "grid grid-cols-4 gap-1.5 transition-transform sm:gap-3",
                    boardFeedback === "miss" ? "animate-nudge-x" : "",
                    boardFeedback === "one-away" ? "animate-one-away" : ""
                  )}
                >
                  {revealedGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "col-span-4 flex min-h-[5.25rem] flex-col items-center justify-center rounded-[0.95rem] border px-3 py-2 text-center sm:min-h-[6.5rem] sm:rounded-[1.15rem] sm:px-5 lg:min-h-[7rem]",
                        difficultyTone(group.difficulty),
                        recentSolvedGroupId === group.id ? "animate-solved-lift" : ""
                      )}
                      style={recentSolvedGroupId === group.id ? { animationDelay: "40ms" } : undefined}
                    >
                      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-text sm:text-[1rem]">
                        {group.category}
                      </p>
                      <p className="mt-1 text-[0.72rem] leading-5 text-muted sm:text-sm sm:leading-6">
                        {group.items.join(", ")}
                      </p>
                    </div>
                  ))}

                  {progress.status !== "lost"
                    ? unsolvedTiles.map((tile) => {
                        const selected = selectedIds.has(tile.id);
                        const celebrating = celebratingTileIds.includes(tile.id);
                        const recentlySubmitted = submittedTileIds.includes(tile.id);
                        const submittedIndex = submittedTileIds.indexOf(tile.id);

                        return (
                          <button
                            key={tile.id}
                            type="button"
                            aria-pressed={selected}
                            disabled={!canInteract}
                            className={cn(
                              "min-h-[5.25rem] rounded-[0.9rem] border px-1.5 py-2 text-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:min-h-[6.5rem] sm:rounded-[1.25rem] sm:px-4 sm:py-5 sm:text-sm sm:leading-6 lg:min-h-[7rem]",
                              "text-[0.72rem] leading-[0.95rem] sm:text-sm",
                              celebrating ? "animate-tile-solve border-success/35 bg-success/10 text-text" : "",
                              selected
                                ? "scale-[0.985] border-accent bg-accent text-background shadow-glow ring-1 ring-accent/60"
                                : "border-white/10 bg-surface-strong text-text hover:border-accent/45 hover:bg-surface",
                              introHighlightTileId === tile.id ? "animate-focus-pulse" : "",
                              recentlySubmitted && boardFeedback ? "animate-tile-bounce" : ""
                            )}
                            style={
                              recentlySubmitted && submittedIndex >= 0
                                ? { animationDelay: `${submittedIndex * 45}ms` }
                                : undefined
                            }
                            onClick={() => handleToggle(tile.id)}
                          >
                            {tile.label}
                          </button>
                        );
                      })
                    : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted sm:mt-4">
                <span>Mistakes remaining:</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-3 w-3 rounded-full border border-white/20",
                        index < mistakesLeft ? "bg-accent/80" : "bg-white/10"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="h-10 px-2 text-xs sm:order-2 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={() => {
                    setSubmittedTileIds([]);
                    setBoardFeedback(null);
                    setFeedbackTone("neutral");
                    updateProgress(shuffleConnectionsTiles(progress, new Date().toISOString()));
                  }}
                  disabled={!canInteract}
                >
                  <RefreshCw className="h-4 w-4" />
                  Shuffle
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-2 text-xs sm:order-3 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={() => {
                    setSubmittedTileIds([]);
                    setBoardFeedback(null);
                    setFeedbackTone("neutral");
                    updateProgress(clearConnectionsSelection(progress));
                  }}
                  disabled={!canInteract || progress.selectedItemIds.length === 0}
                >
                  Deselect
                </Button>
                <Button
                  variant="outline"
                  className="relative h-10 overflow-hidden px-2 text-xs sm:order-1 sm:col-span-2 sm:h-11 sm:px-4 sm:text-sm"
                  onClick={handleSubmit}
                  disabled={progress.selectedItemIds.length !== 4 || !canInteract}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 rounded-lg bg-accent/20 transition-all duration-200"
                    style={{ width: `${progress.selectedItemIds.length * 25}%` }}
                  />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Submit
                  </span>
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

              {feedbackTone !== "neutral" && boardFeedback !== "one-away" ? (
                <div
                  className={cn(
                    "mt-2.5 rounded-[0.95rem] border px-3 py-2.5 text-sm leading-6 sm:mt-4 sm:rounded-[1.15rem] sm:p-4 sm:leading-7",
                    feedbackTone === "success"
                      ? "border-success/25 bg-success/10 text-text"
                      : feedbackTone === "error"
                        ? "border-error/25 bg-error/10 text-text"
                        : "border-accent/25 bg-accent-soft text-text"
                  )}
                >
                  {message}
                </div>
              ) : null}
            </div>
          </Reveal>

          {progress.status !== "playing" ? (
            <Card
              className={cn(
                "animate-solved-lift",
                progress.status === "won" ? "border-accent/25" : "border-error/25"
              )}
            >
              <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
                <CardTitle>{progress.status === "won" ? "Connections cleared" : "Out of mistakes"}</CardTitle>
                <CardDescription>
                  {progress.status === "won"
                    ? `${getCelebrationCopy("complete", progress.solvedGroupIds.length)}. You found all four groups.`
                    : "The game ends after the fourth miss. Your full guess grid is below."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-2 lg:p-6 lg:pt-3">
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    <span className="text-text">{progress.status === "won" ? "You won" : "You lost"}</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    <span className="text-text">{progress.solvedGroupIds.length}</span>
                    <span className="ml-1.5">groups</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    <span className="text-text">{progress.mistakes}</span>
                    <span className="ml-1.5">mistakes used</span>
                  </span>
                </div>

                {guessEmojiRows.length > 0 ? (
                  <div className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">Guess grid</p>
                    <div className="mt-3 font-mono text-lg leading-7 text-text" aria-label="Connections guess emoji grid">
                      {guessEmojiRows.map((row, index) => (
                        <div key={`${row}-${index}`}>{row}</div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {progress.status === "won" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {solvedGroups.map((group, index) => (
                      <div
                        key={group.id}
                        className={cn(
                          "animate-answer-reveal rounded-[1rem] border px-3 py-3 text-sm leading-6",
                          difficultyTone(group.difficulty)
                        )}
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <p className="font-medium text-text">{group.category}</p>
                        <p className="mt-1 text-muted">{group.items.join(" • ")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-muted">
                    {remainingGroups.map((group) => (
                      <div key={group.id} className={cn("rounded-xl border p-3", difficultyTone(group.difficulty))}>
                        <p className="font-medium text-text">{group.category}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{group.items.join(" • ")}</p>
                      </div>
                    ))}
                  </div>
                )}

                <BirthdayProgress compact currentGame="connections" />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="sm:w-auto" onClick={handleRestart}>
                    <RotateCcw className="h-4 w-4" />
                    Play another Connections
                  </Button>
                  <Button asChild variant="outline" className="sm:w-auto">
                    <TransitionLink href="/" direction="back">
                      <Home className="h-4 w-4" />
                      Back to Home
                    </TransitionLink>
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
