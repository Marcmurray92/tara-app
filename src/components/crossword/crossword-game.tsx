"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CrosswordClueList } from "@/components/crossword/crossword-clue-list";
import { CrosswordCompletionDialog } from "@/components/crossword/crossword-completion-dialog";
import { CrosswordConfirmDialog } from "@/components/crossword/crossword-confirm-dialog";
import { CrosswordCurrentClue } from "@/components/crossword/crossword-current-clue";
import { CrosswordGrid } from "@/components/crossword/crossword-grid";
import { CrosswordMobileInput } from "@/components/crossword/crossword-mobile-input";
import { CrosswordToolbar } from "@/components/crossword/crossword-toolbar";
import { Button } from "@/components/ui/button";
import type { CrosswordCompiledData, CrosswordProgress } from "@/features/crossword/game/crossword-game.types";
import {
  backspaceCell,
  checkCurrentLetter,
  checkCurrentWord,
  checkPuzzle,
  clearCurrentWord,
  clearEntirePuzzle,
  createEmptyProgress,
  deleteCell,
  getEntryForSelection,
  getOrderedEntries,
  moveGeometrically,
  moveToAdjacentClue,
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
import { formatDuration } from "@/lib/utils/strings";

type PendingAction =
  | "reveal-letter"
  | "reveal-word"
  | "reveal-puzzle"
  | "clear-word"
  | "clear-puzzle"
  | "reset-progress";

export function CrosswordGame({
  puzzle,
  slug,
  contentVersion
}: {
  puzzle: CrosswordCompiledData;
  slug: string;
  contentVersion: number;
}) {
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<CrosswordProgress>(() => {
    if (typeof window === "undefined") {
      return createEmptyProgress(puzzle);
    }

    return loadCrosswordProgress(slug, contentVersion) ?? createEmptyProgress(puzzle);
  });
  const [announcement, setAnnouncement] = useState("Crossword ready.");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [showCompletion, setShowCompletion] = useState(Boolean(progress.completedAt));

  const orderedEntries = useMemo(() => getOrderedEntries(puzzle), [puzzle]);
  const activeEntry = useMemo(() => getEntryForSelection(puzzle, progress.selection), [progress.selection, puzzle]);
  const acrossEntries = orderedEntries.filter((entry) => entry.direction === "across");
  const downEntries = orderedEntries.filter((entry) => entry.direction === "down");
  const timerLabel = useMemo(() => {
    if (!progress.startedAt) {
      return "00:00";
    }

    const endTime = progress.completedAt ? Date.parse(progress.completedAt) : Date.now();
    return formatDuration(endTime - Date.parse(progress.startedAt));
  }, [progress.completedAt, progress.startedAt]);

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
      setAnnouncement("Crossword complete.");
    }
  }, [progress.completedAt]);

  function updateProgress(nextProgress: CrosswordProgress) {
    setProgress(nextProgress);
  }

  function focusKeyboard() {
    mobileInputRef.current?.focus();
  }

  function applyInput(value: string) {
    if (!value) {
      return;
    }

    const nextProgress = setCellValue({
      puzzle,
      progress,
      value: value.slice(-1),
      now: new Date().toISOString()
    });
    updateProgress(nextProgress);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      updateProgress(backspaceCell({ puzzle, progress, now: new Date().toISOString() }));
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      updateProgress(deleteCell({ puzzle, progress, now: new Date().toISOString() }));
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
      updateProgress(moveToAdjacentClue(puzzle, progress, event.shiftKey ? -1 : 1));
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      updateProgress(toggleSelectionDirection(progress, puzzle));
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
      setAnnouncement("Entire puzzle cleared.");
    }

    if (pendingAction === "reset-progress") {
      clearCrosswordProgress(slug, contentVersion);
      updateProgress(createEmptyProgress(puzzle));
      setAnnouncement("Local crossword progress reset.");
      setShowCompletion(false);
    }

    setPendingAction(null);
  }

  return (
    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" onKeyDown={handleKeyDown}>
      <CrosswordMobileInput inputRef={mobileInputRef} onInput={applyInput} onKeyDown={handleKeyDown} />
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-surface/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Published crossword</p>
            <h1 className="font-display text-4xl">Tara&apos;s Birthday Crossword</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-accent/25 px-4 py-2 text-sm text-muted">Timer: {timerLabel}</div>
            <Button variant="outline" onClick={() => setPendingAction("reset-progress")}>
              Reset
            </Button>
          </div>
        </div>

        <CrosswordCurrentClue
          entry={activeEntry}
          onPrevious={() => updateProgress(moveToAdjacentClue(puzzle, progress, -1))}
          onNext={() => updateProgress(moveToAdjacentClue(puzzle, progress, 1))}
          onToggleDirection={() => updateProgress(toggleSelectionDirection(progress, puzzle))}
        />

        <CrosswordGrid
          puzzle={puzzle}
          progress={progress}
          onSelectCell={(row, column) => {
            updateProgress(selectCell(puzzle, progress, row, column));
            focusKeyboard();
          }}
        />

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
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Keyboard help</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>Tap or click a cell to select it.</li>
            <li>Use arrow keys to move and Space to switch direction.</li>
            <li>Use Tab and Shift+Tab to move through clues.</li>
          </ul>
        </div>
        <CrosswordClueList
          title="Across"
          entries={acrossEntries}
          activeEntryId={activeEntry?.id}
          onSelectEntry={(entry) => {
            updateProgress(selectEntry(progress, entry));
            focusKeyboard();
          }}
        />
        <CrosswordClueList
          title="Down"
          entries={downEntries}
          activeEntryId={activeEntry?.id}
          onSelectEntry={(entry) => {
            updateProgress(selectEntry(progress, entry));
            focusKeyboard();
          }}
        />
      </aside>

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
                    ? "This will clear every filled cell in the crossword."
                    : "This will erase local progress saved on this device."
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />

      <CrosswordCompletionDialog open={showCompletion} puzzle={puzzle} />
    </div>
  );
}

