import { GameShell } from "@/components/app-shell/game-shell";
import { HomeGameCards } from "@/components/home/home-game-cards";
import { listPublishedCrosswords } from "@/features/crossword/content/get-published-crossword";

export default async function HomePage() {
  const crosswords = await listPublishedCrosswords();

  return (
    <GameShell chrome="game">
      <section className="min-h-[100svh] lg:min-h-[calc(100dvh-4.5rem)]">
        <HomeGameCards crosswords={crosswords} />
      </section>
    </GameShell>
  );
}
