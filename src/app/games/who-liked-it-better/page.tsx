import { GameShell } from "@/components/app-shell/game-shell";
import { WhoLikedItBetterGame } from "@/components/who-liked-it-better/who-liked-it-better-game";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import {
  placeholderWhoLikedItBetterContentVersion,
  placeholderWhoLikedItBetterGameData,
  placeholderWhoLikedItBetterSlug,
  placeholderWhoLikedItBetterTitle
} from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

export default function WhoLikedItBetterPage() {
  return (
    <GameShell chrome="game">
      <WhoLikedItBetterGame
        gameData={placeholderWhoLikedItBetterGameData}
        slug={placeholderWhoLikedItBetterSlug}
        contentVersion={placeholderWhoLikedItBetterContentVersion}
        title={getBirthdayDateLabel(0)}
      />
    </GameShell>
  );
}
