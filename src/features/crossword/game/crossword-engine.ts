import type {
  CrosswordCompiledData,
  CrosswordCompiledEntry,
  CrosswordDirection,
  CrosswordProgress,
  CrosswordSelection
} from "@/features/crossword/game/crossword-game.types";

function cloneProgress(progress: CrosswordProgress): CrosswordProgress {
  return {
    ...progress,
    cells: progress.cells.map((row) => row.map((cell) => ({ ...cell }))),
    selection: progress.selection ? { ...progress.selection } : null
  };
}

export function getFirstSelection(puzzle: CrosswordCompiledData): CrosswordSelection | null {
  const firstAcrossEntry = [...puzzle.entries]
    .filter((entry) => entry.direction === "across")
    .sort((left, right) => left.number - right.number)[0];
  const firstEntry =
    firstAcrossEntry ??
    [...puzzle.entries].sort((left, right) => {
      if (left.number !== right.number) {
        return left.number - right.number;
      }

      if (left.direction === right.direction) {
        return 0;
      }

      return left.direction === "across" ? -1 : 1;
    })[0];
  if (!firstEntry) {
    return null;
  }

  return {
    row: firstEntry.startRow,
    column: firstEntry.startColumn,
    direction: firstEntry.direction
  };
}

export function createEmptyProgress(puzzle: CrosswordCompiledData): CrosswordProgress {
  return {
    schemaVersion: 1,
    cells: puzzle.cells.map((row) =>
      row.map((cell) => ({
        value: "",
        checkedIncorrect: false,
        revealed: false
      }))
    ),
    selection: getFirstSelection(puzzle),
    startedAt: null,
    elapsedMilliseconds: 0,
    completedAt: null
  };
}

export function getEntryCells(entry: CrosswordCompiledEntry) {
  return Array.from({ length: entry.length }, (_, index) => ({
    row: entry.startRow + (entry.direction === "down" ? index : 0),
    column: entry.startColumn + (entry.direction === "across" ? index : 0)
  }));
}

export function getEntryById(puzzle: CrosswordCompiledData, entryId?: string) {
  return puzzle.entries.find((entry) => entry.id === entryId) ?? null;
}

export function getCellEntries(puzzle: CrosswordCompiledData, row: number, column: number) {
  const cell = puzzle.cells[row]?.[column];

  return {
    across: getEntryById(puzzle, cell?.acrossEntryId),
    down: getEntryById(puzzle, cell?.downEntryId)
  };
}

export function getEntryForSelection(
  puzzle: CrosswordCompiledData,
  selection: CrosswordSelection | null
) {
  if (!selection) {
    return null;
  }

  const cell = puzzle.cells[selection.row]?.[selection.column];
  if (!cell?.solution) {
    return null;
  }

  return selection.direction === "across"
    ? getEntryById(puzzle, cell.acrossEntryId)
    : getEntryById(puzzle, cell.downEntryId);
}

export function selectCell(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  row: number,
  column: number
) {
  const cell = puzzle.cells[row]?.[column];

  if (!cell?.solution) {
    return progress;
  }

  const next = cloneProgress(progress);
  const alreadySelected = next.selection?.row === row && next.selection?.column === column;
  const entries = getCellEntries(puzzle, row, column);
  const direction =
    alreadySelected && entries.across && entries.down
      ? next.selection?.direction === "across"
        ? "down"
        : "across"
      : entries[next.selection?.direction ?? "across"]
        ? (next.selection?.direction ?? "across")
        : entries.across
          ? "across"
          : "down";

  next.selection = { row, column, direction };
  return next;
}

export function selectEntry(progress: CrosswordProgress, entry: CrosswordCompiledEntry) {
  const next = cloneProgress(progress);
  next.selection = {
    row: entry.startRow,
    column: entry.startColumn,
    direction: entry.direction
  };
  return next;
}

export function toggleSelectionDirection(progress: CrosswordProgress, puzzle: CrosswordCompiledData) {
  if (!progress.selection) {
    return progress;
  }

  const next = cloneProgress(progress);
  const selection = next.selection;
  if (!selection) {
    return progress;
  }

  const entries = getCellEntries(puzzle, selection.row, selection.column);
  if (!entries.across || !entries.down) {
    return progress;
  }

  next.selection = {
    ...selection,
    direction: selection.direction === "across" ? "down" : "across"
  };
  return next;
}

