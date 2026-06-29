import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { ConnectionsGame } from "@/components/connections/connections-game";
import {
  getSeededConnectionsBySlug,
  listSeededConnectionsSummaries
} from "@/features/connections/seed/placeholder-connections";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const board = getSeededConnectionsBySlug(slug);
  const boardIndex = listSeededConnectionsSummaries().findIndex((entry) => entry.slug === slug);
  const displayTitle = boardIndex >= 0 ? getBirthdayDateLabel(boardIndex) : board?.title ?? "Connections";

  if (!board) {
    return {
      title: "Connections | Tara's 30th"
    };
  }

  return {
    title: `${displayTitle} | Connections | Tara's 30th`,
    description: board.description
  };
}

export async function generateStaticParams() {
  return listSeededConnectionsSummaries().map((board) => ({
    slug: board.slug
  }));
}

export default async function ConnectionsBoardPage({ params }: { params: { slug: string } }) {
  const board = getSeededConnectionsBySlug(params.slug);
  const boardIndex = listSeededConnectionsSummaries().findIndex((entry) => entry.slug === params.slug);
  const displayTitle = boardIndex >= 0 ? getBirthdayDateLabel(boardIndex) : board?.title ?? "Connections";

  if (!board) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <ConnectionsGame
        gameData={board.gameData}
        slug={board.slug}
        contentVersion={board.contentVersion}
        title={displayTitle}
      />
    </GameShell>
  );
}
