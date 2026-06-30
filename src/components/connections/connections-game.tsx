"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw, Sparkles } from "lucide-react";

import { GameResultActions } from "@/components/games/game-result-actions";
import { GameHomeButton } from "@/components/games/game-home-button";
import { GameMasthead } from "@/components/games/game-masthead";
import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
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
  readLocalConnectionsStatus,
  saveConnectionsProgress
} from "@/features/connections/game/connections-storage";
import { listSeededConnectionsSummaries } from "@/features/connections/seed/placeholder-connections";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { getNextBirthdayGame } from "@/features/games/birthday-progress";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils/cn";

function difficultyTone(difficulty?: 1 | 2 | 3 | 4) {
  switch (difficulty) {
    case 1:
      return "border-arcade-green bg-arcade-green [&_p]:text-black";
    case 2:
      return "border-arcade-yellow bg-arcade-yellow [&_p]:text-black";
    case 3:
      return "border-arcade-blue bg-arcade-blue [&_p]:text-black";
    case 4:
      return "border-arcade-pink bg-arcade-pink [&_p]:text-white";
    default:
      return "border-white bg-[#111111]";
  }
}

function hasSelectionLimit(progress: ConnectionsProgress) {
  return progress.selectedItemIds.length >= 4;
}

type ConnectionsFeedbackBubble = {
  durationMs: number;
  text: string;
  tone: "error" | "info" | "success" | "warning";
};

const MISTAKE_PIP_STYLES = [
  "border-arcade-green bg-arcade-green text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]",
  "border-arcade-yellow bg-arcade-yellow text-black shadow-[0_0_12px_rgba(255,251,2,0.26)]",
  "border-arcade-blue bg-arcade-blue text-black shadow-[0_0_12px_rgba(2,241,255,0.26)]",
  "border-arcade-pink bg-arcade-pink text-white shadow-[0_0_12px_rgba(255,0,85,0.3)]"
] as const;

function getMistakePipClass(index: number, active: boolean) {
  return active
    ? MISTAKE_PIP_STYLES[index] ?? MISTAKE_PIP_STYLES[MISTAKE_PIP_STYLES.length - 1]
    : "border-white/15 bg-white/8 text-white/30";
}

function getNextConnectionsPuzzleHref({
  slug,
  nextBirthdayHref
}: {
  slug: string;
  nextBirthdayHref?: string | null;
}) {
  const boards = listSeededConnectionsSummaries();
  const currentIndex = boards.findIndex((board) => board.slug === slug);
  const orderedBoards =
    currentIndex >= 0
      ? [...boards.slice(currentIndex + 1), ...boards.slice(0, currentIndex)]
      : boards;

  const nextIncompleteBoard = orderedBoards.find(
    (board) => readLocalConnectionsStatus(board.slug, board.contentVersion) !== "completed"
  );

  if (nextIncompleteBoard) {
    return nextIncompleteBoard.href;
  }

  const chronologicalNextBoard = currentIndex >= 0 ? boards[currentIndex + 1] ?? null : null;

  return chronologicalNextBoard?.href ?? nextBirthdayHref ?? null;
}

