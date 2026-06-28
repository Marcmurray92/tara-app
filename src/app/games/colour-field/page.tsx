import { GameShell } from "@/components/app-shell/game-shell";
import { ColourFieldPack } from "@/components/colour-field/colour-field-pack";
import {
  placeholderColourFieldContentVersion,
  placeholderColourFieldGameData,
  placeholderColourFieldSlug,
  placeholderColourFieldSubtitle,
  placeholderColourFieldTitle
} from "@/features/colour-field/seed/placeholder-colour-field";

export default function ColourFieldPage() {
  return (
    <GameShell chrome="game">
      <ColourFieldPack
        title={placeholderColourFieldTitle}
        subtitle={placeholderColourFieldSubtitle}
        slug={placeholderColourFieldSlug}
        contentVersion={placeholderColourFieldContentVersion}
        gameData={placeholderColourFieldGameData}
      />
    </GameShell>
  );
}
