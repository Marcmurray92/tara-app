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

const ALGORITHM_VERSION = 2;

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

function getDistinctLetterCount(answer: string) {
  return new Set(answer).size;
}

function getVowelCount(answer: string) {
  return Array.from(answer).filter((character) => "AEIOUY".includes(character)).length;
}

function scoreRowShape(row: CrosswordCompleteSourceRow, frequency: Map<string, number>) {
  const distinctLetterCount = getDistinctLetterCount(row.gridAnswer);
  const vowelCount = getVowelCount(row.gridAnswer);
  const frequencyScore = Array.from(new Set(row.gridAnswer)).reduce(
    (total, character) => total + (frequency.get(character) ?? 0),
    0
  );
  const length = row.gridAnswer.length;
  const bridgeBonus = length >= 6 && length <= 8 ? 18 : 0;
  const anchorBonus = length >= 9 ? 34 : 0;
  const giantPenalty = length > 15 ? (length - 15) * 8 : 0;
  const repeatedLetterPenalty = Math.max(0, length - distinctLetterCount - 2) * 4;
  const vowelPenalty = Math.abs(vowelCount - length / 2) * 1.5;

  return (
    length * 14 +
    distinctLetterCount * 8 +
    frequencyScore * 0.55 +
    bridgeBonus +
    anchorBonus -
    giantPenalty -
    repeatedLetterPenalty -
    vowelPenalty
  );
}

function sortRowsForAttempt(rows: CrosswordCompleteSourceRow[], seed: string) {
  const frequency = buildLetterFrequency(rows);
  const shuffled = shuffleWithSeed(rows, seed);

  return shuffled.sort((left, right) => {
    const leftScore = scoreRowShape(left, frequency);
    const rightScore = scoreRowShape(right, frequency);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    if (right.gridAnswer.length !== left.gridAnswer.length) {
      return right.gridAnswer.length - left.gridAnswer.length;
    }

    return left.answer.localeCompare(right.answer, "en");
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

function getDimensionsFromBounds(bounds: ReturnType<typeof getBounds>) {
  return {
    rows: bounds.maxRow - bounds.minRow + 1,
    columns: bounds.maxColumn - bounds.minColumn + 1
  };
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
  grid,
  placedEntries,
  maxRows,
  maxColumns
}: {
  answer: string;
  row: number;
  column: number;
  direction: "across" | "down";
  grid: Map<string, GridCell>;
  placedEntries: InternalPlacedEntry[];
  maxRows?: number;
  maxColumns?: number;
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

  if ((maxRows || maxColumns) && placedEntries.length > 0) {
    const candidateEntry: InternalPlacedEntry = {
      id: "__candidate__",
      clue: "",
      answer,
      displayAnswer: answer,
      sourceRowNumber: 0,
      row,
      column,
      direction
    };
    const bounds = getBounds([...placedEntries, candidateEntry]);
    const dimensions = getDimensionsFromBounds(bounds);

    if ((maxRows && dimensions.rows > maxRows) || (maxColumns && dimensions.columns > maxColumns)) {
      return null;
    }
  }

  return {
    crossings,
    newCellCount
  };
}

function enumerateCandidates(
  row: CrosswordCompleteSourceRow,
  grid: Map<string, GridCell>,
  placedEntries: InternalPlacedEntry[],
  layout: CrosswordGeneratorInput["layout"]
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
          grid,
          placedEntries,
          maxRows: layout?.maxRows,
          maxColumns: layout?.maxColumns
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
            direction,
            targetRows: layout?.targetRows,
            targetColumns: layout?.targetColumns
          })
        });
      }
    }
  }

  return candidates.sort((left, right) => right.score - left.score);
}

function chooseSeedEntry(ordered: CrosswordCompleteSourceRow[], seed: string) {
  const random = hashSeed(seed);
  const preferredAnchors = ordered.filter((row) => row.gridAnswer.length >= 9 && row.gridAnswer.length <= 11);
  const giantAnchors = ordered.filter((row) => row.gridAnswer.length >= 12);
  const longAnchors = preferredAnchors.length > 0 ? preferredAnchors : giantAnchors;
  const pool = longAnchors.length > 0 ? longAnchors.slice(0, Math.min(8, longAnchors.length)) : ordered.slice(0, Math.min(6, ordered.length));

  return pool[Math.floor(random() * pool.length)] ?? ordered[0];
}

function buildActiveLetterCounts(grid: Map<string, GridCell>) {
  const counts = new Map<string, number>();

  for (const cell of grid.values()) {
    counts.set(cell.solution, (counts.get(cell.solution) ?? 0) + 1);
  }

  return counts;
}

