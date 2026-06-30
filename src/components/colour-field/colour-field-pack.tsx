"use client";

import { ArrowRight, Home, Lock, Palette } from "lucide-react";
import { useMemo, useState } from "react";

import { GameMasthead } from "@/components/games/game-masthead";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  createColourFieldProgress,
  getFirstUnlockedColourFieldLevel,
  normaliseColourFieldProgress,
  readColourFieldStatusSummary
} from "@/features/colour-field/game/colour-field-engine";
import type { ColourFieldGameData } from "@/features/colour-field/game/colour-field-game.types";
import { loadColourFieldProgress } from "@/features/colour-field/game/colour-field-storage";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import { cn } from "@/lib/utils/cn";

function getLevelBadge({
  unlocked,
  completed,
  started
}: {
  unlocked: boolean;
  completed: boolean;
  started: boolean;
}) {
  if (completed) {
    return "Restored";
  }

  if (!unlocked) {
    return "Locked";
  }

  return started ? "In progress" : "Unlocked";
}

export function ColourFieldPack({
  title,
  subtitle,
  slug,
  contentVersion,
  gameData
}: {
  title: string;
  subtitle: string;
  slug: string;
  contentVersion: number;
  gameData: ColourFieldGameData;
}) {
  const [progress] = useState(() =>
    normaliseColourFieldProgress(
      gameData,
      loadColourFieldProgress(slug, contentVersion) ?? createColourFieldProgress(gameData)
    )
  );

  const packStatus = useMemo(() => readColourFieldStatusSummary(gameData, progress), [gameData, progress]);
  const nextLevel = useMemo(() => getFirstUnlockedColourFieldLevel(gameData, progress), [gameData, progress]);

  return (
    <section className="min-h-[100svh] px-3 py-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <GameMasthead
          eyebrow="50 Shades of Tara"
          title={title}
          subtitle={subtitle}
          actions={
            <>
              {nextLevel ? (
                <Button asChild>
                  <TransitionLink href={`/games/colour-field/${nextLevel.slug}`} direction="forward">
                    {packStatus === "none" ? "Start" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </TransitionLink>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <TransitionLink href="/" direction="back">
                  <Home className="h-4 w-4" />
                  Home
                </TransitionLink>
              </Button>
            </>
          }
        />

        {packStatus === "completed" ? (
          <div className="rounded-[1.35rem] border border-accent/25 bg-accent-soft/70 px-4 py-3 text-sm leading-6 text-text">
            All {gameData.levels.length} fields are restored. Taste detected.
          </div>
        ) : (
          <div className="rounded-[1.35rem] border border-white/10 bg-surface/80 px-4 py-3 text-sm leading-6 text-muted">
            {gameData.introLine}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gameData.levels.map((level, index) => {
            const levelProgress = progress.levels[level.slug];
            const completed = Boolean(levelProgress.completedAt);
            const unlocked = levelProgress.unlocked;
            const started = levelProgress.currentMoves > 0 || Boolean(levelProgress.startedAt);
            const badge = getLevelBadge({ unlocked, completed, started });
            const levelTitle = getBirthdayDateLabel(index);
            const body = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-accent/20 bg-accent-soft text-accent">
                    {unlocked ? <Palette className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em]",
                      completed
                        ? "border-accent/30 bg-black/20 text-text"
                        : unlocked
                          ? "border-white/10 bg-black/20 text-muted"
                          : "border-white/10 bg-black/10 text-muted/70"
                    )}
                  >
                    {badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-[1.4rem] leading-tight text-text">{levelTitle}</h2>
                </div>

                <div className="space-y-1 text-sm text-muted">
                  <p>{level.columns} × {level.rows}</p>
                  <p>{level.fixedTileIndexes.length} anchors</p>
                  {levelProgress.bestMoves !== null ? <p>Best: {levelProgress.bestMoves} moves</p> : null}
                </div>
              </>
            );

            if (!unlocked) {
              return (
                <div
                  key={level.slug}
                  className="flex min-h-[14rem] flex-col justify-between rounded-[1.35rem] border border-white/10 bg-black/20 p-4 opacity-75"
                  aria-label={`Field ${index + 1}, ${levelTitle}, locked`}
                >
                  {body}
                </div>
              );
            }

            return (
              <TransitionLink
                key={level.slug}
                href={`/games/colour-field/${level.slug}`}
                direction="forward"
                aria-label={`Field ${index + 1}, ${levelTitle}, ${badge}`}
                className={cn(
                  "flex min-h-[14rem] flex-col justify-between rounded-[1.35rem] border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  completed
                    ? "animate-status-bloom border-accent/30 bg-accent-soft/70"
                    : "border-white/10 bg-surface/90 hover:border-accent/45 hover:bg-surface-strong"
                )}
              >
                {body}
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
