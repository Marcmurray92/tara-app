import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";

export function CrosswordPreview({ puzzle }: { puzzle: CrosswordCompiledData }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/85 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Compiled preview</p>
          <h3 className="font-display text-2xl">Grid diagnostics</h3>
        </div>
        <p className="text-sm text-muted">
          {puzzle.rows} rows x {puzzle.columns} columns
        </p>
      </div>
      <div className="space-y-2 text-sm text-muted">
        <p>Placed entries: {puzzle.generation.placedEntryIds.length}</p>
        <p>Unplaced entries: {puzzle.generation.unplacedEntryIds.length}</p>
        <p>Seed: {puzzle.generation.seed}</p>
      </div>
    </div>
  );
}

