import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Clock3, Sparkle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameAvailability, GameDefinition } from "@/features/games/game.types";
import { cn } from "@/lib/utils/cn";

export type GameCardState = "play" | "continue" | "completed" | "coming-soon";

type GameCardProps = {
  game: GameDefinition;
  state: GameCardState;
  eyebrow?: ReactNode;
};

const availabilityLabel: Record<GameAvailability, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
  locked: "Locked"
};

export function GameCard({ game, state, eyebrow }: GameCardProps) {
  const Icon = game.icon;
  const label =
    state === "continue"
      ? "Continue"
      : state === "completed"
        ? "Completed"
        : state === "coming-soon"
          ? "Preview"
          : "Play";

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent">
            <Icon className="h-5 w-5" />
          </span>
          <Badge>{availabilityLabel[game.availability]}</Badge>
        </div>
        {eyebrow ? <div className="pt-4">{eyebrow}</div> : null}
        <CardTitle>{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted">
          Source format:
          <span className="ml-2 text-text">{game.sourceFormatName}</span>
        </p>
        <div
          className={cn(
            "inline-flex items-center gap-2 text-sm",
            state === "completed" ? "text-success" : "text-muted"
          )}
        >
          {state === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : state === "continue" ? (
            <Clock3 className="h-4 w-4" />
          ) : (
            <Sparkle className="h-4 w-4" />
          )}
          {state === "completed"
            ? "Solved on this device"
            : state === "continue"
              ? "Progress found locally"
              : game.availability === "coming-soon"
                ? "Route is live with polished placeholder copy"
                : "Ready to play"}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild={false} className="w-full justify-between">
          <Link href={game.href}>
            <span>{label}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

