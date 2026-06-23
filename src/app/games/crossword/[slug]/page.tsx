import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { getPublishedCrossword } from "@/features/crossword/content/get-published-crossword";

export default async function CrosswordPage({ params }: { params: { slug: string } }) {
  const published = await getPublishedCrossword(params.slug);

  if (!published) {
    notFound();
  }

  return (
    <GameShell>
      <CrosswordGame
        puzzle={published.compiledData}
        slug={params.slug}
        contentVersion={published.contentVersion}
      />
    </GameShell>
  );
}
