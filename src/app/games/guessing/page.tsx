import { GameShell } from "@/components/app-shell/game-shell";
import { GuessingGame } from "@/components/guessing/guessing-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  getDefaultSeededGuessingGame,
  placeholderGuessingSubtitle
} from "@/features/guessing/seed/placeholder-guessing";

export default function GuessingPage() {
  const game = getDefaultSeededGuessingGame();

  return (
    <GameShell chrome="game">
      <GuessingGame
        gameData={game.gameData}
        slug={game.slug}
        contentVersion={game.contentVersion}
        title={getBirthdayDateLabel(0)}
        subtitle={placeholderGuessingSubtitle}
      />
    </GameShell>
  );
}
