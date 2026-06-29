"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, CircleDot, Grid2X2, Palette, Puzzle, ScanSearch, Star } from "lucide-react";

import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { TransitionLink } from "@/components/ui/transition-link";
import { cn } from "@/lib/utils/cn";
import type { GameType } from "@/features/games/game.types";

function getIcon(type: GameType) {
  switch (type) {
    case "crossword":
      return Puzzle;
    case "connections":
      return Grid2X2;
    case "guessing":
      return ScanSearch;
    case "colour-field":
      return Palette;
    case "who-liked-it-better":
      return Star;
  }
}

function getStatusLabel(status: "none" | "in-progress" | "completed") {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}

function getStatusIcon(status: "none" | "in-progress" | "completed") {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "in-progress":
      return CircleDot;
    default:
      return Circle;
  }
}

export function BirthdayProgress({
  currentGame,
  compact = false,
  className
}: {
  currentGame?: GameType;
  compact?: boolean;
  className?: string;
}) {
  const snapshot = useBirthdayProgress();
  const previousStatusesRef = useRef<Record<GameType, "none" | "in-progress" | "completed">>({
    crossword: "none",
    connections: "none",
    guessing: "none",
    "colour-field": "none",
    "who-liked-it-better": "none"
  });
  const [animatedTypes, setAnimatedTypes] = useState<GameType[]>([]);

  useEffect(() => {
    const completedNow = snapshot.items
      .filter((item) => previousStatusesRef.current[item.type] !== "completed" && item.status === "completed")
      .map((item) => item.type);

    previousStatusesRef.current = snapshot.items.reduce<Record<GameType, "none" | "in-progress" | "completed">>(
      (carry, item) => {
        carry[item.type] = item.status;
        return carry;
      },
      {
        crossword: "none",
        connections: "none",
        guessing: "none",
        "colour-field": "none",
        "who-liked-it-better": "none"
      }
    );

    if (completedNow.length === 0) {
      return;
    }

    setAnimatedTypes(completedNow);
    const timeoutId = window.setTimeout(() => {
      setAnimatedTypes([]);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [snapshot.items]);

  return (
    <section
      aria-label="Birthday game progress"
      className={cn(
        "rounded-[1rem] border-2 border-white bg-black/95 shadow-glow backdrop-blur-sm",
        snapshot.allCompleted ? "animate-status-bloom border-arcade-green" : "",
        compact ? "p-3" : "p-4 sm:p-5",
        className
      )}
    >
      <div className={cn("flex items-start justify-between gap-3", compact ? "mb-3" : "mb-4")}>
        <div>
          <p className="font-body text-[0.72rem] uppercase tracking-[0.24em] text-arcade-blue">Your Stats</p>
          <p className={cn("mt-1 font-display uppercase text-text", compact ? "text-lg" : "text-2xl")}>
            {snapshot.completedCount}/{snapshot.items.length} cleared
          </p>
        </div>
        <div className="rounded-md border-2 border-white bg-[#0327ff] px-3 py-1.5 font-body text-xs uppercase tracking-[0.18em] text-white">
          {snapshot.allCompleted ? "Maxed Out" : "In Progress"}
        </div>
      </div>

      <div className={cn("grid gap-2.5", compact ? "grid-cols-2" : "sm:grid-cols-4")}>
        {snapshot.items.map((item) => {
          const Icon = getIcon(item.type);
          const StatusIcon = getStatusIcon(item.status);
          const active = item.type === currentGame;

          return (
            <TransitionLink
              key={item.type}
              href={item.href}
              aria-label={`${item.title}. ${getStatusLabel(item.status)}.`}
              className={cn(
                "rounded-[0.9rem] border-2 p-3 text-left transition active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                animatedTypes.includes(item.type) ? "animate-solved-lift" : "",
                active
                  ? "border-arcade-blue bg-[#03123b]"
                  : "border-white bg-[#0a0a0a] hover:border-arcade-green hover:bg-[#111111]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] border-2 border-white bg-black text-arcade-green">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="inline-flex items-center gap-1 font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {compact ? "" : getStatusLabel(item.status)}
                </span>
              </div>
              <p className="mt-3 font-display text-lg uppercase leading-tight text-text">{item.shortTitle}</p>
              {!compact ? <p className="mt-1.5 font-body text-sm leading-5 text-muted">{item.teaser}</p> : null}
            </TransitionLink>
          );
        })}
      </div>

      {snapshot.allCompleted ? (
        <p className="mt-4 font-body text-sm leading-6 text-arcade-green">
          All {snapshot.items.length} games cleared. Cartridge complete.
        </p>
      ) : null}
    </section>
  );
}
