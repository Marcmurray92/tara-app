import { ArrowLeftRight, Delete, Keyboard } from "lucide-react";
import type { PointerEvent } from "react";

import type { CrosswordDirection } from "@/features/crossword/game/crossword-game.types";
import { cn } from "@/lib/utils/cn";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

function preserveGridFocus(event: PointerEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function CrosswordTouchKeyboard({
  direction,
  onKeyPress,
  onBackspace,
  onToggleDirection,
  onFocusSystemKeyboard,
  compact = false
}: {
  direction: CrosswordDirection;
  onKeyPress: (value: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  onFocusSystemKeyboard: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "lg:hidden",
        compact ? "rounded-[1rem] border border-white/10 bg-surface/95 px-2 py-2.5 safe-bottom" : "rounded-[1.25rem] border border-white/10 bg-surface/90 p-3.5"
      )}
    >
      {!compact ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Touch keyboard</p>
          <div className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
            {direction}
          </div>
        </div>
      ) : null}

      <div className={cn(compact ? "space-y-1.5" : "space-y-2")}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={row}
            className={
              rowIndex === 2
                ? cn("flex justify-center", compact ? "gap-1.5 px-1" : "gap-2 px-4 sm:px-8")
                : cn("grid", compact ? "gap-1.5" : "gap-2")
            }
            style={
              rowIndex === 2
                ? undefined
                : {
                    gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`
                  }
            }
          >
            {Array.from(row).map((letter) => (
              <button
                key={letter}
                type="button"
                onPointerDown={preserveGridFocus}
                onClick={() => onKeyPress(letter)}
                className={cn(
                  "border border-white/10 bg-surface-strong font-semibold text-text transition hover:border-accent/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  compact ? "min-h-11 rounded-[0.9rem] px-0 text-[0.95rem]" : "min-h-12 rounded-xl px-2 text-sm"
                )}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

      {compact ? (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onToggleDirection}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.9rem] border border-white/10 bg-transparent px-3 text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Switch
          </button>
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onBackspace}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.9rem] border border-accent/30 bg-accent-soft px-3 text-sm font-semibold text-text transition hover:border-accent/50 hover:bg-accent-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Delete className="h-4 w-4" />
            Delete
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onFocusSystemKeyboard}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Keyboard className="h-4 w-4" />
            Keyboard
          </button>
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onToggleDirection}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {direction === "across" ? "Across" : "Down"}
          </button>
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onBackspace}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 text-sm font-semibold text-text transition hover:border-accent/50 hover:bg-accent-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Delete className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
