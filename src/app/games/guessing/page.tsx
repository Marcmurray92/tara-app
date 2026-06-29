import { GameShell } from "@/components/app-shell/game-shell";
import { GuessingGame } from "@/components/guessing/guessing-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  placeholderGuessingContentVersion,
  placeholderGuessingGameData,
  placeholderGuessingSlug,
  placeholderGuessingSubtitle,
  placeholderGuessingTitle
} from "@/features/guessing/seed/placeholder-guessing";

export default function GuessingPage() {
  return (
    <GameShell chrome="game">
      <GuessingGame
        gameData={placeholderGuessingGameData}
        slug={placeholderGuessingSlug}
        contentVersion={placeholderGuessingContentVersion}
        title={getBirthdayDateLabel(0)}
        subtitle={placeholderGuessingSubtitle}
      />
    </GameShell>
  );
}