function findIndexInEntry(entry: CrosswordCompiledEntry, selection: CrosswordSelection) {
  return entry.direction === "across"
    ? selection.column - entry.startColumn
    : selection.row - entry.startRow;
}

export function moveWithinEntry(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  delta: 1 | -1
) {
  const entry = getEntryForSelection(puzzle, progress.selection);
  if (!entry || !progress.selection) {
    return progress;
  }

  const index = findIndexInEntry(entry, progress.selection);
  const nextIndex = Math.min(entry.length - 1, Math.max(0, index + delta));
  const next = cloneProgress(progress);
  next.selection = {
    row: entry.startRow + (entry.direction === "down" ? nextIndex : 0),
    column: entry.startColumn + (entry.direction === "across" ? nextIndex : 0),
    direction: entry.direction
  };
  return next;
}

export function moveGeometrically(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  deltaRow: number,
  deltaColumn: number,
  preferredDirection: CrosswordDirection
) {
  if (!progress.selection) {
    return progress;
  }

  let row = progress.selection.row + deltaRow;
  let column = progress.selection.column + deltaColumn;

  while (row >= 0 && column >= 0 && row < puzzle.rows && column < puzzle.columns) {
    const cell = puzzle.cells[row]?.[column];
    if (cell?.solution) {
      const next = cloneProgress(progress);
      next.selection = {
        row,
        column,
        direction: preferredDirection
      };
      return next;
    }

    row += deltaRow;
    column += deltaColumn;
  }

  return progress;
}

function updateCompletion(progress: CrosswordProgress, puzzle: CrosswordCompiledData, now: string) {
  const next = cloneProgress(progress);
  const complete = isCrosswordComplete(puzzle, next);
  next.completedAt = complete ? now : null;
  return next;
}

function markStarted(progress: CrosswordProgress, now: string) {
  const next = cloneProgress(progress);
  if (!next.startedAt) {
    next.startedAt = now;
  }
  next.elapsedMilliseconds = next.startedAt ? Date.now() - Date.parse(next.startedAt) : next.elapsedMilliseconds;
  return next;
}

export function setCellValue({
  puzzle,
  progress,
  value,
  now
}: {
  puzzle: CrosswordCompiledData;
  progress: CrosswordProgress;
  value: string;
  now: string;
}) {
  if (!progress.selection) {
    return progress;
  }

  const normalized = value.toUpperCase();
  if (!/^[A-Z0-9]$/.test(normalized)) {
    return progress;
  }

  const next = markStarted(progress, now);
  const selection = next.selection;
  if (!selection) {
    return progress;
  }

  const cell = next.cells[selection.row]?.[selection.column];
  if (!cell) {
    return progress;
  }

  cell.value = normalized;
  cell.checkedIncorrect = false;

  const advanced = moveWithinEntry(puzzle, next, 1);
  return updateCompletion(advanced, puzzle, now);
}

export function backspaceCell({
  puzzle,
  progress,
  now
}: {
  puzzle: CrosswordCompiledData;
  progress: CrosswordProgress;
  now: string;
}) {
  if (!progress.selection) {
    return progress;
  }

  const next = markStarted(progress, now);
  const selection = next.selection;
  if (!selection) {
    return progress;
  }

  const cell = next.cells[selection.row]?.[selection.column];
  if (!cell) {
    return progress;
  }

  if (cell.value) {
    cell.value = "";
    cell.checkedIncorrect = false;
    return updateCompletion(next, puzzle, now);
  }

  const moved = moveWithinEntry(puzzle, next, -1);
  if (!moved.selection) {
    return moved;
  }

  const previousCell = moved.cells[moved.selection.row]?.[moved.selection.column];
  if (previousCell) {
    previousCell.value = "";
    previousCell.checkedIncorrect = false;
  }

  return updateCompletion(moved, puzzle, now);
}

