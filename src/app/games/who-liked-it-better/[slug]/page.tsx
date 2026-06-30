import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { WhoLikedItBetterGame } from "@/components/who-liked-it-better/who-liked-it-better-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  getSeededWhoLikedItBetterBySlug,
  listSeededWhoLikedItBetterSummaries
} from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

export async function generateStaticParams() {
  return listSeededWhoLikedItBetterSummaries().map((game) => ({
    slug: game.slug
  }));
}

export default function WhoLikedItBetterPuzzlePage({ params }: { params: { slug: string } }) {
  const game = getSeededWhoLikedItBetterBySlug(params.slug);
  const gameIndex = listSeededWhoLikedItBetterSummaries().findIndex((entry) => entry.slug === params.slug);

  if (!game) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <WhoLikedItBetterGame
        gameData={game.gameData}
        slug={game.slug}
        contentVersion={game.contentVersion}
        title={gameIndex >= 0 ? getBirthdayDateLabel(gameIndex) : game.title}
      />
    </GameShell>
  );
}
