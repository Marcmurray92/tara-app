import type { CrosswordCompiledEntry } from "@/features/crossword/game/crossword-game.types";
import { cn } from "@/lib/utils/cn";

export function CrosswordClueList({
  title,
  entries,
  activeEntryId,
  onSelectEntry,
  className,
  showHeading = true
}: {
  title: string;
  entries: CrosswordCompiledEntry[];
  activeEntryId?: string;
  onSelectEntry: (entry: CrosswordCompiledEntry) => void;
  className?: string;
  showHeading?: boolean;
}) {
  return (
    <section aria-label={title} className={cn("rounded-[1.25rem] border border-white/10 bg-surface/85 p-4", className)}>
      {showHeading ? <h2 className="mb-4 text-sm uppercase tracking-[0.28em] text-muted">{title}</h2> : null}
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelectEntry(entry)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm leading-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                activeEntryId === entry.id
                  ? "border-accent bg-accent-soft text-text"
                  : "border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-text"
              )}
            >
              <span className="mr-2 font-semibold text-accent">{entry.number}</span>
              {entry.clue}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
