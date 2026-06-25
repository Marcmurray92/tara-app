import { crosswordCompiledDataSchema } from "@/features/crossword/game/crossword-game.schema";
import type { CrosswordCompiledCell } from "@/features/crossword/game/crossword-game.types";
import { assignNumbers } from "@/features/crossword/generator/crossword-numbering";
import { scorePlacement } from "@/features/crossword/generator/crossword-scoring";
import type {
  CrosswordCompilationResult,
  CrosswordGeneratorInput,
  CrosswordUnplacedEntry,
  InternalPlacedEntry
} from "@/features/crossword/generator/crossword-generator.types";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";

const ALGORITHM_VERSION = 1;

type GridCell = {
  solution: string;
  directions: Set<"across" | "down">;
};

type PlacementCandidate = {
  row: number;
  column: number;
  direction: "across" | "down";
  crossings: number;
  newCellCount: number;
  score: number;
};

function makeKey(row: number, column: number) {
  return `${row},${column}`;
}

function hashSeed(seed: string) {
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    const next = (hash ^= hash >>> 16) >>> 0;
    return next / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: string) {
  const random = hashSeed(seed);
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildLetterFrequency(rows: CrosswordCompleteSourceRow[]) {
  const frequency = new Map<string, number>();

  for (const row of rows) {
    for (const character of new Set(row.gridAnswer)) {
      frequency.set(character, (frequency.get(character) ?? 0) + 1);
    }
  }

  return frequency;
}

function sortRowsForAttempt(rows: CrosswordCompleteSourceRow[], seed: string) {
  const frequency = buildLetterFrequency(rows);
  const shuffled = shuffleWithSeed(rows, seed);

  return shuffled.sort((left, right) => {
    const leftScore = Array.from(new Set(left.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );
    const rightScore = Array.from(new Set(right.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );

    if (right.gridAnswer.length !== left.gridAnswer.length) {
      return right.gridAnswer.length - left.gridAnswer.length;
    }

    return rightScore - leftScore;
  });
}

function getBounds(placedEntries: InternalPlacedEntry[]) {
  const minRow = Math.min(...placedEntries.map((entry) => entry.row));
  const maxRow = Math.max(
    ...placedEntries.map((entry) => entry.direction === "down" ? entry.row + entry.answer.length - 1 : entry.row)
  );
  const minColumn = Math.min(...placedEntries.map((entry) => entry.column));
  const maxColumn = Math.max(
    ...placedEntries.map((entry) =>
      entry.direction === "across" ? entry.column + entry.answer.length - 1 : entry.column
    )
  );

  return { minRow, maxRow, minColumn, maxColumn };
}

function addEntryToGrid(grid: Map<string, GridCell>, entry: InternalPlacedEntry) {
  for (let index = 0; index < entry.answer.length; index += 1) {
    const row = entry.row + (entry.direction === "down" ? index : 0);
    const column = entry.column + (entry.direction === "across" ? index : 0);
    const key = makeKey(row, column);
    const existing = grid.get(key);

    if (existing) {
      existing.directions.add(entry.direction);
      continue;
    }

    grid.set(key, {
      solution: entry.answer[index],
      directions: new Set([entry.direction])
    });
  }
}

function canPlaceWord({
  answer,
  row,
  column,
  direction,
  grid
}: {
  answer: string;
  row: number;
  column: number;
  direction: "across" | "down";
  grid: Map<string, GridCell>;
}) {
  let crossings = 0;
  let newCellCount = 0;

  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = row + (direction === "down" ? index : 0);
    const currentColumn = column + (direction === "across" ? index : 0);
    const key = makeKey(currentRow, currentColumn);
    const existing = grid.get(key);

    if (existing) {
      if (existing.solution !== answer[index]) {
        return null;
      }

      if (existing.directions.has(direction)) {
        return null;
      }

      crossings += 1;
      continue;
    }

    const sideNeighbors =
      direction === "across"
        ? [
            [currentRow - 1, currentColumn],
            [currentRow + 1, currentColumn]
          ]
        : [
            [currentRow, currentColumn - 1],
            [currentRow, currentColumn + 1]
          ];

    for (const [neighborRow, neighborColumn] of sideNeighbors) {
      if (grid.has(makeKey(neighborRow, neighborColumn))) {
        return null;
      }
    }

    newCellCount += 1;
  }

  const beforeRow = row - (direction === "down" ? 1 : 0);
  const beforeColumn = column - (direction === "across" ? 1 : 0);
  const afterRow = row + (direction === "down" ? answer.length : 0);
  const afterColumn = column + (direction === "across" ? answer.length : 0);

  if (grid.has(makeKey(beforeRow, beforeColumn)) || grid.has(makeKey(afterRow, afterColumn))) {
    return null;
  }

  if (grid.size > 0 && crossings === 0) {
    return null;
  }

  return {
    crossings,
    newCellCount
  };
}

function enumerateCandidates(
  row: CrosswordCompleteSourceRow,
  grid: Map<string, GridCell>,
  placedEntries: InternalPlacedEntry[]
) {
  const candidates: PlacementCandidate[] = [];

  for (const [key, cell] of grid.entries()) {
    const [currentRowString, currentColumnString] = key.split(",");
    const currentRow = Number(currentRowString);
    const currentColumn = Number(currentColumnString);

    for (let index = 0; index < row.gridAnswer.length; index += 1) {
      if (row.gridAnswer[index] !== cell.solution) {
        continue;
      }

      const possibleDirections = (["across", "down"] as const).filter(
        (direction) => !cell.directions.has(direction)
      );

      for (const direction of possibleDirections) {
        const startRow = direction === "down" ? currentRow - index : currentRow;
        const startColumn = direction === "across" ? currentColumn - index : currentColumn;
        const placement = canPlaceWord({
          answer: row.gridAnswer,
          row: startRow,
          column: startColumn,
          direction,
          grid
        });

        if (!placement) {
          continue;
        }

        candidates.push({
          row: startRow,
          column: startColumn,
          direction,
          crossings: placement.crossings,
          newCellCount: placement.newCellCount,
          score: scorePlacement({
            crossings: placement.crossings,
            row: startRow,
            column: startColumn,
            newCellCount: placement.newCellCount,
            placedEntries,
            candidateLength: row.gridAnswer.length,
            direction
          })
        });
      }
    }
  }

  return candidates.sort((left, right) => right.score - left.score);
}

function buildCompiledCells(placedEntries: InternalPlacedEntry[]) {
  const bounds = getBounds(placedEntries);
  const rows = bounds.maxRow - bounds.minRow + 1;
  const columns = bounds.maxColumn - bounds.minColumn + 1;
  const cells: CrosswordCompiledCell[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => ({
      row,
      column,
      solution: null
    }))
  );
  const normalizedEntries: InternalPlacedEntry[] = placedEntries.map((entry) => ({
    ...entry,
    row: entry.row - bounds.minRow,
    column: entry.column - bounds.minColumn
  }));

  for (const entry of normalizedEntries) {
    for (let index = 0; index < entry.answer.length; index += 1) {
      const row = entry.row + (entry.direction === "down" ? index : 0);
      const column = entry.column + (entry.direction === "across" ? index : 0);
      const cell = cells[row][column];

      cell.solution = entry.answer[index];
      if (entry.direction === "across") {
        cell.acrossEntryId = entry.id;
      } else {
        cell.downEntryId = entry.id;
      }
    }
  }

  return {
    cells,
    rows,
    columns,
    normalizedEntries
  };
}

function attemptLayout(rows: CrosswordCompleteSourceRow[], seed: string) {
  const ordered = sortRowsForAttempt(rows, seed);
  const grid = new Map<string, GridCell>();
  const placedEntries: InternalPlacedEntry[] = [];
  const unplacedRows: CrosswordUnplacedEntry[] = [];

  if (ordered.length === 0) {
    return { placedEntries, unplacedRows };
  }

  const first = ordered[0];
  const firstEntry: InternalPlacedEntry = {
    id: first.id,
    clue: first.clue,
    answer: first.gridAnswer,
    displayAnswer: first.answer,
    category: first.category,
    sourceRowNumber: first.sourceRowNumber,
    row: 0,
    column: 0,
    direction: "across"
  };

  placedEntries.push(firstEntry);
  addEntryToGrid(grid, firstEntry);

  for (const row of ordered.slice(1)) {
    const candidates = enumerateCandidates(row, grid, placedEntries);

    if (candidates.length === 0) {
      unplacedRows.push({
        id: row.id,
        clue: row.clue,
        answer: row.answer,
        sourceRowNumber: row.sourceRowNumber,
        reason: "No valid crossing placement found for this answer in the current layout."
      });
      continue;
    }

    const chosen = candidates[0];
    const placedEntry: InternalPlacedEntry = {
      id: row.id,
      clue: row.clue,
      answer: row.gridAnswer,
      displayAnswer: row.answer,
      category: row.category,
      sourceRowNumber: row.sourceRowNumber,
      row: chosen.row,
      column: chosen.column,
      direction: chosen.direction
    };

    placedEntries.push(placedEntry);
    addEntryToGrid(grid, placedEntry);
  }

  return {
    placedEntries,
    unplacedRows
  };
}

export function compileCrossword(input: CrosswordGeneratorInput): CrosswordCompilationResult {
  const completeRows = input.rows.filter((row) => row.status === "complete");
  const duplicateMap = new Map<string, CrosswordCompleteSourceRow[]>();

  for (const row of completeRows) {
    const existing = duplicateMap.get(row.gridAnswer) ?? [];
    existing.push(row);
    duplicateMap.set(row.gridAnswer, existing);
  }

  const duplicateRows = Array.from(duplicateMap.values()).filter((rows) => rows.length > 1);
  if (duplicateRows.length > 0) {
    return {
      compiledData: null,
      placedRows: [],
      unplacedRows: [],
      issues: duplicateRows.flatMap((rows) =>
        rows.map((row) => ({
          rowNumber: row.sourceRowNumber,
          column: "Answer",
          severity: "error" as const,
          code: "duplicate_grid_answer",
          message: `Duplicate normalized grid answer "${row.gridAnswer}" cannot appear twice in one crossword.`
        }))
      )
    };
  }

  const attempts = Array.from({ length: Math.max(18, Math.min(72, completeRows.length * 6)) }, (_, index) =>
    attemptLayout(completeRows, `${input.seed}:${index}`)
  );

  const bestAttempt = attempts.sort((left, right) => {
    if (right.placedEntries.length !== left.placedEntries.length) {
      return right.placedEntries.length - left.placedEntries.length;
    }

    const leftBounds = left.placedEntries.length > 0 ? getBounds(left.placedEntries) : null;
    const rightBounds = right.placedEntries.length > 0 ? getBounds(right.placedEntries) : null;
    const leftHeight = leftBounds ? leftBounds.maxRow - leftBounds.minRow + 1 : Number.POSITIVE_INFINITY;
    const rightHeight = rightBounds ? rightBounds.maxRow - rightBounds.minRow + 1 : Number.POSITIVE_INFINITY;
    const leftWidth = leftBounds ? leftBounds.maxColumn - leftBounds.minColumn + 1 : Number.POSITIVE_INFINITY;
    const rightWidth = rightBounds ? rightBounds.maxColumn - rightBounds.minColumn + 1 : Number.POSITIVE_INFINITY;
    const leftArea = leftBounds
      ? leftHeight * leftWidth
      : Number.POSITIVE_INFINITY;
    const rightArea = rightBounds
      ? rightHeight * rightWidth
      : Number.POSITIVE_INFINITY;
    const leftMaxDimension = Math.max(leftHeight, leftWidth);
    const rightMaxDimension = Math.max(rightHeight, rightWidth);
    const leftAspectPenalty = Math.max(leftHeight / leftWidth, leftWidth / leftHeight);
    const rightAspectPenalty = Math.max(rightHeight / rightWidth, rightWidth / rightHeight);
    const leftSkew = Math.abs(leftHeight - leftWidth);
    const rightSkew = Math.abs(rightHeight - rightWidth);

    if (leftMaxDimension !== rightMaxDimension) {
      return leftMaxDimension - rightMaxDimension;
    }

    if (leftAspectPenalty !== rightAspectPenalty) {
      return leftAspectPenalty - rightAspectPenalty;
    }

    if (leftSkew !== rightSkew) {
      return leftSkew - rightSkew;
    }

    return leftArea - rightArea;
  })[0];

  if (!bestAttempt || bestAttempt.placedEntries.length < 2) {
    return {
      compiledData: null,
      placedRows: [],
      unplacedRows: bestAttempt?.unplacedRows ?? [],
      issues: [
        {
          severity: "error",
          code: "no_valid_grid",
          message: "A valid connected crossword grid could not be generated from the selected entries."
        }
      ]
    };
  }

  const { cells, rows, columns, normalizedEntries } = buildCompiledCells(bestAttempt.placedEntries);
  const entries = assignNumbers(cells, normalizedEntries);

  const compiledData = {
    schemaVersion: 1 as const,
    rows,
    columns,
    cells,
    entries,
    generation: {
      seed: input.seed,
      attemptedEntryIds: completeRows.map((row) => row.id),
      placedEntryIds: normalizedEntries.map((entry) => entry.id),
      unplacedEntryIds: bestAttempt.unplacedRows.map((entry) => entry.id),
      generatedAt: new Date().toISOString(),
      algorithmVersion: ALGORITHM_VERSION
    },
    completion: input.completion
  };

  crosswordCompiledDataSchema.parse(compiledData);

  return {
    compiledData,
    placedRows: completeRows.filter((row) => normalizedEntries.some((entry) => entry.id === row.id)),
    unplacedRows: bestAttempt.unplacedRows,
    issues: []
  };
}