export function deleteCell({
  puzzle,
  progress,
  now
}: {
  puzzle: CrosswordCompiledData;
  progress: CrosswordProgress;
  now: string;
}) {
  if (!progress.selection) {
    return progress;
  }

  const next = markStarted(progress, now);
  const selection = next.selection;
  if (!selection) {
    return progress;
  }

  const cell = next.cells[selection.row]?.[selection.column];
  if (!cell) {
    return progress;
  }

  cell.value = "";
  cell.checkedIncorrect = false;
  return updateCompletion(next, puzzle, now);
}

function checkCoords(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  coords: Array<{ row: number; column: number }>
) {
  const next = cloneProgress(progress);
  let incorrectCount = 0;

  for (const coord of coords) {
    const puzzleCell = puzzle.cells[coord.row]?.[coord.column];
    const playerCell = next.cells[coord.row]?.[coord.column];

    if (!puzzleCell?.solution || !playerCell) {
      continue;
    }

    if (playerCell.value && playerCell.value !== puzzleCell.solution) {
      playerCell.checkedIncorrect = true;
      incorrectCount += 1;
    } else {
      playerCell.checkedIncorrect = false;
    }
  }

  return {
    progress: next,
    incorrectCount
  };
}

function revealCoords(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  coords: Array<{ row: number; column: number }>,
  now: string
) {
  const next = markStarted(progress, now);

  for (const coord of coords) {
    const puzzleCell = puzzle.cells[coord.row]?.[coord.column];
    const playerCell = next.cells[coord.row]?.[coord.column];
    if (!puzzleCell?.solution || !playerCell) {
      continue;
    }

    playerCell.value = puzzleCell.solution;
    playerCell.revealed = true;
    playerCell.checkedIncorrect = false;
  }

  return updateCompletion(next, puzzle, now);
}

function clearCoords(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  coords: Array<{ row: number; column: number }>,
  now: string
) {
  const next = markStarted(progress, now);

  for (const coord of coords) {
    const playerCell = next.cells[coord.row]?.[coord.column];
    if (!playerCell) {
      continue;
    }

    playerCell.value = "";
    playerCell.checkedIncorrect = false;
    playerCell.revealed = false;
  }

  return updateCompletion(next, puzzle, now);
}

export function checkCurrentLetter(puzzle: CrosswordCompiledData, progress: CrosswordProgress) {
  if (!progress.selection) {
    return { progress, incorrectCount: 0 };
  }

  return checkCoords(puzzle, progress, [
    {
      row: progress.selection.row,
      column: progress.selection.column
    }
  ]);
}

export function checkCurrentWord(puzzle: CrosswordCompiledData, progress: CrosswordProgress) {
  const entry = getEntryForSelection(puzzle, progress.selection);
  if (!entry) {
    return { progress, incorrectCount: 0 };
  }

  return checkCoords(puzzle, progress, getEntryCells(entry));
}

export function checkPuzzle(puzzle: CrosswordCompiledData, progress: CrosswordProgress) {
  const coords = puzzle.cells.flatMap((row) => row.filter((cell) => cell.solution).map((cell) => ({
    row: cell.row,
    column: cell.column
  })));

  return checkCoords(puzzle, progress, coords);
}

export function revealCurrentLetter(puzzle: CrosswordCompiledData, progress: CrosswordProgress, now: string) {
  if (!progress.selection) {
    return progress;
  }

  return revealCoords(
    puzzle,
    progress,
    [{ row: progress.selection.row, column: progress.selection.column }],
    now
  );
}

export function revealCurrentWord(puzzle: CrosswordCompiledData, progress: CrosswordProgress, now: string) {
  const entry = getEntryForSelection(puzzle, progress.selection);
  if (!entry) {
    return progress;
  }

  return revealCoords(puzzle, progress, getEntryCells(entry), now);
}

export function revealPuzzle(puzzle: CrosswordCompiledData, progress: CrosswordProgress, now: string) {
  const coords = puzzle.cells.flatMap((row) => row.filter((cell) => cell.solution).map((cell) => ({
    row: cell.row,
    column: cell.column
  })));

  return revealCoords(puzzle, progress, coords, now);
}