function scorePendingRow(
  row: CrosswordCompleteSourceRow,
  activeLetters: Map<string, number>,
  frequency: Map<string, number>
) {
  const seen = new Set<string>();
  let overlap = 0;
  let uniqueOverlap = 0;

  for (const character of row.gridAnswer) {
    if (activeLetters.has(character)) {
      overlap += 1;
      if (!seen.has(character)) {
        uniqueOverlap += 1;
        seen.add(character);
      }
    }
  }

  return scoreRowShape(row, frequency) + uniqueOverlap * 28 + overlap * 8;
}

function choosePlacementCandidate(candidates: PlacementCandidate[], seed: string) {
  if (candidates.length === 0) {
    return null;
  }

  const random = hashSeed(seed);
  const topSlice = candidates.slice(0, Math.min(4, candidates.length));

  return topSlice[Math.floor(random() * topSlice.length)] ?? candidates[0];
}

function buildCompiledCells(placedEntries: InternalPlacedEntry[], layout?: CrosswordGeneratorInput["layout"]) {
  const bounds = getBounds(placedEntries);
  const dimensions = getDimensionsFromBounds(bounds);
  const rows = Math.max(dimensions.rows, layout?.minRows ?? 0);
  const columns = Math.max(dimensions.columns, layout?.minColumns ?? 0);
  const rowPadding = rows - dimensions.rows;
  const columnPadding = columns - dimensions.columns;
  const rowOffset = -bounds.minRow + Math.floor(rowPadding / 2);
  const columnOffset = -bounds.minColumn + Math.floor(columnPadding / 2);
  const cells: CrosswordCompiledCell[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => ({
      row,
      column,
      solution: null
    }))
  );
  const normalizedEntries: InternalPlacedEntry[] = placedEntries.map((entry) => ({
    ...entry,
    row: entry.row + rowOffset,
    column: entry.column + columnOffset
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

function attemptLayout(rows: CrosswordCompleteSourceRow[], seed: string, layout?: CrosswordGeneratorInput["layout"]) {
  const ordered = sortRowsForAttempt(rows, seed);
  const frequency = buildLetterFrequency(rows);
  const grid = new Map<string, GridCell>();
  const placedEntries: InternalPlacedEntry[] = [];
  const random = hashSeed(seed);

  if (ordered.length === 0) {
    return { placedEntries, unplacedRows: [] };
  }

  const first = chooseSeedEntry(ordered, seed);
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

  let pendingRows = ordered.filter((row) => row.id !== first.id);

  for (let openingIndex = 0; openingIndex < 2; openingIndex += 1) {
    const openingCandidates = pendingRows
      .map((row) => ({
        row,
        candidates: enumerateCandidates(row, grid, placedEntries, layout)
      }))
      .filter((item) => item.candidates.length > 0)
      .sort((left, right) => {
        const leftBest = left.candidates[0];
        const rightBest = right.candidates[0];
        const leftLengthScore = left.row.gridAnswer.length >= 6 && left.row.gridAnswer.length <= 10 ? 1 : 0;
        const rightLengthScore = right.row.gridAnswer.length >= 6 && right.row.gridAnswer.length <= 10 ? 1 : 0;

        if (rightBest.crossings !== leftBest.crossings) {
          return rightBest.crossings - leftBest.crossings;
        }

        if (rightLengthScore !== leftLengthScore) {
          return rightLengthScore - leftLengthScore;
        }

        return left.candidates.length - right.candidates.length;
      });

    if (openingCandidates.length === 0) {
      break;
    }

    const chosenRow = openingCandidates[Math.floor(random() * Math.min(3, openingCandidates.length))] ?? openingCandidates[0];
    const chosen = choosePlacementCandidate(
      chosenRow.candidates,
      `${seed}:opening:${openingIndex}:${chosenRow.row.id}:${placedEntries.length}`
    );

    if (!chosen) {
      break;
    }

    const placedEntry: InternalPlacedEntry = {
      id: chosenRow.row.id,
      clue: chosenRow.row.clue,
      answer: chosenRow.row.gridAnswer,
      displayAnswer: chosenRow.row.answer,
      category: chosenRow.row.category,
      sourceRowNumber: chosenRow.row.sourceRowNumber,
      row: chosen.row,
      column: chosen.column,
      direction: chosen.direction
    };

    placedEntries.push(placedEntry);
    addEntryToGrid(grid, placedEntry);
    pendingRows = pendingRows.filter((row) => row.id !== chosenRow.row.id);
  }

  while (pendingRows.length > 0) {
    const activeLetters = buildActiveLetterCounts(grid);
    const rankedRows = pendingRows
      .map((row) => {
        const candidates = enumerateCandidates(row, grid, placedEntries, layout);

        return {
          row,
          candidates,
          pendingScore: scorePendingRow(row, activeLetters, frequency)
        };
      })
      .filter((item) => item.candidates.length > 0)
      .sort((left, right) => {
        const leftBest = left.candidates[0];
        const rightBest = right.candidates[0];

        if (rightBest.crossings !== leftBest.crossings) {
          return rightBest.crossings - leftBest.crossings;
        }

        if (left.candidates.length !== right.candidates.length) {
          return left.candidates.length - right.candidates.length;
        }

        return right.pendingScore + rightBest.score - (left.pendingScore + leftBest.score);
      });

    if (rankedRows.length === 0) {
      break;
    }

    const topRows = rankedRows.slice(0, Math.min(6, rankedRows.length));
    const chosenRow = topRows[Math.floor(random() * topRows.length)] ?? rankedRows[0];
    const chosen = choosePlacementCandidate(
      chosenRow.candidates,
      `${seed}:${chosenRow.row.id}:${placedEntries.length}:${chosenRow.candidates.length}`
    );

    if (!chosen) {
      pendingRows = pendingRows.filter((row) => row.id !== chosenRow.row.id);
      continue;
    }

    const placedEntry: InternalPlacedEntry = {
      id: chosenRow.row.id,
      clue: chosenRow.row.clue,
      answer: chosenRow.row.gridAnswer,
      displayAnswer: chosenRow.row.answer,
      category: chosenRow.row.category,
      sourceRowNumber: chosenRow.row.sourceRowNumber,
      row: chosen.row,
      column: chosen.column,
      direction: chosen.direction
    };

    placedEntries.push(placedEntry);
    addEntryToGrid(grid, placedEntry);
    pendingRows = pendingRows.filter((row) => row.id !== chosenRow.row.id);
  }

  return {
    placedEntries,
    unplacedRows: pendingRows.map((row) => ({
      id: row.id,
      clue: row.clue,
      answer: row.answer,
      sourceRowNumber: row.sourceRowNumber,
      reason: "No valid crossing placement found for this answer in the current layout."
    }))
  };
}

function scoreAttemptLayout(placedEntries: InternalPlacedEntry[], layout?: CrosswordGeneratorInput["layout"]) {
  const { cells, rows, columns } = buildCompiledCells(placedEntries, layout);
  const totalCells = rows * columns;
  const whiteCells = cells.flat().filter((cell) => cell.solution).length;
  const blackSquareRate = totalCells === 0 ? 1 : 1 - whiteCells / totalCells;
  const answerLengths = placedEntries.map((entry) => entry.answer.length);
  const averageAnswerLength =
    answerLengths.reduce((total, length) => total + length, 0) / Math.max(1, answerLengths.length);
  const bridgeCount = answerLengths.filter((length) => length >= 6 && length <= 8).length;
  const anchorCount = answerLengths.filter((length) => length >= 9).length;
  const totalCrossings = cells.flat().reduce((total, cell) => {
    return total + (cell.solution && cell.acrossEntryId && cell.downEntryId ? 1 : 0);
  }, 0);
  const targetRows = layout?.targetRows ?? 15;
  const targetColumns = layout?.targetColumns ?? 15;
  const dimensionPenalty = Math.abs(rows - targetRows) + Math.abs(columns - targetColumns);
  const skewPenalty = Math.abs(rows - columns);

  return (
    placedEntries.length * 140 +
    bridgeCount * 36 +
    anchorCount * 52 +
    totalCrossings * 12 +
    averageAnswerLength * 42 -
    blackSquareRate * 1200 -
    dimensionPenalty * 18 -
    skewPenalty * 10
  );
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
    attemptLayout(completeRows, `${input.seed}:${index}`, input.layout)
  );

  const bestAttempt = attempts.sort((left, right) => {
    if (right.placedEntries.length !== left.placedEntries.length) {
      return right.placedEntries.length - left.placedEntries.length;
    }

    const leftScore = scoreAttemptLayout(left.placedEntries, input.layout);
    const rightScore = scoreAttemptLayout(right.placedEntries, input.layout);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    const leftBounds = left.placedEntries.length > 0 ? getBounds(left.placedEntries) : null;
    const rightBounds = right.placedEntries.length > 0 ? getBounds(right.placedEntries) : null;
    const leftArea = leftBounds
      ? (leftBounds.maxRow - leftBounds.minRow + 1) * (leftBounds.maxColumn - leftBounds.minColumn + 1)
      : Number.POSITIVE_INFINITY;
    const rightArea = rightBounds
      ? (rightBounds.maxRow - rightBounds.minRow + 1) * (rightBounds.maxColumn - rightBounds.minColumn + 1)
      : Number.POSITIVE_INFINITY;

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

  const { cells, rows, columns, normalizedEntries } = buildCompiledCells(bestAttempt.placedEntries, input.layout);
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
