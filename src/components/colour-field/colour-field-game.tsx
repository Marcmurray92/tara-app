"use client";

import { ArrowLeft, ArrowRight, Home, Lock, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  createColourFieldProgress,
  getColourFieldLevel,
  getColourFieldLevelBoard,
  getColourFieldLevelProgress,
  getCompletedColourFieldCount,
  getNextColourFieldLevel,
  getPreviousColourFieldLevel,
  getSolvedColourFieldOrder,
  isColourFieldLevelSolved,
  normaliseColourFieldProgress,
  startColourFieldLevel,
  swapColourFieldTiles
} from "@/features/colour-field/game/colour-field-engine";
import type { ColourFieldGameData } from "@/features/colour-field/game/colour-field-game.types";
import {
  loadColourFieldProgress,
  saveColourFieldProgress
} from "@/features/colour-field/game/colour-field-storage";
import { cn } from "@/lib/utils/cn";

function CompletionDialog({
  open,
  line,
  levelTitle,
  moves,
  bestMoves,
  nextLevelSlug,
  onReplay
}: {
  open: boolean;
  line: string;
  levelTitle: string;
  moves: number;
  bestMoves: number | null;
  nextLevelSlug?: string | null;
  onReplay: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="colour-field-completion-title"
        className="animate-answer-reveal w-full max-w-md rounded-[1.7rem] border border-accent/20 bg-surface-strong p-5 shadow-glow"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Colour Field</p>
        <h2 id="colour-field-completion-title" className="mt-2 font-display text-[2rem] leading-none text-text">
          {line}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{levelTitle}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[1rem] border border-white/10 bg-black/20 px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Moves</p>
            <p className="mt-2 font-display text-[1.65rem] text-text">{moves}</p>
          </div>
          <div className="rounded-[1rem] border border-white/10 bg-black/20 px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Best</p>
            <p className="mt-2 font-display text-[1.65rem] text-text">{bestMoves ?? moves}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {nextLevelSlug ? (
            <Button asChild>
              <TransitionLink href={`/games/colour-field/${nextLevelSlug}`} direction="forward">
                Next field
                <ArrowRight className="h-4 w-4" />
              </TransitionLink>
            </Button>
          ) : (
            <Button asChild>
              <TransitionLink href="/" direction="back">
                <Home className="h-4 w-4" />
                Back to Home
              </TransitionLink>
            </Button>
          )}

          <Button onClick={onReplay} variant="outline">
            <RotateCcw className="h-4 w-4" />
            Replay
          </Button>

          <Button asChild variant="ghost">
            <TransitionLink href="/games/colour-field" direction="back">Back to pack</TransitionLink>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ColourFieldGame({
  packSlug,
  contentVersion,
  gameData,
  levelSlug
}: {
  packSlug: string;
  contentVersion: number;
  gameData: ColourFieldGameData;
  levelSlug: string;
}) {
  const level = getColourFieldLevel(gameData, levelSlug);
  const [loadState] = useState(() => {
    const now = new Date().toISOString();
    let progress = normaliseColourFieldProgress(
      gameData,
      loadColourFieldProgress(packSlug, contentVersion) ?? createColourFieldProgress(gameData)
    );
    let showPreview = false;
    let announcement = "Tap a tile. Tap another tile. Rebuild the gradient.";

    if (level) {
      const levelProgress = progress.levels[level.slug];

      if (levelProgress?.unlocked && !levelProgress.currentOrder && !levelProgress.completedAt) {
        progress = startColourFieldLevel({
          gameData,
          progress,
          levelSlug,
          now
        });
        showPreview = true;
        announcement = "Study the solved field.";
      } else if (levelProgress?.currentOrder && !isColourFieldLevelSolved(levelProgress.currentOrder)) {
        announcement = "Welcome back. Your field is mid-spell.";
      } else if (levelProgress?.completedAt) {
        announcement = "Field already restored. Replay whenever.";
      }
    }

    return {
      progress,
      showPreview,
      announcement
    };
  });
  const [progress, setProgress] = useState(loadState.progress);
  const [showPreview, setShowPreview] = useState(loadState.showPreview);
  const [announcement, setAnnouncement] = useState(loadState.announcement);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const levelProgress = useMemo(
    () => (level ? getColourFieldLevelProgress(gameData, progress, level.slug) : null),
    [gameData, level, progress]
  );
  const previousLevel = useMemo(
    () => (level ? getPreviousColourFieldLevel(gameData, level.slug) : null),
    [gameData, level]
  );
  const nextLevel = useMemo(
    () => (level ? getNextColourFieldLevel(gameData, level.slug) : null),
    [gameData, level]
  );
  const completedCount = useMemo(() => getCompletedColourFieldCount(gameData, progress), [gameData, progress]);

  useEffect(() => {
    saveColourFieldProgress({
      slug: packSlug,
      contentVersion,
      progress
    });
  }, [contentVersion, packSlug, progress]);

  useEffect(() => {
    if (!showPreview || !level) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPreview(false);
      setAnnouncement("Tap a tile. Tap another tile. Rebuild the gradient.");
    }, level.previewDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [level, showPreview]);

  if (!level || !levelProgress) {
    return null;
  }

  const currentLevel = level;
  const currentLevelProgress = levelProgress;
  const levelLocked = !currentLevelProgress.unlocked;
  const solvedOrder = getSolvedColourFieldOrder(currentLevel);
  const activeOrder = showPreview
    ? solvedOrder
    : currentLevelProgress.currentOrder ?? (currentLevelProgress.completedAt ? solvedOrder : null);
  const boardTiles = activeOrder ? getColourFieldLevelBoard(currentLevel, activeOrder) : [];
  const currentMoves = currentLevelProgress.currentMoves;
  const completionLine =
    gameData.completionLines[
      gameData.levels.findIndex((entry) => entry.slug === currentLevel.slug) % gameData.completionLines.length
    ] ??
    gameData.completionLines[0] ??
    "Field restored.";

  function handleRestart() {
    const now = new Date().toISOString();

    setProgress((currentProgress) =>
      startColourFieldLevel({
        gameData,
        progress: currentProgress,
        levelSlug: currentLevel.slug,
        now,
        restart: true
      })
    );
    setSelectedIndex(null);
    setShowCompletion(false);
    setShowPreview(true);
    setAnnouncement("Field reset. Study the harmony.");
  }

  function handleReplayPreview() {
    setSelectedIndex(null);
    setShowPreview(true);
    setAnnouncement("Study the solved field.");
  }

  function handleTilePress(position: number) {
    if (showPreview || levelLocked || !currentLevelProgress.currentOrder) {
      return;
    }

    if (currentLevel.fixedTileIndexes.includes(position)) {
      setAnnouncement("Anchor tile. She stays put.");
      setSelectedIndex(null);
      return;
    }

    if (selectedIndex === null) {
      setSelectedIndex(position);
      setAnnouncement("Tile selected. Pick where it should go.");
      return;
    }

    if (selectedIndex === position) {
      setSelectedIndex(null);
      setAnnouncement("Selection cleared.");
      return;
    }

    const result = swapColourFieldTiles({
      gameData,
      progress,
      levelSlug: currentLevel.slug,
      sourceIndex: selectedIndex,
      targetIndex: position,
      now: new Date().toISOString()
    });

    setProgress(result.progress);
    setSelectedIndex(null);

    if (result.solved) {
      setShowCompletion(true);
      setAnnouncement(`${completionLine} ${result.moves} moves.`);
      return;
    }

    setAnnouncement(`${result.moves} moves. Keep the harmony going.`);
  }

  return (
    <>
      <section className="min-h-[100svh] px-2 py-2 sm:px-3 sm:py-3">
        <div className="mx-auto flex min-h-[calc(100svh-1rem)] max-w-xl flex-col gap-3">
          <div className="flex items-center justify-between gap-2 rounded-[1.25rem] border border-white/10 bg-surface/90 px-2.5 py-2.5 shadow-glow">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-10 w-10 rounded-full p-0">
                <TransitionLink href={previousLevel ? `/games/colour-field/${previousLevel.slug}` : "/games/colour-field"} direction="back">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">{previousLevel ? "Previous field" : "Back to pack"}</span>
                </TransitionLink>
              </Button>
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">Colour Field</p>
                <h1 data-page-title="true" tabIndex={-1} className="truncate font-display text-[1.35rem] leading-tight text-text">
                  {currentLevel.title}
                </h1>
              </div>
            </div>

            <Button variant="outline" size="sm" className="h-10 rounded-full px-3" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-muted">
              <span className="text-text">{completedCount}</span> / {gameData.levels.length}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-muted">
              <span className="text-text">{currentMoves}</span> moves
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-muted">
              <span className="text-text">{currentLevel.fixedTileIndexes.length}</span> anchors
            </div>
          </div>

          {levelLocked ? (
            <div className="rounded-[1.45rem] border border-white/10 bg-surface/90 p-5 text-center shadow-glow">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Locked</p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-text">Clear the earlier fields first.</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                This one opens once the previous colour field is restored.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild>
                  <TransitionLink href="/games/colour-field" direction="back">Back to pack</TransitionLink>
                </Button>
                <Button asChild variant="outline">
                  <TransitionLink href="/" direction="back">
                    <Home className="h-4 w-4" />
                    Home
                  </TransitionLink>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex flex-1 flex-col gap-3"
                onClick={(event) => {
                  if (event.target === event.currentTarget && selectedIndex !== null) {
                    setSelectedIndex(null);
                    setAnnouncement("Selection cleared.");
                  }
                }}
              >
                <div className="rounded-[1.55rem] border border-white/10 bg-surface/90 p-3 shadow-glow">
                  <div className="mx-auto w-full max-w-[min(100vw-1.75rem,26rem)]">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${currentLevel.columns}, minmax(0, 1fr))`
                      }}
                    >
                      {boardTiles.map((tile) => (
                        <button
                          key={tile.position}
                          type="button"
                          onClick={() => handleTilePress(tile.position)}
                          disabled={showPreview || tile.locked}
                          aria-label={`Tile row ${tile.row + 1}, column ${tile.column + 1}${tile.locked ? ", anchor" : ""}`}
                          className={cn(
                            "relative aspect-square rounded-[0.95rem] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            tile.locked
                              ? "cursor-default border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                              : "border-white/10 active:scale-[0.985]",
                            selectedIndex === tile.position ? "animate-focus-pulse ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
                          )}
                          style={{ backgroundColor: tile.color }}
                        >
                          {tile.locked ? (
                            <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-white/90">
                              <Lock className="h-3 w-3" />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  aria-live="polite"
                  className="rounded-[1.2rem] border border-white/10 bg-surface/75 px-4 py-3 text-center text-sm leading-6 text-muted"
                >
                  {showPreview ? "Study the solved field before it scrambles." : announcement}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-11 rounded-[1rem] text-xs uppercase tracking-[0.16em]" onClick={handleReplayPreview}>
                  <Sparkles className="h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" className="h-11 rounded-[1rem] text-xs uppercase tracking-[0.16em]" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-[1rem] text-xs uppercase tracking-[0.16em]">
                  <TransitionLink href="/games/colour-field" direction="back">Pack</TransitionLink>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <CompletionDialog
        open={showCompletion}
        line={completionLine}
        levelTitle={currentLevel.title}
        moves={currentLevelProgress.lastMoves ?? currentLevelProgress.currentMoves}
        bestMoves={currentLevelProgress.bestMoves}
        nextLevelSlug={nextLevel?.slug ?? null}
        onReplay={handleRestart}
      />
    </>
  );
}
