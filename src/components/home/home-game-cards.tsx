"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { gameRegistry } from "@/features/games/game-registry";
import type { GameType } from "@/features/games/game.types";
import { cn } from "@/lib/utils/cn";

function getStatusCopy(status: "none" | "in-progress" | "completed") {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}

function getStatusIcon(status: "none" | "in-progress" | "completed") {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "in-progress":
      return CircleDot;
    default:
      return Circle;
  }
}

export function HomeGameCards() {
  const snapshot = useBirthdayProgress();
  const statusByType = snapshot.items.reduce<Record<GameType, "none" | "in-progress" | "completed">>(
    (carry, item) => {
      carry[item.type] = item.status;
      return carry;
    },
    {
      crossword: "none",
      connections: "none",
      guessing: "none"
    }
  );

  return (
    <div className="w-full px-3 py-4 sm:px-6">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only">
        Tara&apos;s birthday games
      </h1>

      <div className="overflow-x-auto">
        <div className="flex snap-x snap-mandatory gap-3 pb-1">
          {gameRegistry.map((game, index) => {
            const Icon = game.icon;
            const status = statusByType[game.type];
            const StatusIcon = getStatusIcon(status);

            return (
              <Reveal
                key={game.type}
                delay={90 + index * 45}
                className="w-[calc(100vw-1.5rem)] shrink-0 snap-center sm:w-[24rem]"
              >
                <TransitionLink
                  href={game.href}
                  direction="forward"
                  aria-label={`${game.title}. ${getStatusCopy(status)}.`}
                  className={cn(
                    "flex min-h-[11rem] w-full flex-col items-center justify-center gap-4 rounded-[1.5rem] border bg-surface/90 px-6 text-center transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    status === "completed"
                      ? "animate-status-bloom border-accent/35 bg-accent-soft/70"
                      : status === "in-progress"
                        ? "border-accent/20"
                        : "border-white/10"
                  )}
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/25 bg-accent-soft text-accent">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="font-display text-3xl leading-tight text-text">{game.shortTitle}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]",
                      status === "completed"
                        ? "border-accent/25 bg-black/20 text-text"
                        : status === "in-progress"
                          ? "border-accent/20 bg-accent-soft text-text"
                          : "border-white/10 bg-black/20 text-muted"
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {getStatusCopy(status)}
                  </span>
                </TransitionLink>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
