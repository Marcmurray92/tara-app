import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { GuessingGame } from "@/components/guessing/guessing-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  getSeededGuessingBySlug,
  listSeededGuessingSummaries,
  placeholderGuessingSubtitle
} from "@/features/guessing/seed/placeholder-guessing";

export async function generateStaticParams() {
  return listSeededGuessingSummaries().map((game) => ({
    slug: game.slug
  }));
}

export default function GuessingPuzzlePage({ params }: { params: { slug: string } }) {
  const game = getSeededGuessingBySlug(params.slug);
  const gameIndex = listSeededGuessingSummaries().findIndex((entry) => entry.slug === params.slug);

  if (!game) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <GuessingGame
        gameData={game.gameData}
        slug={game.slug}
        contentVersion={game.contentVersion}
        title={gameIndex >= 0 ? getBirthdayDateLabel(gameIndex) : game.title}
        subtitle={placeholderGuessingSubtitle}
      />
    </GameShell>
  );
}
