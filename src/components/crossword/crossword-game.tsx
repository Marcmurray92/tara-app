"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CrosswordClueList } from "@/components/crossword/crossword-clue-list";
import { CrosswordCompletionDialog } from "@/components/crossword/crossword-completion-dialog";
import { CrosswordConfirmDialog } from "@/components/crossword/crossword-confirm-dialog";
import { CrosswordCurrentClue } from "@/components/crossword/crossword-current-clue";
import { CrosswordGrid } from "@/components/crossword/crossword-grid";
import { CrosswordMobileInput } from "@/components/crossword/crossword-mobile-input";
import { CrosswordTouchKeyboard } from "@/components/crossword/crossword-touch-keyboard";
import { CrosswordToolbar } from "@/components/crossword/crossword-toolbar";
import { GameMasthead } from "@/components/games/game-masthead";
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
  contentVersion,
  title = "Tara's Birthday Crossword",
  subtitle,
  eyebrow = "Published crossword"
}: {
  puzzle: CrosswordCompiledData;
  slug: string;
  contentVersion: number;
  title?: string;
  subtitle?: string | null;
  eyebrow?: string;
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
  const activeDirection = progress.selection?.direction ?? activeEntry?.direction ?? "across";
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
    focusKeyboard();
  }

  function handleBackspace() {
    updateProgress(backspaceCell({ puzzle, progress, now: new Date().toISOString() }));
    focusKeyboard();
  }

  function handleDelete() {
    updateProgress(deleteCell({ puzzle, progress, now: new Date().toISOString() }));
    focusKeyboard();
  }

  function handleToggleDirection() {
    updateProgress(toggleSelectionDirection(progress, puzzle));
    focusKeyboard();
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
      updateProgress(moveToAdjacentClue(puzzle, progress, event.shiftKey ? -1 : 1));
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
    <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" onKeyDown={handleKeyDown}>
      <CrosswordMobileInput inputRef={mobileInputRef} onInput={applyInput} onKeyDown={handleKeyDown} />

      <div className="space-y-4">
        <GameMasthead
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          items={[{ label: "elapsed", value: timerLabel }]}
          actions={
            <Button variant="outline" onClick={() => setPendingAction("reset-progress")}>
              Reset
            </Button>
          }
        />

        <div className="flex flex-col gap-4">
          <div className="order-1 lg:order-2">
            <CrosswordGrid
              puzzle={puzzle}
              progress={progress}
              onSelectCell={(row, column) => {
                updateProgress(selectCell(puzzle, progress, row, column));
                focusKeyboard();
              }}
            />
          </div>

          <div className="order-2 lg:order-1">
            <CrosswordCurrentClue
              entry={activeEntry}
              direction={activeDirection}
              onPrevious={() => updateProgress(moveToAdjacentClue(puzzle, progress, -1))}
              onNext={() => updateProgress(moveToAdjacentClue(puzzle, progress, 1))}
              onToggleDirection={handleToggleDirection}
            />
          </div>

          <div className="order-3 lg:hidden">
            <CrosswordTouchKeyboard
              direction={activeDirection}
              onKeyPress={applyInput}
              onBackspace={handleBackspace}
              onToggleDirection={handleToggleDirection}
              onFocusSystemKeyboard={focusKeyboard}
            />
          </div>

          <div className="order-4 rounded-[1.15rem] border border-white/10 bg-black/20 p-3 text-sm leading-6 text-muted lg:hidden">
            Tap a cell to begin, then use the touch keyboard here or keep typing with a hardware keyboard.
          </div>

          <div className="order-5">
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

          <details className="order-6 rounded-[1.25rem] border border-white/10 bg-surface/90 p-4 lg:hidden">
            <summary className="cursor-pointer list-none text-sm font-medium text-text">Across clues</summary>
            <div className="mt-3 max-h-72 overflow-y-auto pr-1">
              <CrosswordClueList
                title="Across"
                entries={acrossEntries}
                activeEntryId={activeEntry?.id}
                className="border-0 bg-transparent p-0"
                showHeading={false}
                onSelectEntry={(entry) => {
                  updateProgress(selectEntry(progress, entry));
                  focusKeyboard();
                }}
              />
            </div>
          </details>

          <details className="order-7 rounded-[1.25rem] border border-white/10 bg-surface/90 p-4 lg:hidden">
            <summary className="cursor-pointer list-none text-sm font-medium text-text">Down clues</summary>
            <div className="mt-3 max-h-72 overflow-y-auto pr-1">
              <CrosswordClueList
                title="Down"
                entries={downEntries}
                activeEntryId={activeEntry?.id}
                className="border-0 bg-transparent p-0"
                showHeading={false}
                onSelectEntry={(entry) => {
                  updateProgress(selectEntry(progress, entry));
                  focusKeyboard();
                }}
              />
            </div>
          </details>
        </div>
      </div>

      <aside className="hidden space-y-4 lg:block">
        <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Keyboard help</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>Tap or click a cell to select it.</li>
            <li>Use arrow keys to move and Space to switch direction.</li>
            <li>Touch devices can also solve with the on-screen keyboard.</li>
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
