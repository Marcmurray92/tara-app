import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { getPublishedCrossword, listPublishedCrosswords } from "@/features/crossword/content/get-published-crossword";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";

const FALLBACK_DESCRIPTION = "A polished, clue-driven birthday crossword with saves, checks, reveals, and a finish state.";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const published = await getPublishedCrossword(params.slug);
  const crosswords = await listPublishedCrosswords();
  const crosswordIndex = crosswords.findIndex((crossword) => crossword.slug === params.slug);
  const displayTitle = crosswordIndex >= 0 ? getBirthdayDateLabel(crosswordIndex) : published?.title ?? "Crossword";

  return {
    title: displayTitle,
    description: published?.description ?? FALLBACK_DESCRIPTION
  };
}

export default async function CrosswordPage({ params }: { params: { slug: string } }) {
  const published = await getPublishedCrossword(params.slug);
  const crosswords = await listPublishedCrosswords();
  const crosswordIndex = crosswords.findIndex((crossword) => crossword.slug === params.slug);
  const displayTitle = crosswordIndex >= 0 ? getBirthdayDateLabel(crosswordIndex) : published?.title ?? "Crossword";

  if (!published) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <CrosswordGame
        puzzle={published.compiledData}
        slug={params.slug}
        contentVersion={published.contentVersion}
        title={displayTitle}
        subtitle={published.subtitle}
      />
    </GameShell>
  );
}
