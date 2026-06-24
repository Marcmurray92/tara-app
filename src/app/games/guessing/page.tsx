import { GameShell } from "@/components/app-shell/game-shell";
import { GuessingGame } from "@/components/guessing/guessing-game";
import {
  placeholderGuessingContentVersion,
  placeholderGuessingGameData,
  placeholderGuessingSlug,
  placeholderGuessingSubtitle,
  placeholderGuessingTitle
} from "@/features/guessing/seed/placeholder-guessing";

export default function GuessingPage() {
  return (
    <GameShell>
      <GuessingGame
        gameData={placeholderGuessingGameData}
        slug={placeholderGuessingSlug}
        contentVersion={placeholderGuessingContentVersion}
        title={placeholderGuessingTitle}
        subtitle={placeholderGuessingSubtitle}
      />
    </GameShell>
  );
}
