"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw, Sparkles } from "lucide-react";

import { GameMasthead } from "@/components/games/game-masthead";
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
  ConnectionsProgress,
  ConnectionsSubmitFeedback
} from "@/features/connections/game/connections-game.types";
import {
  clearConnectionsProgress,
  loadConnectionsProgress,
  saveConnectionsProgress
} from "@/features/connections/game/connections-storage";
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

function feedbackMessage(feedback: ConnectionsSubmitFeedback, gameData: ConnectionsGameData) {
  if (feedback.type === "duplicate") {
    return "You already tried that exact set of four movies.";
  }

  if (feedback.type === "one-away") {
    return "One away. Three of those titles belong together.";
  }

  if (feedback.type === "lost") {
    return "That was the fourth miss. The remaining categories are shown below.";
  }

  if (feedback.type === "solved") {
    const group = getConnectionsGroupById(gameData, feedback.groupId);
    return group ? `Solved: ${group.category}.` : "Group solved.";
  }

  return "Not quite. Try a different combination.";
}

function hasSelectionLimit(progress: ConnectionsProgress) {
  return progress.selectedItemIds.length >= 4;
}

export function ConnectionsGame({
  gameData,
  slug,
  contentVersion,
  title,
  subtitle
}: {
  gameData: ConnectionsGameData;
  slug: string;
  contentVersion: number;
  title: string;
  subtitle?: string;
}) {
  const [progress, setProgress] = useState<ConnectionsProgress>(() => createConnectionsProgress(gameData));
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [message, setMessage] = useState("Select four movie titles that belong together.");

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

  useEffect(() => {
    const saved = loadConnectionsProgress(slug, contentVersion);
    if (saved) {
      setProgress(saved);
    }

    setHasLoadedStorage(true);
  }, [contentVersion, slug]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    saveConnectionsProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, hasLoadedStorage, progress, slug]);

  function updateProgress(nextProgress: ConnectionsProgress) {
    setProgress(nextProgress);
  }

  function handleToggle(tileId: string) {
    if (!selectedIds.has(tileId) && hasSelectionLimit(progress)) {
      setMessage("You can only select four titles at a time.");
      return;
    }

    updateProgress(toggleConnectionsSelection(progress, tileId, new Date().toISOString()));
  }

  function handleSubmit() {
    if (progress.selectedItemIds.length !== 4) {
      setMessage("Choose exactly four titles before you submit.");
      return;
    }

    const result = submitConnectionsSelection({
      gameData,
      progress,
      now: new Date().toISOString()
    });

    updateProgress(result.progress);
    setMessage(feedbackMessage(result.feedback, gameData));
  }

  function handleRestart() {
    clearConnectionsProgress(slug, contentVersion);
    updateProgress(createConnectionsProgress(gameData));
    setMessage("Board reset. Fresh eyes, fresh grid.");
  }

  return (
    <section className="space-y-3 lg:space-y-5">
      <GameMasthead
        eyebrow="Movie mode"
        title={title}
        subtitle={subtitle}
        className="hidden lg:block"
        items={[
          { label: "solved", value: `${progress.solvedGroupIds.length}/4` },
          { label: "mistakes left", value: `${mistakesLeft}` }
        ]}
      />

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
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
            <span className="text-text">{progress.selectedItemIds.length}/4</span>
            <span className="ml-1.5">selected</span>
          </div>
        </div>
      </div>

      {solvedGroups.length > 0 ? (
        <div className="grid gap-2 px-2 lg:grid-cols-2 lg:gap-4 lg:px-0">
          {solvedGroups.map((group) => (
            <Card key={group.id} className={cn("border-white/10", difficultyTone(group.difficulty))}>
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
      ) : null}

      <div className="grid gap-3 px-2 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:px-0">
        <div className="space-y-3 lg:space-y-4">
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

            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
              {unsolvedTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  aria-pressed={selectedIds.has(tile.id)}
                  className={cn(
                    "aspect-square min-h-0 rounded-[0.9rem] border px-1.5 py-2 text-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:rounded-[1.25rem] sm:px-4 sm:py-5 sm:text-sm sm:leading-6",
                    "text-[0.72rem] leading-[0.95rem] sm:text-sm",
                    selectedIds.has(tile.id)
                      ? "border-accent bg-accent text-background shadow-glow"
                      : "border-white/10 bg-surface-strong text-text hover:border-accent/45 hover:bg-surface"
                  )}
                  onClick={() => handleToggle(tile.id)}
                >
                  {tile.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
              <Button
                variant="outline"
                className="h-10 px-2 text-xs sm:order-2 sm:h-11 sm:px-4 sm:text-sm"
                onClick={() => updateProgress(shuffleConnectionsTiles(progress, new Date().toISOString()))}
              >
                <RefreshCw className="h-4 w-4" />
                Shuffle
              </Button>
              <Button
                variant="outline"
                className="h-10 px-2 text-xs sm:order-3 sm:h-11 sm:px-4 sm:text-sm"
                onClick={() => updateProgress(clearConnectionsSelection(progress))}
              >
                Deselect
              </Button>
              <Button
                className="h-10 px-2 text-xs sm:order-1 sm:col-span-2 sm:h-11 sm:px-4 sm:text-sm"
                onClick={handleSubmit}
                disabled={progress.selectedItemIds.length !== 4 || progress.status !== "playing"}
              >
                <Sparkles className="h-4 w-4" />
                Submit
              </Button>
              <Button variant="ghost" className="col-span-3 h-10 text-xs sm:col-span-2 sm:h-11 sm:text-sm" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
            </div>

            <div className="mt-2.5 rounded-[0.95rem] border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-6 text-muted sm:mt-4 sm:rounded-[1.15rem] sm:p-4 sm:leading-7">
              {message}
            </div>
          </div>

          {progress.status === "lost" ? (
            <Card>
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
            <Card>
              <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-3">
                <CardTitle>Board cleared</CardTitle>
                <CardDescription>You found every category on this device.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-sm leading-6 text-muted lg:p-6 lg:pt-3 lg:leading-7">
                Shuffle and mistakes tracking stay saved locally until you restart.
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="hidden lg:block">
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
    </section>
  );
}
