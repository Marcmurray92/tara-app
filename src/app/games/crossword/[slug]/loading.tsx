import { GameShell } from "@/components/app-shell/game-shell";

export default function CrosswordLoadingPage() {
  return (
    <GameShell chrome="game">
      <div className="animate-pulse space-y-4">
        <div className="h-28 rounded-[1.5rem] bg-white/5" />
        <div className="h-[420px] rounded-[1.5rem] bg-white/5" />
      </div>
    </GameShell>
  );
}
