import { ArrowRight, Gift, Sparkles } from "lucide-react";

import { GameShell } from "@/components/app-shell/game-shell";
import { HomeGameCards } from "@/components/home/home-game-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHomepageData } from "@/features/home/get-homepage-data";

export default async function HomePage() {
  const homepageData = await getHomepageData();

  return (
    <GameShell>
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6 py-4">
          <Badge>Phase 1 live</Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-5xl leading-tight sm:text-6xl">
              Birthday games with a little glamour, a lot of affection, and real content scaffolding underneath.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Tara&apos;s 30th starts with a fully playable crossword, plus the foundations for Connections and a
              review-based guessing game so the whole gift can grow in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild={false} size="lg">
              <a href={homepageData.featuredCrossword.href}>
                Play the crossword
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild={false} size="lg" variant="outline">
              <a href="/admin/crosswords/new">Build content</a>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-accent/25 bg-surface/85 p-6 shadow-glow">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent-soft text-accent">
              <Gift className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl">What&apos;s ready now</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <li>Crossword import, generation, preview, local progress, and finish state.</li>
              <li>Typed parsers for all three spreadsheet formats, including draft and invalid row handling.</li>
              <li>Shared homepage, app shell, admin entry point, Railway prep, and PWA groundwork.</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-muted">
            <div className="mb-3 inline-flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <span className="uppercase tracking-[0.22em]">Gift-first design</span>
            </div>
            Deep charcoal, warm cream, and restrained gold keep the public side feeling personal rather than dashboardy.
          </div>
        </div>
      </section>

      <section className="mt-14">
        <HomeGameCards featuredCrossword={homepageData.featuredCrossword} />
      </section>
    </GameShell>
  );
}