export function clearCurrentWord(puzzle: CrosswordCompiledData, progress: CrosswordProgress, now: string) {
  const entry = getEntryForSelection(puzzle, progress.selection);
  if (!entry) {
    return progress;
  }

  return clearCoords(puzzle, progress, getEntryCells(entry), now);
}

export function clearEntirePuzzle(puzzle: CrosswordCompiledData, progress: CrosswordProgress, now: string) {
  const coords = puzzle.cells.flatMap((row) =>
    row
      .filter((cell) => {
        if (!cell.solution) {
          return false;
        }

        return progress.cells[cell.row]?.[cell.column]?.checkedIncorrect ?? false;
      })
      .map((cell) => ({
        row: cell.row,
        column: cell.column
      }))
  );

  return clearCoords(puzzle, progress, coords, now);
}

export function isEntryFilled(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  entry: CrosswordCompiledEntry
) {
  return getEntryCells(entry).every(({ row, column }) => {
    if (!puzzle.cells[row]?.[column]?.solution) {
      return true;
    }

    return Boolean(progress.cells[row]?.[column]?.value);
  });
}

export function isCrosswordFilled(puzzle: CrosswordCompiledData, progress: CrosswordProgress) {
  for (const row of puzzle.cells) {
    for (const cell of row) {
      if (!cell.solution) {
        continue;
      }

      if (!progress.cells[cell.row]?.[cell.column]?.value) {
        return false;
      }
    }
  }

  return true;
}

export function isCrosswordComplete(puzzle: CrosswordCompiledData, progress: CrosswordProgress) {
  for (const row of puzzle.cells) {
    for (const cell of row) {
      if (!cell.solution) {
        continue;
      }

      const playerCell = progress.cells[cell.row]?.[cell.column];
      if (!playerCell || playerCell.value !== cell.solution) {
        return false;
      }
    }
  }

  return true;
}

export function getOrderedEntries(puzzle: CrosswordCompiledData) {
  return [...puzzle.entries].sort((left, right) => {
    if (left.number !== right.number) {
      return left.number - right.number;
    }

    return left.direction.localeCompare(right.direction);
  });
}

export function moveToAdjacentClue(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  delta: 1 | -1
) {
  const orderedEntries = getOrderedEntries(puzzle);
  const activeEntry = getEntryForSelection(puzzle, progress.selection) ?? orderedEntries[0];
  if (!activeEntry) {
    return progress;
  }

  const currentIndex = orderedEntries.findIndex((entry) => entry.id === activeEntry.id);
  const hasUnfilledEntries = orderedEntries.some((entry) => !isEntryFilled(puzzle, progress, entry));

  for (let step = 1; step <= orderedEntries.length; step += 1) {
    const nextIndex = (currentIndex + delta * step + orderedEntries.length) % orderedEntries.length;
    const nextEntry = orderedEntries[nextIndex];

    if (!nextEntry) {
      continue;
    }

    if (hasUnfilledEntries && isEntryFilled(puzzle, progress, nextEntry)) {
      continue;
    }

    const firstEmptyCell = getEntryCells(nextEntry).find(
      ({ row, column }) => !progress.cells[row]?.[column]?.value
    );
    const targetCell = firstEmptyCell ?? getEntryCells(nextEntry)[0];

    if (!targetCell) {
      return progress;
    }

    const next = cloneProgress(progress);
    next.selection = {
      row: targetCell.row,
      column: targetCell.column,
      direction: nextEntry.direction
    };
    return next;
  }

  return progress;
}

export function getCellAccessibleLabel(
  puzzle: CrosswordCompiledData,
  progress: CrosswordProgress,
  row: number,
  column: number
) {
  const puzzleCell = puzzle.cells[row]?.[column];
  const playerCell = progress.cells[row]?.[column];

  if (!puzzleCell?.solution || !playerCell) {
    return `Block at row ${row + 1}, column ${column + 1}`;
  }

  const entries = getCellEntries(puzzle, row, column);
  const clueParts = [entries.across, entries.down]
    .filter(Boolean)
    .map((entry) => `${entry?.number} ${entry?.direction}`)
    .join(", ");

  return `Row ${row + 1}, column ${column + 1}, ${clueParts}, current value ${
    playerCell.value || "blank"
  }`;
}
