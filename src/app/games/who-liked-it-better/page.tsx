import { GameShell } from "@/components/app-shell/game-shell";
import { WhoLikedItBetterGame } from "@/components/who-liked-it-better/who-liked-it-better-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  getDefaultSeededWhoLikedItBetterGame
} from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

export default function WhoLikedItBetterPage() {
  const game = getDefaultSeededWhoLikedItBetterGame();

  return (
    <GameShell chrome="game">
      <WhoLikedItBetterGame
        gameData={game.gameData}
        slug={game.slug}
        contentVersion={game.contentVersion}
        title={getBirthdayDateLabel(0)}
      />
    </GameShell>
  );
}
