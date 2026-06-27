import type { LucideIcon } from "lucide-react";

export type GameType = "crossword" | "connections" | "guessing" | "who-liked-it-better";

export type GameAvailability = "available" | "coming-soon" | "locked";

export type GameDefinition = {
  type: GameType;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  availability: GameAvailability;
  icon: LucideIcon;
  sourceFormatName: string;
};
