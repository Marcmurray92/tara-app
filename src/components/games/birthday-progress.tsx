"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, CircleDot, Grid2X2, Puzzle, ScanSearch } from "lucide-react";

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
    guessing: "none"
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
        guessing: "none"
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
        "rounded-[1.3rem] border border-white/10 bg-surface/85 shadow-glow backdrop-blur-sm",
        compact ? "p-3" : "p-4 sm:p-5",
        className
      )}
    >
      <div className={cn("flex items-start justify-between gap-3", compact ? "mb-3" : "mb-4")}>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">Birthday run</p>
          <p className={cn("mt-1 font-display text-text", compact ? "text-lg" : "text-2xl")}>
            {snapshot.completedCount}/3 cleared
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted">
          {snapshot.allCompleted ? "All done" : "Keep going"}
        </div>
      </div>

      <div className={cn("grid gap-2.5", compact ? "grid-cols-3" : "sm:grid-cols-3")}>
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
                "rounded-[1.05rem] border p-3 text-left transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                animatedTypes.includes(item.type) ? "animate-solved-lift" : "",
                active ? "border-accent/50 bg-accent-soft" : "border-white/10 bg-black/20 hover:border-accent/35 hover:bg-white/5"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-white/10 bg-background/70 text-accent">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {compact ? "" : getStatusLabel(item.status)}
                </span>
              </div>
              <p className="mt-3 font-display text-lg leading-tight text-text">{item.shortTitle}</p>
              {!compact ? <p className="mt-1.5 text-sm leading-5 text-muted">{item.teaser}</p> : null}
            </TransitionLink>
          );
        })}
      </div>

      {snapshot.allCompleted ? (
        <p className="mt-4 text-sm leading-6 text-accent">All three games cleared. The crown remains secure.</p>
      ) : null}
    </section>
  );
}
