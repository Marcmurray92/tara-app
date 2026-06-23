import Link from "next/link";
import { PartyPopper } from "lucide-react";

import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { Button } from "@/components/ui/button";

export function CrosswordCompletionDialog({
  open,
  puzzle
}: {
  open: boolean;
  puzzle: CrosswordCompiledData;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-[1.8rem] border border-accent/30 bg-surface-strong p-8 shadow-glow"
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent-soft text-accent">
          <PartyPopper className="h-7 w-7" />
        </div>
        <h2 className="font-display text-4xl">{puzzle.completion.title}</h2>
        <p className="mt-4 text-base leading-8 text-muted">{puzzle.completion.message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild={false} className="sm:w-auto">
            <Link href={puzzle.completion.actionHref ?? "/"}>{puzzle.completion.actionLabel ?? "Back home"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

