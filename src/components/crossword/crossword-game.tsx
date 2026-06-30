"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { GameHomeButton } from "@/components/games/game-home-button";
import { BirthdayProgress } from "@/components/games/birthday-progress";
import { CrosswordClueList } from "@/components/crossword/crossword-clue-list";
import { CrosswordCompletionDialog } from "@/components/crossword/crossword-completion-dialog";
import { CrosswordConfirmDialog } from "@/components/crossword/crossword-confirm-dialog";
import { CrosswordCurrentClue } from "@/components/crossword/crossword-current-clue";
import { CrosswordGrid } from "@/components/crossword/crossword-grid";
import { CrosswordStatusDialog } from "@/components/crossword/crossword-status-dialog";
import { CrosswordTouchKeyboard } from "@/components/crossword/crossword-touch-keyboard";
import { CrosswordToolbar } from "@/components/crossword/crossword-toolbar";
import { GameMasthead } from "@/components/games/game-masthead";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import type {
  CrosswordCompiledData,
  CrosswordCompiledEntry,
  CrosswordProgress
} from "@/features/crossword/game/crossword-game.types";
import {
  backspaceCell,
  checkCurrentLetter,
  checkCurrentWord,
  checkPuzzle,
  clearCurrentWord,
  clearEntirePuzzle,
  createEmptyProgress,
  deleteCell,
  getEntryCells,
  getFirstSelection,
  getEntryForSelection,
  getOrderedEntries,
  isEntryFilled,
  isCrosswordFilled,
  moveGeometrically,
  revealCurrentLetter,
  revealCurrentWord,
  revealPuzzle,
  selectCell,
  selectEntry,
  setCellValue,
  toggleSelectionDirection
} from "@/features/crossword/game/crossword-engine";
import {
  clearCrosswordProgress,
  loadCrosswordProgress,
  saveCrosswordProgress
} from "@/features/crossword/game/crossword-storage";
import { getCelebrationCopy } from "@/features/games/celebration-copy";
import { formatDuration } from "@/lib/utils/strings";

type PendingAction =
  | "reveal-letter"
  | "reveal-word"
  | "reveal-puzzle"
  | "clear-word"
  | "clear-puzzle"
  | "reset-progress";

function createWaveDelays(coords: Array<{ row: number; column: number }>) {
  const delays: Record<string, number> = {};

  coords.forEach(({ row, column }, index) => {
    delays[`${row},${column}`] = index * 40;
  });

  return delays;
}

