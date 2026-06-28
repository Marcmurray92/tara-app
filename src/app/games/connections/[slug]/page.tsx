import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameShell } from "@/components/app-shell/game-shell";
import { ConnectionsGame } from "@/components/connections/connections-game";
import {
  getSeededConnectionsBySlug,
  listSeededConnectionsSummaries
} from "@/features/connections/seed/placeholder-connections";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const board = getSeededConnectionsBySlug(slug);

  if (!board) {
    return {
      title: "Connections | Tara's 30th"
    };
  }

  return {
    title: `${board.title} | Connections | Tara's 30th`,
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

  if (!board) {
    notFound();
  }

  return (
    <GameShell chrome="game">
      <ConnectionsGame
        gameData={board.gameData}
        slug={board.slug}
        contentVersion={board.contentVersion}
        title={board.title}
      />
    </GameShell>
  );
}
