import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl tracking-wide text-text">Tara&apos;s 30th</p>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">Birthday games collection</p>
            </div>
          </Link>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          <Button asChild={false} variant="ghost">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild={false} variant="ghost">
            <Link href="/games/connections">Connections</Link>
          </Button>
          <Button asChild={false} variant="ghost">
            <Link href="/games/guessing">Guessing Game</Link>
          </Button>
          <Button asChild={false} variant="outline">
            <Link href="/admin">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

