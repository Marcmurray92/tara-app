import type { CrosswordCompiledData, CrosswordProgress } from "@/features/crossword/game/crossword-game.types";
import { getCellAccessibleLabel, getEntryForSelection } from "@/features/crossword/game/crossword-engine";
import { CrosswordCell } from "@/components/crossword/crossword-cell";
import { cn } from "@/lib/utils/cn";

export function CrosswordGrid({
  puzzle,
  progress,
  onSelectCell,
  compact = false,
  pulsingCellKey,
  introCellKey,
  animatedCellDelays = {}
}: {
  puzzle: CrosswordCompiledData;
  progress: CrosswordProgress;
  onSelectCell: (row: number, column: number) => void;
  compact?: boolean;
  pulsingCellKey?: string | null;
  introCellKey?: string | null;
  animatedCellDelays?: Record<string, number>;
}) {
  const activeEntry = getEntryForSelection(puzzle, progress.selection);
  const maxDimension = Math.max(puzzle.rows, puzzle.columns);
  const density = maxDimension >= 19 ? "dense" : maxDimension >= 17 ? "compact" : "regular";
  const highlightedCoords = new Set(
    activeEntry
      ? Array.from({ length: activeEntry.length }, (_, index) => {
          const row = activeEntry.startRow + (activeEntry.direction === "down" ? index : 0);
          const column = activeEntry.startColumn + (activeEntry.direction === "across" ? index : 0);
          return `${row},${column}`;
        })
      : []
  );

  return (
    <div
      className={cn(
        "border border-white/10 bg-black/20",
        compact
          ? "flex h-full w-full items-center justify-center overflow-hidden border-x-0 px-0.5 py-0.5"
          : "rounded-[1.4rem] p-2.5 sm:p-3.5"
      )}
    >
      <div
        className={cn(
          "grid",
          compact ? "mx-auto h-full max-h-full max-w-full shrink-0 gap-px" : "gap-0.5 sm:gap-1"
        )}
        style={
          compact
            ? {
                gridTemplateColumns: `repeat(${puzzle.columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${puzzle.rows}, minmax(0, 1fr))`,
                aspectRatio: `${puzzle.columns} / ${puzzle.rows}`
              }
            : {
                gridTemplateColumns: `repeat(${puzzle.columns}, minmax(0, 1fr))`
              }
        }
      >
        {puzzle.cells.flat().map((cell) => {
          const playerCell = progress.cells[cell.row]?.[cell.column];
          const cellKey = `${cell.row},${cell.column}`;
          return (
            <CrosswordCell
              key={`${cell.row}-${cell.column}`}
              label={getCellAccessibleLabel(puzzle, progress, cell.row, cell.column)}
              number={cell.number}
              value={playerCell?.value ?? ""}
              selected={progress.selection?.row === cell.row && progress.selection?.column === cell.column}
              highlighted={highlightedCoords.has(`${cell.row},${cell.column}`)}
              incorrect={playerCell?.checkedIncorrect ?? false}
              revealed={playerCell?.revealed ?? false}
              isBlock={!cell.solution}
              pulse={pulsingCellKey === cellKey}
              intro={introCellKey === cellKey}
              waveDelayMs={animatedCellDelays[cellKey]}
              density={density}
              fillContainer={compact}
              cellKey={cellKey}
              onClick={() => onSelectCell(cell.row, cell.column)}
            />
          );
        })}
      </div>
    </div>
  );
}
