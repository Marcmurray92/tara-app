import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { gameRegistry } from "@/features/games/game-registry";

export function HomeGameCards() {
  return (
    <div className="w-full px-3 py-4 sm:px-6">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only">
        Tara&apos;s birthday games
      </h1>

      <div className="overflow-x-auto">
        <div className="flex snap-x snap-mandatory gap-3 pb-1">
          {gameRegistry.map((game, index) => {
            const Icon = game.icon;

            return (
              <Reveal
                key={game.type}
                delay={90 + index * 45}
                className="w-[calc(100vw-1.5rem)] shrink-0 snap-center sm:w-[24rem]"
              >
                <TransitionLink
                  href={game.href}
                  direction="forward"
                  aria-label={game.title}
                  className="flex min-h-[11rem] w-full flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-white/10 bg-surface/90 px-6 text-center transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/25 bg-accent-soft text-accent">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="font-display text-3xl leading-tight text-text">{game.shortTitle}</span>
                </TransitionLink>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
