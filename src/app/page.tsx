import { GameShell } from "@/components/app-shell/game-shell";
import { HomeGameCards } from "@/components/home/home-game-cards";

export default function HomePage() {
  return (
    <GameShell chrome="game">
      <section className="flex min-h-[100svh] items-center lg:min-h-[calc(100dvh-4.5rem)]">
        <HomeGameCards />
      </section>
    </GameShell>
  );
}
