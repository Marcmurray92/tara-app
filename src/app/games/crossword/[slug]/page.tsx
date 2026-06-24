import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { getPublishedCrossword } from "@/features/crossword/content/get-published-crossword";

const FALLBACK_DESCRIPTION = "A polished, clue-driven birthday crossword with saves, checks, reveals, and a finish state.";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const published = await getPublishedCrossword(params.slug);

  return {
    title: published?.title ?? "Crossword",
    description: published?.description ?? FALLBACK_DESCRIPTION
  };
}

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
        title={published.title}
        subtitle={published.subtitle}
      />
    </GameShell>
  );
}