function ConnectionsResultDialog({
  open,
  won,
  emojiRows,
  groups,
  nextHref,
  onBackToPuzzle
}: {
  open: boolean;
  won: boolean;
  emojiRows: string[];
  groups: ConnectionsGameData["groups"][number][];
  nextHref?: string | null;
  onBackToPuzzle: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connections-result-title"
        className={cn(
          "arcade-screen w-full max-w-2xl rounded-[1rem] p-5 shadow-glow",
          won ? "border-arcade-green" : "border-arcade-pink"
        )}
      >
        <p className={cn("font-display text-[0.95rem] uppercase leading-none", won ? "text-arcade-green" : "text-arcade-pink")}>
          {won ? "Connections Cleared" : "Out Of Mistakes"}
        </p>
        <h2 id="connections-result-title" className="mt-3 font-display text-[2.5rem] uppercase leading-none text-text sm:text-[3rem]">
          {won ? "You got all 4." : "Next time."}
        </h2>

        {emojiRows.length > 0 ? (
          <div className="mt-4 rounded-[0.85rem] border-2 border-white bg-[#111111] px-4 py-3">
            <p className="font-body text-[0.68rem] uppercase tracking-[0.22em] text-arcade-blue">Guess grid</p>
            <div className="mt-3 font-body text-lg leading-7 text-text" aria-label="Connections guess emoji grid">
              {emojiRows.map((row, index) => (
                <div key={`${row}-${index}`}>{row}</div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className={cn("animate-answer-reveal rounded-[0.85rem] border-2 px-3 py-3 text-center", difficultyTone(group.difficulty))}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <p className="font-display text-[1rem] uppercase tracking-[0.08em]">{group.category}</p>
              <p className="mt-1 font-body text-sm leading-6">{group.items.join(", ")}</p>
            </div>
          ))}
        </div>

        <GameResultActions nextHref={nextHref} onBackToPuzzle={onBackToPuzzle} />
      </div>
    </div>
  );
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
  const [showResultSummary, setShowResultSummary] = useState(loadState.completed);
  const [message, setMessage] = useState(
    loadState.completed
      ? "Solved board restored on this device."
      : loadState.restored
        ? "Welcome back. Your saved board is ready."
        : "Select four tiles that belong together."
  );
  const [boardFeedback, setBoardFeedback] = useState<null | "one-away" | "miss">(null);
  const [feedbackBubble, setFeedbackBubble] = useState<ConnectionsFeedbackBubble | null>(null);
  const [recentSolvedGroupId, setRecentSolvedGroupId] = useState<string | null>(null);
  const [celebratingTileIds, setCelebratingTileIds] = useState<string[]>([]);
  const [submittedTileIds, setSubmittedTileIds] = useState<string[]>([]);
  const [boardLocked, setBoardLocked] = useState(false);
  const [boardTileAnimationKey, setBoardTileAnimationKey] = useState(() =>
    loadState.restored || loadState.completed ? 0 : 1
  );

  const prefersReducedMotion = usePrefersReducedMotion();
  const birthdaySnapshot = useBirthdayProgress();
  const nextBirthdayGame = getNextBirthdayGame(birthdaySnapshot, "connections");

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
  const nextPuzzleHref = useMemo(
    () => getNextConnectionsPuzzleHref({ slug, nextBirthdayHref: nextBirthdayGame?.href ?? null }),
    [nextBirthdayGame?.href, slug]
  );

  useEffect(() => {
    saveConnectionsProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  useEffect(() => {
    if (progress.status !== "playing") {
      setShowResultSummary(true);
    }
  }, [progress.status]);

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
    if (!feedbackBubble) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackBubble(null);
    }, feedbackBubble.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedbackBubble]);

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

  function showFeedbackBubble(
    text: string,
    tone: ConnectionsFeedbackBubble["tone"],
    durationMs = tone === "success" ? 1700 : 1450
  ) {
    setFeedbackBubble({
      text,
      tone,
      durationMs
    });
  }

  function handleToggle(tileId: string) {
    if (!canInteract) {
      return;
    }

    setSubmittedTileIds([]);
    if (!selectedIds.has(tileId) && hasSelectionLimit(progress)) {
      setMessage("You can only select four tiles at a time.");
      showFeedbackBubble("Only four at a time.", "warning");
      return;
    }

    updateProgress(toggleConnectionsSelection(progress, tileId, new Date().toISOString()));
  }

  function handleSubmit() {
    if (!canInteract) {
      return;
    }

    if (progress.selectedItemIds.length !== 4) {
      setMessage("Choose exactly four tiles before you submit.");
      showFeedbackBubble("Choose exactly four.", "warning");
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

      setMessage(solvedMessage);
      setBoardFeedback(null);
      setSubmittedTileIds([]);
      showFeedbackBubble(
        result.progress.solvedGroupIds.length === gameData.groups.length
          ? "Board cleared."
          : `${solvedGroup?.category ?? "Group"} locked in.`,
        "success"
      );

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
      setMessage("One away. That combo was nearly serving.");
      showFeedbackBubble("One away...", "info", 1200);
      return;
    }

    if (result.feedback.type === "duplicate") {
      setMessage("You already tried that exact set of four tiles.");
      showFeedbackBubble("Already tried that set.", "warning");
      return;
    }

    setBoardFeedback("miss");
    setMessage(result.feedback.type === "lost" ? "That was the fourth miss. The board is over." : "Not quite. Try another combo.");
    showFeedbackBubble(result.feedback.type === "lost" ? "That was the fourth miss." : "Not quite.", result.feedback.type === "lost" ? "error" : "warning");
  }

  function handleRestart() {
    clearConnectionsProgress(slug, contentVersion);
    setProgress(createConnectionsProgress(gameData));
    setBoardFeedback(null);
    setFeedbackBubble(null);
    setRecentSolvedGroupId(null);
    setCelebratingTileIds([]);
    setSubmittedTileIds([]);
    setBoardLocked(false);
    setShowResultSummary(false);
    setBoardTileAnimationKey((current) => current + 1);
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
          actions={<GameHomeButton />}
        />
      </Reveal>

      <div className="safe-top px-2 pt-2 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-surface/90 px-3 py-2">
          <GameHomeButton className="h-9 px-3" />

          <div className="flex items-center gap-1.5 rounded-full border-2 border-white bg-black px-2.5 py-1.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[0.5rem] font-bold",
                  getMistakePipClass(index, index < mistakesLeft)
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

      <div className="grid gap-3 px-2 lg:px-0">
        <div className="space-y-3 lg:space-y-4">
          <Reveal disabled={loadState.restored || loadState.completed} delay={120}>
            <div className="rounded-[1.05rem] border border-white/10 bg-surface/90 p-2.5 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3 lg:mb-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Create four groups of four</p>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm text-muted lg:block">
                  <span className="text-text">{progress.selectedItemIds.length}/4</span>
                  <span className="ml-1.5">selected</span>
                </div>
              </div>

              <div className="relative">
                {feedbackBubble ? (
                  <div className="pointer-events-none absolute inset-x-0 -top-7 z-20 flex justify-center px-4">
                    <div className="animate-answer-reveal rounded-full border border-accent/30 bg-background/95 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-text shadow-glow">
                      <span
                        className={cn(
                          feedbackBubble.tone === "success"
                            ? "text-arcade-green"
                            : feedbackBubble.tone === "error"
                              ? "text-arcade-pink"
                              : feedbackBubble.tone === "info"
                                ? "text-arcade-blue"
                                : "text-arcade-yellow"
                        )}
                      >
                        {feedbackBubble.text}
                      </span>
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
                            key={`${boardTileAnimationKey}-${tile.id}`}
                            type="button"
                            aria-pressed={selected}
                            disabled={!canInteract}
                            className={cn(
                              "min-h-[5.25rem] rounded-[0.9rem] border px-1.5 py-2 text-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] sm:min-h-[6.5rem] sm:rounded-[1.25rem] sm:px-4 sm:py-5 sm:text-sm sm:leading-6 lg:min-h-[7rem]",
                              "text-[0.72rem] leading-[0.95rem] sm:text-sm",
                              boardTileAnimationKey > 0 ? "animate-arcade-card-enter" : "",
                              celebrating ? "animate-tile-solve border-success/35 bg-success/10 text-text" : "",
                              selected
                                ? "scale-[1.15] border-accent bg-accent text-background shadow-glow ring-1 ring-accent/60"
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

              <div className="mt-3 rounded-[0.95rem] border-2 border-white bg-[#111111] px-4 py-3 sm:mt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body text-[0.72rem] uppercase tracking-[0.22em] text-arcade-blue">Mistakes Remaining</span>
                  <span className="font-display text-[1.1rem] uppercase text-white">{mistakesLeft}/4</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[0.65rem] font-semibold uppercase",
                        getMistakePipClass(index, index < mistakesLeft)
                      )}
                      aria-hidden="true"
                    >
                      !
                    </span>
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
                    setFeedbackBubble(null);
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
                    setFeedbackBubble(null);
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
            </div>
          </Reveal>
        </div>
      </div>

      <ConnectionsResultDialog
        open={showResultSummary}
        won={progress.status === "won"}
        emojiRows={guessEmojiRows}
        groups={revealedGroups}
        nextHref={nextPuzzleHref}
        onBackToPuzzle={() => setShowResultSummary(false)}
      />

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
