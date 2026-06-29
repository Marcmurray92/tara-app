"use client";

import { ArrowLeft, ArrowRight, Home, Lock, RotateCcw, Sparkles } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";

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

const TOUCH_HOLD_DELAY_MS = 180;
const DRAG_MOVE_THRESHOLD_PX = 8;

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
        className="arcade-screen animate-answer-reveal w-full max-w-md rounded-[1rem] border-arcade-yellow p-5 shadow-glow"
      >
        <p className="font-body text-[0.72rem] uppercase tracking-[0.24em] text-arcade-blue">Fifty Shades Of Tara</p>
        <h2 id="colour-field-completion-title" className="mt-2 font-display text-[2.3rem] uppercase leading-none text-text">
          {line}
        </h2>
        <p className="mt-3 font-body text-sm leading-6 text-white">{levelTitle}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[0.85rem] border-2 border-white bg-[#111111] px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-arcade-blue">Moves</p>
            <p className="mt-2 font-display text-[1.65rem] text-text">{moves}</p>
          </div>
          <div className="rounded-[0.85rem] border-2 border-white bg-[#111111] px-3 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-arcade-blue">Best</p>
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

type DragState = {
  sourceIndex: number;
  overIndex: number | null;
};

function getTileGap(boardSize: number) {
  if (boardSize >= 12) {
    return "0.2rem";
  }

  if (boardSize >= 10) {
    return "0.28rem";
  }

  if (boardSize >= 9) {
    return "0.35rem";
  }

  return "0.45rem";
}

function getTileCornerClass(boardSize: number) {
  if (boardSize >= 12) {
    return "rounded-[0.45rem]";
  }

  if (boardSize >= 10) {
    return "rounded-[0.6rem]";
  }

  if (boardSize >= 9) {
    return "rounded-[0.72rem]";
  }

  return "rounded-[0.88rem]";
}

function getLockBadgeClass(boardSize: number) {
  if (boardSize >= 12) {
    return "h-5 w-5";
  }

  if (boardSize >= 10) {
    return "h-6 w-6";
  }

  return "h-7 w-7";
}

function getLockIconClass(boardSize: number) {
  if (boardSize >= 12) {
    return "h-2.5 w-2.5";
  }

  if (boardSize >= 10) {
    return "h-3 w-3";
  }

  return "h-3.5 w-3.5";
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
    let announcement = gameData.introLine;

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
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [boardAnimationKey, setBoardAnimationKey] = useState(() => (loadState.showPreview ? 1 : 0));
  const holdTimeoutRef = useRef<number | null>(null);
  const pointerStateRef = useRef<{
    pointerId: number;
    pointerType: string;
    sourceIndex: number;
    selectedIndexAtStart: number | null;
    startX: number;
    startY: number;
    dragActive: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

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
      setAnnouncement(gameData.introLine);
    }, level.previewDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gameData.introLine, level, showPreview]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current !== null) {
        window.clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }

      pointerStateRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (showPreview) {
      return;
    }

    setDragState(null);
  }, [showPreview]);

  useEffect(() => {
    setSelectedIndex(null);

    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    pointerStateRef.current = null;
    setDragState(null);
  }, [levelSlug]);

  const currentLevel = level;
  const currentLevelProgress = levelProgress;
  if (!currentLevel || !currentLevelProgress) {
    return null;
  }

  const activeLevel = currentLevel;
  const activeLevelProgress = currentLevelProgress;

  const levelLocked = !activeLevelProgress.unlocked;
  const completionLine =
    gameData.completionLines[
      gameData.levels.findIndex((entry) => entry.slug === activeLevel.slug) % gameData.completionLines.length
    ] ??
    gameData.completionLines[0] ??
    "Field restored.";

  function clearHoldTimeout() {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }

  function clearPointerState() {
    clearHoldTimeout();
    pointerStateRef.current = null;
    setDragState(null);
  }

  function getTilePositionFromPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY);
    const button = element?.closest<HTMLButtonElement>("[data-colour-field-position]");
    const rawPosition = button?.dataset.colourFieldPosition;

    if (!rawPosition) {
      return null;
    }

    const nextPosition = Number.parseInt(rawPosition, 10);

    return Number.isNaN(nextPosition) ? null : nextPosition;
  }

  function handleTileSwap(sourceIndex: number, targetIndex: number) {
    const result = swapColourFieldTiles({
      gameData,
      progress,
      levelSlug: activeLevel.slug,
      sourceIndex,
      targetIndex,
      now: new Date().toISOString()
    });

    setProgress(result.progress);
    setSelectedIndex(null);
    setDragState(null);

    if (result.solved) {
      setShowCompletion(true);
      setAnnouncement(`${completionLine} ${result.moves} moves.`);
      return;
    }

    setAnnouncement(`${result.moves} moves. Keep the harmony going.`);
  }

  function handleRestart() {
    const now = new Date().toISOString();

    setProgress((currentProgress) =>
      startColourFieldLevel({
        gameData,
        progress: currentProgress,
        levelSlug: activeLevel.slug,
        now,
        restart: true
      })
    );
    setSelectedIndex(null);
    clearPointerState();
    setShowCompletion(false);
    setShowPreview(true);
    setBoardAnimationKey((current) => current + 1);
    setAnnouncement("Field reset. Study the harmony.");
  }

  function handleReplayPreview() {
    setSelectedIndex(null);
    clearPointerState();
    setShowPreview(true);
    setBoardAnimationKey((current) => current + 1);
    setAnnouncement("Study the solved field.");
  }

  function handleTilePress(position: number) {
    if (showPreview || levelLocked || !activeLevelProgress.currentOrder) {
      return;
    }

    if (activeLevel.fixedTileIndexes.includes(position)) {
      setAnnouncement("Anchor tile. She stays put.");
      setSelectedIndex(null);
      return;
    }

    if (selectedIndex === null) {
      setSelectedIndex(position);
      setAnnouncement("Tile selected. Drag it into place or tap another tile.");
      return;
    }

    if (selectedIndex === position) {
      setSelectedIndex(null);
      setAnnouncement("Selection cleared.");
      return;
    }

    handleTileSwap(selectedIndex, position);
  }

  function handleTilePointerDown(event: ReactPointerEvent<HTMLButtonElement>, position: number) {
    if (showPreview || levelLocked || !activeLevelProgress.currentOrder) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStateRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      sourceIndex: position,
      selectedIndexAtStart: selectedIndex,
      startX: event.clientX,
      startY: event.clientY,
      dragActive: event.pointerType === "mouse"
    };

    if (event.pointerType === "mouse") {
      setSelectedIndex(position);
      setDragState({ sourceIndex: position, overIndex: position });
      setAnnouncement("Drag the tile where it belongs.");
      return;
    }

    clearHoldTimeout();
    holdTimeoutRef.current = window.setTimeout(() => {
      if (pointerStateRef.current?.pointerId !== event.pointerId) {
        return;
      }

      pointerStateRef.current = {
        ...pointerStateRef.current,
        dragActive: true
      };
      setSelectedIndex(position);
      setDragState({ sourceIndex: position, overIndex: position });
      setAnnouncement("Drag the tile where it belongs.");
    }, TOUCH_HOLD_DELAY_MS);
  }

  function handleTilePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointerState = pointerStateRef.current;

    if (!pointerState || pointerState.pointerId !== event.pointerId || !pointerState.dragActive) {
      return;
    }

    const nextOverIndex = getTilePositionFromPoint(event.clientX, event.clientY);
    const travelledDistance = Math.hypot(event.clientX - pointerState.startX, event.clientY - pointerState.startY);

    if (travelledDistance < DRAG_MOVE_THRESHOLD_PX && nextOverIndex === pointerState.sourceIndex) {
      return;
    }

    setDragState((currentDragState) => {
      if (
        currentDragState?.sourceIndex === pointerState.sourceIndex &&
        currentDragState.overIndex === nextOverIndex
      ) {
        return currentDragState;
      }

      return {
        sourceIndex: pointerState.sourceIndex,
        overIndex: nextOverIndex
      };
    });
  }

  function handleTilePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointerState = pointerStateRef.current;

    if (!pointerState || pointerState.pointerId !== event.pointerId) {
      return;
    }

    suppressClickRef.current = true;
    clearHoldTimeout();

    if (!pointerState.dragActive) {
      pointerStateRef.current = null;
      handleTilePress(pointerState.sourceIndex);
      return;
    }

    const releaseTarget =
      getTilePositionFromPoint(event.clientX, event.clientY) ?? dragState?.overIndex ?? pointerState.sourceIndex;
    pointerStateRef.current = null;
    setDragState(null);

    if (
      releaseTarget !== null &&
      releaseTarget !== pointerState.sourceIndex &&
      !activeLevel.fixedTileIndexes.includes(releaseTarget)
    ) {
      handleTileSwap(pointerState.sourceIndex, releaseTarget);
      return;
    }

    if (
      pointerState.selectedIndexAtStart !== null &&
      pointerState.selectedIndexAtStart !== pointerState.sourceIndex
    ) {
      handleTileSwap(pointerState.selectedIndexAtStart, pointerState.sourceIndex);
      return;
    }

    setSelectedIndex(pointerState.sourceIndex);
    setAnnouncement("Tile selected. Drag it into place or tap another tile.");
  }

  function handleTilePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    if (pointerStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    clearPointerState();
  }

  const tileAnimationStyleFor = (position: number) => ({
    animationDelay: `${Math.min(position * 22, 286)}ms`
  });

  const previewMessage = showPreview ? "Study the solved field before it scrambles." : announcement;
  const boardLabel = dragState ? "Drag active. Release over another tile to swap." : previewMessage;

  function handleTileClick(event: ReactMouseEvent<HTMLButtonElement>, position: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (event.detail === 0) {
      handleTilePress(position);
    }
  }

  const solvedOrder = getSolvedColourFieldOrder(activeLevel);
  const activeOrder = showPreview
    ? solvedOrder
    : activeLevelProgress.currentOrder ?? (activeLevelProgress.completedAt ? solvedOrder : null);
  const boardTiles = activeOrder ? getColourFieldLevelBoard(activeLevel, activeOrder) : [];
  const currentMoves = activeLevelProgress.currentMoves;
  const boardSize = Math.max(activeLevel.columns, activeLevel.rows);
  const tileGap = getTileGap(boardSize);
  const tileCornerClass = getTileCornerClass(boardSize);
  const lockBadgeClass = getLockBadgeClass(boardSize);
  const lockIconClass = getLockIconClass(boardSize);

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
                  {activeLevel.title}
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
              <span className="text-text">{activeLevel.fixedTileIndexes.length}</span> anchors
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
                  <div className="mx-auto w-full max-w-[min(100vw-1rem,34rem)]">
                    <div
                      className="grid gap-2"
                      style={{
                        gap: tileGap,
                        gridTemplateColumns: `repeat(${activeLevel.columns}, minmax(0, 1fr))`
                      }}
                    >
                      {boardTiles.map((tile) => (
                        <button
                          key={`${boardAnimationKey}-${tile.position}`}
                          type="button"
                          data-colour-field-tile="true"
                          data-colour-field-position={tile.position}
                          onClick={(event) => handleTileClick(event, tile.position)}
                          onPointerDown={(event) => handleTilePointerDown(event, tile.position)}
                          onPointerMove={handleTilePointerMove}
                          onPointerUp={handleTilePointerUp}
                          onPointerCancel={handleTilePointerCancel}
                          onLostPointerCapture={handleTilePointerCancel}
                          onContextMenu={(event) => event.preventDefault()}
                          disabled={showPreview || tile.locked}
                          aria-label={`Tile row ${tile.row + 1}, column ${tile.column + 1}${tile.locked ? ", anchor" : ""}`}
                          className={cn(
                            "group relative aspect-square touch-none overflow-visible bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            tileCornerClass,
                            boardAnimationKey > 0 ? "animate-colour-field-tile-enter" : "",
                            tile.locked
                              ? "cursor-default"
                              : "active:scale-[0.985]",
                            selectedIndex === tile.position
                              ? "z-10 animate-focus-pulse ring-2 ring-accent ring-offset-2 ring-offset-background"
                              : "",
                            dragState?.overIndex === tile.position && dragState.sourceIndex !== tile.position && !tile.locked
                              ? "ring-2 ring-white/70 ring-offset-2 ring-offset-background"
                              : ""
                          )}
                          style={{
                            ...tileAnimationStyleFor(tile.position)
                          }}
                        >
                          <span
                            className={cn(
                              "absolute inset-0 border transition-[transform,box-shadow,filter] duration-200",
                              tileCornerClass,
                              tile.locked
                                ? "border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                : "border-white/10",
                              selectedIndex === tile.position
                                ? "animate-colour-field-selected shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
                                : "",
                              dragState?.sourceIndex !== tile.position && dragState && !tile.locked
                                ? "group-hover:brightness-105"
                                : ""
                            )}
                            style={{ backgroundColor: tile.color }}
                          >
                            {tile.locked ? (
                              <span className="absolute inset-0 flex items-center justify-center text-white/92">
                                <span
                                  className={cn(
                                    "inline-flex items-center justify-center rounded-full bg-black/20 backdrop-blur-[1px]",
                                    lockBadgeClass
                                  )}
                                >
                                  <Lock className={lockIconClass} />
                                </span>
                              </span>
                            ) : null}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  aria-live="polite"
                  className="rounded-[1.2rem] border border-white/10 bg-surface/75 px-4 py-3 text-center text-sm leading-6 text-muted"
                >
                  {boardLabel}
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
        levelTitle={activeLevel.title}
        moves={activeLevelProgress.lastMoves ?? activeLevelProgress.currentMoves}
        bestMoves={activeLevelProgress.bestMoves}
        nextLevelSlug={nextLevel?.slug ?? null}
        onReplay={handleRestart}
      />
    </>
  );
}
