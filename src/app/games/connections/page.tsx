import { GameShell } from "@/components/app-shell/game-shell";
import { ConnectionsGame } from "@/components/connections/connections-game";
import {
  placeholderConnectionsContentVersion,
  placeholderConnectionsGameData,
  placeholderConnectionsSlug,
  placeholderConnectionsSubtitle,
  placeholderConnectionsTitle
} from "@/features/connections/seed/placeholder-connections";

export default function ConnectionsPage() {
  return (
    <GameShell chrome="game">
      <ConnectionsGame
        gameData={placeholderConnectionsGameData}
        slug={placeholderConnectionsSlug}
        contentVersion={placeholderConnectionsContentVersion}
        title={placeholderConnectionsTitle}
        subtitle={placeholderConnectionsSubtitle}
      />
    </GameShell>
  );
}
