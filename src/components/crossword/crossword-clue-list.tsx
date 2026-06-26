import type { CrosswordCompiledEntry } from "@/features/crossword/game/crossword-game.types";
import { cn } from "@/lib/utils/cn";

export function CrosswordClueList({
  title,
  entries,
  activeEntryId,
  solvedEntryIds = [],
  recentSolvedEntryIds = [],
  onSelectEntry,
  className,
  showHeading = true
}: {
  title: string;
  entries: CrosswordCompiledEntry[];
  activeEntryId?: string;
  solvedEntryIds?: string[];
  recentSolvedEntryIds?: string[];
  onSelectEntry: (entry: CrosswordCompiledEntry) => void;
  className?: string;
  showHeading?: boolean;
}) {
  const solvedEntryIdSet = new Set(solvedEntryIds);
  const recentSolvedEntryIdSet = new Set(recentSolvedEntryIds);

  return (
    <section aria-label={title} className={cn("rounded-[1.25rem] border border-white/10 bg-surface/85 p-4", className)}>
      {showHeading ? <h2 className="mb-4 text-sm uppercase tracking-[0.28em] text-muted">{title}</h2> : null}
      <ul className="space-y-2">
        {entries.map((entry) => {
          const solved = solvedEntryIdSet.has(entry.id);
          const recentlySolved = recentSolvedEntryIdSet.has(entry.id);

          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelectEntry(entry)}
                aria-current={activeEntryId === entry.id ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm leading-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  activeEntryId === entry.id
                    ? "border-accent bg-accent-soft text-text"
                    : solved
                      ? "border-success/25 bg-success/10 text-text"
                      : "border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-text",
                  recentlySolved ? "animate-solved-lift border-success/35 bg-success/12" : ""
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="mr-2 font-semibold text-accent">{entry.number}</span>
                    {entry.clue}
                  </span>
                  {solved ? <span className="text-[0.62rem] uppercase tracking-[0.18em] text-success">Done</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
