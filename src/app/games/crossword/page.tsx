import { Puzzle } from "lucide-react";

import { TransitionLink } from "@/components/ui/transition-link";
import { GameShell } from "@/components/app-shell/game-shell";
import { listPublishedCrosswords } from "@/features/crossword/content/get-published-crossword";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";

export default async function CrosswordIndexPage() {
  const crosswords = await listPublishedCrosswords();

  return (
    <GameShell chrome="game">
      <section className="flex min-h-[100svh] items-center lg:min-h-[calc(100dvh-4.5rem)]">
        <div className="w-full px-3 py-4 sm:px-6">
          <h1 data-page-title="true" tabIndex={-1} className="sr-only">
            Tara&apos;s crosswords
          </h1>

          <div className="overflow-x-auto">
            <div className="flex snap-x snap-mandatory gap-3 pb-1">
              {crosswords.map((crossword, index) => (
                <TransitionLink
                  key={crossword.slug}
                  href={crossword.href}
                  direction="forward"
                  className="flex min-h-[14rem] w-[calc(100vw-1.5rem)] shrink-0 snap-center flex-col justify-between rounded-[1.5rem] border border-white/10 bg-surface/90 p-5 transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[24rem]"
                >
                  <div className="space-y-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/25 bg-accent-soft text-accent">
                      <Puzzle className="h-7 w-7" />
                    </span>
                    <h2 className="font-display text-3xl leading-tight text-text">{getBirthdayDateLabel(index)}</h2>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">{crossword.clueCount} clues</div>
                </TransitionLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </GameShell>
  );
}
