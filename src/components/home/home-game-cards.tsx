"use client";

import { useMemo } from "react";

import { GameCard, type GameCardState } from "@/components/games/game-card";
import { gameRegistry } from "@/features/games/game-registry";
import { readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";

type FeaturedCrossword = {
  slug: string;
  contentVersion: number;
  href: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
};

export function HomeGameCards({ featuredCrossword }: { featuredCrossword: FeaturedCrossword }) {
  const crosswordState = useMemo<GameCardState>(() => {
    const progressState = readLocalCrosswordStatus(featuredCrossword.slug, featuredCrossword.contentVersion);

    if (progressState === "completed") {
      return "completed";
    }

    if (progressState === "in-progress") {
      return "continue";
    }

    return "play";
  }, [featuredCrossword.contentVersion, featuredCrossword.slug]);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {gameRegistry.map((game) => {
        const resolvedGame =
          game.type === "crossword"
            ? {
                ...game,
                title: featuredCrossword.title,
                description: featuredCrossword.description?.trim() || game.description,
                href: featuredCrossword.href
              }
            : game;
        const state =
          game.type === "crossword" ? crosswordState : game.availability === "coming-soon" ? "coming-soon" : "play";

        return <GameCard key={game.type} game={resolvedGame} state={state} />;
      })}
    </div>
  );
}
