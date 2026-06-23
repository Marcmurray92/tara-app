import { ComingSoon } from "@/components/games/coming-soon";
import { GameShell } from "@/components/app-shell/game-shell";

export default function ConnectionsComingSoonPage() {
  return (
    <GameShell>
      <ComingSoon
        eyebrow="Future game route"
        title="Connections is queued up next."
        description="The sheet schema, validation rules, and future compiled-game contract are already part of this codebase. The tile-solving gameplay lands in the next phase."
      />
    </GameShell>
  );
}