export function CrosswordGame({
  puzzle,
  slug,
  contentVersion,
  title = "Tara's Birthday Crossword"
}: {
  puzzle: CrosswordCompiledData;
  slug: string;
  contentVersion: number;
  title?: string;
  subtitle?: string | null;
  eyebrow?: string;
}) {
  const [loadState] = useState(() => {
    const defaultSelection = getFirstSelection(puzzle);

    if (typeof window === "undefined") {
      return {
        progress: createEmptyProgress(puzzle),
        restored: false,
        completed: false
      };
    }

    const savedProgress = loadCrosswordProgress(slug, contentVersion);

    return {
      progress: savedProgress
        ? {
            ...savedProgress,
            selection: defaultSelection
          }
        : createEmptyProgress(puzzle),
      restored: Boolean(savedProgress?.startedAt && !savedProgress?.completedAt),
      completed: Boolean(savedProgress?.completedAt)
    };
  });
  const [progress, setProgress] = useState<CrosswordProgress>(loadState.progress);
  const [announcement, setAnnouncement] = useState(
    loadState.completed
      ? "Completed crossword restored."
      : loadState.restored
        ? "Saved crossword progress restored."
        : "Crossword ready."
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [showCompletion, setShowCompletion] = useState(Boolean(progress.completedAt));
  const [showNotQuite, setShowNotQuite] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pulsingCellKey, setPulsingCellKey] = useState<string | null>(null);
  const [animatedCellDelays, setAnimatedCellDelays] = useState<Record<string, number>>({});
  const previouslyFilledRef = useRef(isCrosswordFilled(puzzle, loadState.progress));

  const orderedEntries = useMemo(() => getOrderedEntries(puzzle), [puzzle]);
  const activeEntry = useMemo(() => getEntryForSelection(puzzle, progress.selection), [progress.selection, puzzle]);
  const acrossEntries = orderedEntries.filter((entry) => entry.direction === "across");
  const downEntries = orderedEntries.filter((entry) => entry.direction === "down");
  const activeDirection = progress.selection?.direction ?? activeEntry?.direction ?? "across";
  const puzzleFilled = useMemo(() => isCrosswordFilled(puzzle, progress), [progress, puzzle]);
  const introCellKey = !progress.startedAt && progress.selection ? `${progress.selection.row},${progress.selection.column}` : null;
  const statusLabel = progress.completedAt ? "Victory lap" : progress.startedAt ? "Continue" : "Fresh grid";
  const timerLabel = useMemo(() => {
    if (!progress.startedAt) {
      return "00:00";
    }

    const elapsedTime = progress.completedAt
      ? Date.parse(progress.completedAt) - Date.parse(progress.startedAt)
      : progress.elapsedMilliseconds;

    return formatDuration(elapsedTime);
  }, [progress.completedAt, progress.elapsedMilliseconds, progress.startedAt]);

  useEffect(() => {
    saveCrosswordProgress({
      slug,
      contentVersion,
      progress
    });
  }, [contentVersion, progress, slug]);

  useEffect(() => {
    if (!progress.startedAt || progress.completedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => ({
        ...current,
        elapsedMilliseconds: current.startedAt ? Date.now() - Date.parse(current.startedAt) : current.elapsedMilliseconds
      }));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [progress.completedAt, progress.startedAt]);

  useEffect(() => {
    if (progress.completedAt) {
      setShowCompletion(true);
    }
  }, [progress.completedAt]);

  useEffect(() => {
    if (!pulsingCellKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPulsingCellKey(null);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pulsingCellKey]);

  useEffect(() => {
    if (Object.keys(animatedCellDelays).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAnimatedCellDelays({});
    }, 880);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [animatedCellDelays]);

  useEffect(() => {
    if (typeof window === "undefined" || !progress.selection) {
      return;
    }

    const cellKey = `${progress.selection.row},${progress.selection.column}`;

    window.requestAnimationFrame(() => {
      const matchingCells = Array.from(document.querySelectorAll<HTMLElement>(`[data-crossword-cell="${cellKey}"]`));
      const visibleCell = matchingCells.find((cell) => cell.offsetParent !== null) ?? matchingCells[0];
      visibleCell?.focus({ preventScroll: true });
    });
  }, [progress.selection]);

  useEffect(() => {
    if (puzzleFilled && !previouslyFilledRef.current && !progress.completedAt) {
      setShowNotQuite(true);
      setAnnouncement("Not quite. A few letters still need work.");
    }

    if (!puzzleFilled) {
      setShowNotQuite(false);
    }

    previouslyFilledRef.current = puzzleFilled;
  }, [progress.completedAt, puzzleFilled]);

  function updateProgress(nextProgress: CrosswordProgress) {
    setProgress(nextProgress);
  }

  function focusKeyboard(selection = progress.selection) {
    if (typeof window === "undefined" || !selection) {
      return;
    }

    const cellKey = `${selection.row},${selection.column}`;

    window.requestAnimationFrame(() => {
      const matchingCells = Array.from(document.querySelectorAll<HTMLElement>(`[data-crossword-cell="${cellKey}"]`));
      const visibleCell = matchingCells.find((cell) => cell.offsetParent !== null) ?? matchingCells[0];
      visibleCell?.focus({ preventScroll: true });
    });
  }

  function announceEntrySelection(entry: CrosswordCompiledEntry | null) {
    if (!entry) {
      return;
    }

    setAnnouncement(`${entry.number} ${entry.direction}. ${entry.clue}`);
  }

  function moveToDirectionalAdjacentClue(currentProgress: CrosswordProgress, step: -1 | 1) {
    const currentDirection =
      currentProgress.selection?.direction ??
      getEntryForSelection(puzzle, currentProgress.selection)?.direction ??
      "across";
    const directionalEntries = orderedEntries.filter((entry) => entry.direction === currentDirection);
    const activeDirectionalEntry = getEntryForSelection(puzzle, currentProgress.selection) ?? directionalEntries[0];

    if (!activeDirectionalEntry || directionalEntries.length === 0) {
      return currentProgress;
    }

    const currentIndex = directionalEntries.findIndex((entry) => entry.id === activeDirectionalEntry.id);
    const hasUnfilledEntries = directionalEntries.some((entry) => !isEntryFilled(puzzle, currentProgress, entry));

    for (let offset = 1; offset <= directionalEntries.length; offset += 1) {
      const nextIndex = (currentIndex + step * offset + directionalEntries.length) % directionalEntries.length;
      const nextEntry = directionalEntries[nextIndex];

      if (!nextEntry) {
        continue;
      }

      if (hasUnfilledEntries && isEntryFilled(puzzle, currentProgress, nextEntry)) {
        continue;
      }

      const firstEmptyCell = getEntryCells(nextEntry).find(
        ({ row, column }) => !currentProgress.cells[row]?.[column]?.value
      );
      const targetCell = firstEmptyCell ?? getEntryCells(nextEntry)[0];

      if (!targetCell) {
        return currentProgress;
      }

      return {
        ...currentProgress,
        selection: {
          row: targetCell.row,
          column: targetCell.column,
          direction: nextEntry.direction
        }
      };
    }

    return currentProgress;
  }

  function handleMoveClue(step: -1 | 1) {
    const nextProgress = moveToDirectionalAdjacentClue(progress, step);
    updateProgress(nextProgress);
    announceEntrySelection(getEntryForSelection(puzzle, nextProgress.selection));
    focusKeyboard(nextProgress.selection);
  }

  function handleSelectEntry(entry: CrosswordCompiledEntry) {
    const nextProgress = selectEntry(progress, entry);
    updateProgress(nextProgress);
    announceEntrySelection(entry);
    focusKeyboard(nextProgress.selection);
  }

  function applyInput(value: string) {
    if (!value) {
      return;
    }

    const selectionBefore = progress.selection ? { ...progress.selection } : null;
    const normalizedValue = value.slice(-1).toUpperCase();
    const nextProgress = setCellValue({
      puzzle,
      progress,
      value: normalizedValue,
      now: new Date().toISOString()
    });

    if (selectionBefore) {
      const cellKey = `${selectionBefore.row},${selectionBefore.column}`;
      setPulsingCellKey(cellKey);
    }

    if (!progress.completedAt && nextProgress.completedAt) {
      setAnimatedCellDelays(
        createWaveDelays(
          puzzle.cells.flatMap((row) =>
            row.filter((cell) => cell.solution).map((cell) => ({
              row: cell.row,
              column: cell.column
            }))
          )
        )
      );
      setAnnouncement(`${getCelebrationCopy("complete", puzzle.entries.length)}. Crossword complete.`);
    }

    updateProgress(nextProgress);
    focusKeyboard(nextProgress.selection);
  }

  function handleBackspace() {
    const nextProgress = backspaceCell({ puzzle, progress, now: new Date().toISOString() });
    updateProgress(nextProgress);
    focusKeyboard(nextProgress.selection);
  }

  function handleDelete() {
    const nextProgress = deleteCell({ puzzle, progress, now: new Date().toISOString() });
    updateProgress(nextProgress);
    focusKeyboard(nextProgress.selection);
  }

  function handleToggleDirection() {
    const nextProgress = toggleSelectionDirection(progress, puzzle);
    updateProgress(nextProgress);
    setAnnouncement(`Direction switched to ${activeDirection === "across" ? "down" : "across"}.`);
    focusKeyboard(nextProgress.selection);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      handleBackspace();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      handleDelete();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateProgress(moveGeometrically(puzzle, progress, 0, -1, "across"));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateProgress(moveGeometrically(puzzle, progress, 0, 1, "across"));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      updateProgress(moveGeometrically(puzzle, progress, -1, 0, "down"));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      updateProgress(moveGeometrically(puzzle, progress, 1, 0, "down"));
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const nextProgress = moveToDirectionalAdjacentClue(progress, event.shiftKey ? -1 : 1);
      updateProgress(nextProgress);
      announceEntrySelection(getEntryForSelection(puzzle, nextProgress.selection));
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      handleToggleDirection();
      return;
    }

    if (/^[a-z0-9]$/i.test(event.key)) {
      event.preventDefault();
      applyInput(event.key);
    }
  }

  function handleCheckLetter() {
    const result = checkCurrentLetter(puzzle, progress);
    updateProgress(result.progress);
    setAnnouncement(result.incorrectCount > 0 ? "Current letter is incorrect." : "Current letter is correct.");
  }

  function handleCheckWord() {
    const result = checkCurrentWord(puzzle, progress);
    updateProgress(result.progress);
    setAnnouncement(result.incorrectCount > 0 ? "Current word contains mistakes." : "Current word is correct so far.");
  }

  function handleCheckPuzzle() {
    const result = checkPuzzle(puzzle, progress);
    updateProgress(result.progress);
    if (result.incorrectCount > 0 && puzzleFilled) {
      setShowNotQuite(true);
    }
    setAnnouncement(result.incorrectCount > 0 ? "Puzzle check found incorrect letters." : "No incorrect filled letters found.");
  }

  function confirmPendingAction() {
    const now = new Date().toISOString();

    if (pendingAction === "reveal-letter") {
      updateProgress(revealCurrentLetter(puzzle, progress, now));
      setAnnouncement("Current letter revealed.");
    }

    if (pendingAction === "reveal-word") {
      updateProgress(revealCurrentWord(puzzle, progress, now));
      setAnnouncement("Current word revealed.");
    }

    if (pendingAction === "reveal-puzzle") {
      updateProgress(revealPuzzle(puzzle, progress, now));
      setAnnouncement("Entire puzzle revealed.");
    }

    if (pendingAction === "clear-word") {
      updateProgress(clearCurrentWord(puzzle, progress, now));
      setAnnouncement("Current word cleared.");
    }

    if (pendingAction === "clear-puzzle") {
      updateProgress(clearEntirePuzzle(puzzle, progress, now));
      setAnnouncement("Checked incorrect letters cleared.");
    }

    if (pendingAction === "reset-progress") {
      clearCrosswordProgress(slug, contentVersion);
      updateProgress(createEmptyProgress(puzzle));
      setAnnouncement("Local crossword progress reset.");
      setShowCompletion(false);
      setShowNotQuite(false);
    }

    setPendingAction(null);
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <h1 data-page-title="true" tabIndex={-1} className="sr-only lg:hidden">
        {title}
      </h1>

      <section className="lg:hidden">
        <div className="flex h-[100svh] flex-col overflow-x-hidden bg-background">
          <div className="safe-top border-b border-white/10 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-2 py-1.5">
              <GameHomeButton className="h-9 px-3" />

              <div className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-[0.95rem] font-semibold text-text">
                {timerLabel}
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface/90 text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="Open crossword menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="fixed inset-0 z-[100] bg-black/55">
              <button
                type="button"
                className="absolute inset-0"
                aria-label="Close crossword menu"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute inset-x-2 top-[calc(env(safe-area-inset-top)+0.75rem)] bottom-2 z-[110] overflow-y-auto rounded-[1.1rem] border border-white/10 bg-surface-strong p-3 shadow-glow">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Crossword options</p>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close crossword menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">Navigate</p>
                    <GameHomeButton className="h-8 px-2 text-[0.75rem]" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">Check</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          handleCheckLetter();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Letter
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          handleCheckWord();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Word
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          handleCheckPuzzle();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Puzzle
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">Reveal</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("reveal-letter");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Letter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("reveal-word");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Word
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("reveal-puzzle");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Puzzle
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">Clear</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("clear-word");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Word
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("clear-puzzle");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Puzzle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={() => {
                          setPendingAction("reset-progress");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <details className="rounded-[0.95rem] border border-white/10 bg-black/20 p-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-text">Across clues</summary>
                    <div className="mt-3 max-h-56 overflow-y-auto pr-1">
                      <CrosswordClueList
                        title="Across"
                        entries={acrossEntries}
                        activeEntryId={activeEntry?.id}
                        className="border-0 bg-transparent p-0"
                        showHeading={false}
                        onSelectEntry={(entry) => {
                          handleSelectEntry(entry);
                          setMobileMenuOpen(false);
                        }}
                      />
                    </div>
                  </details>

                  <details className="rounded-[0.95rem] border border-white/10 bg-black/20 p-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-text">Down clues</summary>
                    <div className="mt-3 max-h-56 overflow-y-auto pr-1">
                      <CrosswordClueList
                        title="Down"
                        entries={downEntries}
                        activeEntryId={activeEntry?.id}
                        className="border-0 bg-transparent p-0"
                        showHeading={false}
                        onSelectEntry={(entry) => {
                          handleSelectEntry(entry);
                          setMobileMenuOpen(false);
                        }}
                      />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-hidden">
              <CrosswordGrid
                puzzle={puzzle}
                progress={progress}
                compact
                pulsingCellKey={pulsingCellKey}
                introCellKey={introCellKey}
                animatedCellDelays={animatedCellDelays}
                onSelectCell={(row, column) => {
                  updateProgress(selectCell(puzzle, progress, row, column));
                }}
              />
            </div>

            <div className="shrink-0">
              <CrosswordCurrentClue
                entry={activeEntry}
                direction={activeDirection}
                compact
                onPrevious={() => handleMoveClue(-1)}
                onNext={() => handleMoveClue(1)}
                onToggleDirection={handleToggleDirection}
              />
            </div>

            <div className="shrink-0">
              <CrosswordTouchKeyboard
                compact
                onKeyPress={applyInput}
                onBackspace={handleBackspace}
                onOpenMenu={() => setMobileMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Reveal disabled={loadState.restored || loadState.completed} delay={40}>
            <GameMasthead
              title={title}
              items={[
                { label: "status", value: statusLabel },
                { label: "elapsed", value: timerLabel }
              ]}
              actions={
                <>
                  <GameHomeButton />
                  <Button variant="outline" onClick={() => setPendingAction("reset-progress")}>
                    Reset
                  </Button>
                </>
              }
            />
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal disabled={loadState.restored || loadState.completed} delay={90}>
              <CrosswordCurrentClue
                entry={activeEntry}
                direction={activeDirection}
                onPrevious={() => handleMoveClue(-1)}
                onNext={() => handleMoveClue(1)}
                onToggleDirection={handleToggleDirection}
              />
            </Reveal>

            <Reveal disabled={loadState.restored || loadState.completed} delay={130}>
              <CrosswordGrid
                puzzle={puzzle}
                progress={progress}
                pulsingCellKey={pulsingCellKey}
                introCellKey={introCellKey}
                animatedCellDelays={animatedCellDelays}
                onSelectCell={(row, column) => {
                  updateProgress(selectCell(puzzle, progress, row, column));
                  focusKeyboard();
                }}
              />
            </Reveal>

            <Reveal disabled={loadState.restored || loadState.completed} delay={170}>
              <CrosswordToolbar
                onCheckLetter={handleCheckLetter}
                onCheckWord={handleCheckWord}
                onCheckPuzzle={handleCheckPuzzle}
                onRevealLetter={() => setPendingAction("reveal-letter")}
                onRevealWord={() => setPendingAction("reveal-word")}
                onRevealPuzzle={() => setPendingAction("reveal-puzzle")}
                onClearWord={() => setPendingAction("clear-word")}
                onClearPuzzle={() => setPendingAction("clear-puzzle")}
                onResetProgress={() => setPendingAction("reset-progress")}
              />
            </Reveal>
          </div>
        </div>

        <aside className="space-y-4">
          <Reveal disabled={loadState.restored || loadState.completed} delay={70}>
            <BirthdayProgress compact currentGame="crossword" />
          </Reveal>
          <Reveal disabled={loadState.restored || loadState.completed} delay={120}>
            <CrosswordClueList
              title="Across"
              entries={acrossEntries}
              activeEntryId={activeEntry?.id}
              onSelectEntry={handleSelectEntry}
            />
          </Reveal>
          <Reveal disabled={loadState.restored || loadState.completed} delay={160}>
            <CrosswordClueList
              title="Down"
              entries={downEntries}
              activeEntryId={activeEntry?.id}
              onSelectEntry={handleSelectEntry}
            />
          </Reveal>
        </aside>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <CrosswordConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.startsWith("reveal")
            ? "Reveal answer?"
            : pendingAction === "reset-progress"
              ? "Reset progress?"
              : "Clear answers?"
        }
        description={
          pendingAction === "reveal-letter"
            ? "This will reveal the correct value for the currently selected cell."
            : pendingAction === "reveal-word"
              ? "This will reveal the full current answer and mark those cells as revealed."
              : pendingAction === "reveal-puzzle"
                ? "This will fill the entire crossword with the correct answers."
                  : pendingAction === "clear-word"
                    ? "This will clear the currently selected answer."
                    : pendingAction === "clear-puzzle"
                    ? "This will clear only the letters currently marked incorrect by Check Puzzle."
                    : "This will erase local progress saved on this device."
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />

      <CrosswordStatusDialog
        open={showNotQuite}
        title="Not quite!"
        description="The grid is full, but a few letters are still off. Try Check Puzzle to spot the wrong ones, then Clear Puzzle to wipe just those mistakes."
        onClose={() => setShowNotQuite(false)}
      />

      <CrosswordCompletionDialog
        open={showCompletion}
        puzzle={puzzle}
        slug={slug}
        timeLabel={timerLabel}
        clueCount={orderedEntries.length}
        onBackToPuzzle={() => setShowCompletion(false)}
      />
    </div>
  );
}
