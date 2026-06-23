import Link from "next/link";

import { GameShell } from "@/components/app-shell/game-shell";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <GameShell>
      <section className="mx-auto flex max-w-2xl flex-col items-start gap-6 py-16">
        <p className="text-sm uppercase tracking-[0.28em] text-muted">Not found</p>
        <h1 className="font-display text-5xl">This page wandered off before the party started.</h1>
        <p className="max-w-xl text-base leading-7 text-muted">
          The app shell is live, but this route is not part of the current birthday collection.
        </p>
        <Button asChild={false}>
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </GameShell>
  );
}

