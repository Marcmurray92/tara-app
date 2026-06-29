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
  const reusedCellCount = candidateLength - newCellCount;
  const mediumLengthBonus = candidateLength >= 6 && candidateLength <= 8 ? 18 : 0;
  const anchorLengthBonus = candidateLength >= 9 ? 34 : 0;
  const multiCrossBonus = crossings >= 2 ? crossings * 18 : 0;
  const efficiencyBonus = reusedCellCount * 9;

  return (
    crossings * 54 +
    multiCrossBonus +
    efficiencyBonus +
    mediumLengthBonus +
    anchorLengthBonus -
    area * 0.65 -
    newCellCount * 1.5 -
    distance * 0.12 -
    dimensionPenalty * 5 -
    skewPenalty * 3
  );
}
