import type { InternalPlacedEntry } from "@/features/crossword/generator/crossword-generator.types";

export function scorePlacement({
  crossings,
  row,
  column,
  newCellCount,
  placedEntries,
  candidateLength,
  direction,
  targetRows,
  targetColumns
}: {
  crossings: number;
  row: number;
  column: number;
  newCellCount: number;
  placedEntries: InternalPlacedEntry[];
  candidateLength: number;
  direction: "across" | "down";
  targetRows?: number;
  targetColumns?: number;
}) {
  const minRow = Math.min(row, ...placedEntries.map((entry) => entry.row));
  const maxRow = Math.max(
    direction === "down" ? row + candidateLength - 1 : row,
    ...placedEntries.map((entry) => entry.direction === "down" ? entry.row + entry.answer.length - 1 : entry.row)
  );
  const minColumn = Math.min(column, ...placedEntries.map((entry) => entry.column));
  const maxColumn = Math.max(
    direction === "across" ? column + candidateLength - 1 : column,
    ...placedEntries.map((entry) =>
      entry.direction === "across" ? entry.column + entry.answer.length - 1 : entry.column
    )
  );
  const area = (maxRow - minRow + 1) * (maxColumn - minColumn + 1);
  const height = maxRow - minRow + 1;
  const width = maxColumn - minColumn + 1;
  const distance = Math.abs(row) + Math.abs(column);
  const targetHeight = targetRows ?? 15;
  const targetWidth = targetColumns ?? 15;
  const dimensionPenalty = Math.abs(height - targetHeight) + Math.abs(width - targetWidth);
  const skewPenalty = Math.abs(height - width);

  return crossings * 30 - area - newCellCount * 2 - distance * 0.2 - dimensionPenalty * 4 - skewPenalty * 2;
}
