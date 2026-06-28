import { Grid2X2 } from "lucide-react";

import { GameShell } from "@/components/app-shell/game-shell";
import { TransitionLink } from "@/components/ui/transition-link";
import { listSeededConnectionsSummaries } from "@/features/connections/seed/placeholder-connections";

export default function ConnectionsPage() {
  const connectionsBoards = listSeededConnectionsSummaries();

  return (
    <GameShell chrome="game">
      <section className="flex min-h-[100svh] items-center lg:min-h-[calc(100dvh-4.5rem)]">
        <div className="w-full px-3 py-4 sm:px-6">
          <h1 data-page-title="true" tabIndex={-1} className="sr-only">
            Tara&apos;s Connections boards
          </h1>

          <div className="overflow-x-auto">
            <div className="flex snap-x snap-mandatory gap-3 pb-1">
              {connectionsBoards.map((board) => (
                <TransitionLink
                  key={board.slug}
                  href={board.href}
                  direction="forward"
                  className="flex min-h-[14rem] w-[calc(100vw-1.5rem)] shrink-0 snap-center flex-col justify-between rounded-[1.5rem] border border-white/10 bg-surface/90 p-5 transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[24rem]"
                >
                  <div className="space-y-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/25 bg-accent-soft text-accent">
                      <Grid2X2 className="h-7 w-7" />
                    </span>
                    <h2 className="font-display text-3xl leading-tight text-text">{board.title}</h2>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">{board.groupCount} groups</div>
                </TransitionLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </GameShell>
  );
}
