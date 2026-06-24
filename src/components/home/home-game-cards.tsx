"use client";

import { useEffect, useState } from "react";

import { GameCard, type GameCardState } from "@/components/games/game-card";
import { readLocalConnectionsStatus } from "@/features/connections/game/connections-storage";
import { gameRegistry } from "@/features/games/game-registry";
import { readLocalGuessingStatus } from "@/features/guessing/game/guessing-storage";
import { readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";
import {
  placeholderConnectionsContentVersion,
  placeholderConnectionsSlug
} from "@/features/connections/seed/placeholder-connections";
import {
  placeholderGuessingContentVersion,
  placeholderGuessingSlug
} from "@/features/guessing/seed/placeholder-guessing";

type FeaturedCrossword = {
  slug: string;
  contentVersion: number;
  href: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
};

export function HomeGameCards({ featuredCrossword }: { featuredCrossword: FeaturedCrossword }) {
  const [states, setStates] = useState<Record<"crossword" | "connections" | "guessing", GameCardState>>({
    crossword: "play",
    connections: "play",
    guessing: "play"
  });

  useEffect(() => {
    const toCardState = (progressState: "none" | "in-progress" | "completed"): GameCardState => {
      if (progressState === "completed") {
        return "completed";
      }

      if (progressState === "in-progress") {
        return "continue";
      }

      return "play";
    };

    setStates({
      crossword: toCardState(readLocalCrosswordStatus(featuredCrossword.slug, featuredCrossword.contentVersion)),
      connections: toCardState(readLocalConnectionsStatus(placeholderConnectionsSlug, placeholderConnectionsContentVersion)),
      guessing: toCardState(readLocalGuessingStatus(placeholderGuessingSlug, placeholderGuessingContentVersion))
    });
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
        const state = states[game.type];

        return <GameCard key={game.type} game={resolvedGame} state={state} />;
      })}
    </div>
  );
}
