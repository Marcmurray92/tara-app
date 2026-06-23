import type { GameType } from "@/features/games/game.types";

export type GameProgressEnvelope<T> = {
  gameType: GameType;
  slug: string;
  contentVersion: number;
  progressSchemaVersion: number;
  updatedAt: string;
  payload: T;
};

