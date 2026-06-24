import { describe, expect, it } from "vitest";

import {
  createConnectionsProgress,
  flattenConnectionsTiles,
  submitConnectionsSelection
} from "@/features/connections/game/connections-engine";
import { placeholderConnectionsGameData } from "@/features/connections/seed/placeholder-connections";

describe("connections engine", () => {
  it("solves a correct group and removes those tiles from the unsolved board", () => {
    const tiles = flattenConnectionsTiles(placeholderConnectionsGameData);
    const solvedTileIds = tiles.filter((tile) => tile.groupId === "time-loops").map((tile) => tile.id);

    const result = submitConnectionsSelection({
      gameData: placeholderConnectionsGameData,
      progress: {
        ...createConnectionsProgress(placeholderConnectionsGameData),
        selectedItemIds: solvedTileIds
      },
      now: "2026-06-24T10:00:00.000Z"
    });

    expect(result.feedback).toEqual({
      type: "solved",
      groupId: "time-loops"
    });
    expect(result.progress.solvedGroupIds).toEqual(["time-loops"]);
    expect(result.progress.remainingTileIds).toHaveLength(12);
    expect(result.progress.selectedItemIds).toEqual([]);
  });

  it("marks one-away guesses and rejects the same incorrect guess twice", () => {
    const tiles = flattenConnectionsTiles(placeholderConnectionsGameData);
    const nearMiss = [
      ...tiles.filter((tile) => tile.groupId === "time-loops").slice(0, 3),
      tiles.find((tile) => tile.groupId === "newsroom-chaos")!
    ].map((tile) => tile.id);

    const first = submitConnectionsSelection({
      gameData: placeholderConnectionsGameData,
      progress: {
        ...createConnectionsProgress(placeholderConnectionsGameData),
        selectedItemIds: nearMiss
      },
      now: "2026-06-24T10:00:00.000Z"
    });

    expect(first.feedback).toEqual({
      type: "one-away"
    });
    expect(first.progress.mistakes).toBe(1);

    const second = submitConnectionsSelection({
      gameData: placeholderConnectionsGameData,
      progress: {
        ...first.progress,
        selectedItemIds: nearMiss
      },
      now: "2026-06-24T10:05:00.000Z"
    });

    expect(second.feedback).toEqual({
      type: "duplicate"
    });
    expect(second.progress.mistakes).toBe(1);
  });
});
