"use client";

import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/app-shell/game-shell";

export default function CrosswordErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <GameShell>
      <div className="mx-auto max-w-2xl space-y-4 rounded-[1.5rem] border border-white/10 bg-surface/90 p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Crossword error</p>
        <h1 className="font-display text-4xl">The puzzle hit a snag.</h1>
        <p className="text-base leading-7 text-muted">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </GameShell>
  );
}
