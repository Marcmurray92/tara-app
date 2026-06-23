import { ComingSoon } from "@/components/games/coming-soon";
import { GameShell } from "@/components/app-shell/game-shell";

export default function GuessingComingSoonPage() {
  return (
    <GameShell>
      <ComingSoon
        eyebrow="Future game route"
        title="The Guessing Game is brewing."
        description="The review-sheet format, answer validation, and future multiple-choice structure are ready. Gameplay comes later, once the crossword is locked in."
      />
    </GameShell>
  );
}
