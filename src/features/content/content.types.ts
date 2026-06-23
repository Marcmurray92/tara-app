import type { GameType } from "@/features/games/game.types";

export type ContentStatus = "draft" | "published" | "archived";

export type GameContentRecord = {
  id: string;
  gameType: GameType;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  status: ContentStatus;
  sourceSchemaVersion: number;
  compiledSchemaVersion?: number | null;
  contentVersion: number;
  sourceData: unknown;
  compiledData?: unknown;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

