import type { CrosswordCompiledCell, CrosswordCompiledEntry } from "@/features/crossword/game/crossword-game.types";
import type { InternalPlacedEntry } from "@/features/crossword/generator/crossword-generator.types";

function startsAcross(cells: CrosswordCompiledCell[][], row: number, column: number) {
  const cell = cells[row]?.[column];
  if (!cell?.solution) {
    return false;
  }

  const left = cells[row]?.[column - 1];
  const right = cells[row]?.[column + 1];
  return !left?.solution && Boolean(right?.solution);
}

function startsDown(cells: CrosswordCompiledCell[][], row: number, column: number) {
  const cell = cells[row]?.[column];
  if (!cell?.solution) {
    return false;
  }

  const above = cells[row - 1]?.[column];
  const below = cells[row + 1]?.[column];
  return !above?.solution && Boolean(below?.solution);
}

export function assignNumbers(
  cells: CrosswordCompiledCell[][],
  placedEntries: InternalPlacedEntry[]
): CrosswordCompiledEntry[] {
  const entryNumbers = new Map<string, number>();
  let nextNumber = 1;

  for (let row = 0; row < cells.length; row += 1) {
    for (let column = 0; column < cells[row].length; column += 1) {
      const startsAny = startsAcross(cells, row, column) || startsDown(cells, row, column);
      if (!startsAny) {
        continue;
      }

      cells[row][column].number = nextNumber;

      for (const entry of placedEntries) {
        if (entry.row === row && entry.column === column) {
          entryNumbers.set(entry.id, nextNumber);
        }
      }

      nextNumber += 1;
    }
  }

  return placedEntries
    .map<CrosswordCompiledEntry>((entry) => ({
      id: entry.id,
      sourceRowNumber: entry.sourceRowNumber,
      number: entryNumbers.get(entry.id) ?? 0,
      direction: entry.direction,
      clue: entry.clue,
      answer: entry.answer,
      displayAnswer: entry.displayAnswer,
      category: entry.category,
      startRow: entry.row,
      startColumn: entry.column,
      length: entry.answer.length
    }))
    .filter((entry) => entry.number > 0)
    .sort((left, right) => {
      if (left.number !== right.number) {
        return left.number - right.number;
      }

      return left.direction.localeCompare(right.direction);
    });
}

