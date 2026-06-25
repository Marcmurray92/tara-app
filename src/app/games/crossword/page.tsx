import Link from "next/link";
import { Puzzle } from "lucide-react";

import { GameShell } from "@/components/app-shell/game-shell";
import { listPublishedCrosswords } from "@/features/crossword/content/get-published-crossword";

export default async function CrosswordIndexPage() {
  const crosswords = await listPublishedCrosswords();

  return (
    <GameShell chrome="game">
      <section className="flex min-h-[100svh] items-center lg:min-h-[calc(100dvh-4.5rem)]">
        <div className="w-full overflow-x-auto px-3 py-4 sm:px-6">
          <div className="flex snap-x snap-mandatory gap-3 pb-1">
            {crosswords.map((crossword) => (
              <Link
                key={crossword.slug}
                href={crossword.href}
                className="flex min-h-[14rem] w-[calc(100vw-1.5rem)] shrink-0 snap-center flex-col justify-between rounded-[1.5rem] border border-white/10 bg-surface/90 p-5 transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[24rem]"
              >
                <div className="space-y-4">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/25 bg-accent-soft text-accent">
                    <Puzzle className="h-7 w-7" />
                  </span>
                  <div className="space-y-2">
                    <h1 className="font-display text-3xl leading-tight text-text">{crossword.title}</h1>
                    <p className="text-sm leading-6 text-muted">{crossword.subtitle}</p>
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted">{crossword.clueCount} clues</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </GameShell>
  );
}
