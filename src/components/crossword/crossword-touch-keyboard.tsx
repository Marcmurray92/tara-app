import { Delete } from "lucide-react";
import type { PointerEvent } from "react";

import { cn } from "@/lib/utils/cn";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

function preserveGridFocus(event: PointerEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function CrosswordTouchKeyboard({
  onKeyPress,
  onBackspace,
  onOpenMenu,
  compact = false
}: {
  onKeyPress: (value: string) => void;
  onBackspace: () => void;
  onOpenMenu: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "lg:hidden",
        compact
          ? "w-full border-y border-white/10 bg-[#d8d9de] px-2 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          : "rounded-[1.25rem] border border-white/10 bg-surface/90 p-3.5"
      )}
    >
      <div className={cn(compact ? "space-y-2" : "space-y-2")}>
        {(compact ? KEYBOARD_ROWS.slice(0, 2) : KEYBOARD_ROWS).map((row, rowIndex) => (
          <div
            key={row}
            className={cn("grid", compact ? "gap-2" : "gap-2")}
            style={{
              gridTemplateColumns:
                compact && rowIndex === 1
                  ? "0.5fr repeat(9, minmax(0, 1fr)) 0.5fr"
                  : `repeat(${row.length}, minmax(0, 1fr))`
            }}
          >
            {compact && rowIndex === 1 ? <span aria-hidden="true" /> : null}
            {Array.from(row).map((letter) => (
              <button
                key={letter}
                type="button"
                onPointerDown={preserveGridFocus}
                onClick={() => onKeyPress(letter)}
                className={cn(
                  "border border-black/10 bg-white font-semibold text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  compact ? "min-h-[3.75rem] rounded-[0.8rem] px-0 text-[1.9rem] leading-none" : "min-h-12 rounded-xl px-2 text-sm"
                )}
              >
                {letter}
              </button>
            ))}
            {compact && rowIndex === 1 ? <span aria-hidden="true" /> : null}
          </div>
        ))}
      </div>

      {compact ? (
        <div
          className="mt-2 grid gap-2"
          style={{
            gridTemplateColumns: "1.45fr repeat(7, minmax(0, 1fr)) 1.45fr"
          }}
        >
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onOpenMenu}
            className="inline-flex min-h-[3.75rem] items-center justify-center rounded-[0.8rem] border border-black/10 bg-white px-0 text-[1.9rem] font-semibold leading-none text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Open menu"
          >
            <span aria-hidden="true">…</span>
          </button>
          {Array.from(KEYBOARD_ROWS[2]).map((letter) => (
            <button
              key={`bottom-${letter}`}
              type="button"
              onPointerDown={preserveGridFocus}
              onClick={() => onKeyPress(letter)}
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-[0.8rem] border border-black/10 bg-white px-0 text-[1.9rem] font-semibold leading-none text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {letter}
            </button>
          ))}
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onBackspace}
            className="inline-flex min-h-[3.75rem] items-center justify-center rounded-[0.8rem] border border-black/10 bg-white px-0 text-[#111827] shadow-[0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Delete"
          >
            <Delete className="h-7 w-7" aria-hidden="true" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onPointerDown={preserveGridFocus}
            onClick={onOpenMenu}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 text-sm font-medium text-text transition hover:border-accent/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Menu
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
