import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { ColourFieldGame } from "@/components/colour-field/colour-field-game";
import {
  getSeededColourFieldLevelBySlug,
  placeholderColourFieldContentVersion,
  placeholderColourFieldGameData,
  placeholderColourFieldSlug
} from "@/features/colour-field/seed/placeholder-colour-field";

export default function ColourFieldLevelPage({ params }: { params: { slug: string } }) {
  const level = getSeededColourFieldLevelBySlug(params.slug);

  if (!level) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <ColourFieldGame
        packSlug={placeholderColourFieldSlug}
        contentVersion={placeholderColourFieldContentVersion}
        gameData={placeholderColourFieldGameData}
        levelSlug={level.slug}
      />
    </GameShell>
  );
}
