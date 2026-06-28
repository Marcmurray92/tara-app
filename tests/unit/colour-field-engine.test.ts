import { describe, expect, it } from "vitest";

import {
  createColourFieldProgress,
  getColourFieldLevelProgress,
  getSolvedColourFieldOrder,
  readColourFieldStatusSummary,
  startColourFieldLevel,
  swapColourFieldTiles
} from "@/features/colour-field/game/colour-field-engine";
import { placeholderColourFieldGameData } from "@/features/colour-field/seed/placeholder-colour-field";

describe("colour field engine", () => {
  it("starts as not started and unlocks only the first field", () => {
    const progress = createColourFieldProgress(placeholderColourFieldGameData);
    const [firstLevel, secondLevel] = placeholderColourFieldGameData.levels;

    expect(readColourFieldStatusSummary(placeholderColourFieldGameData, progress)).toBe("none");
    expect(progress.levels[firstLevel.slug]?.unlocked).toBe(true);
    expect(progress.levels[secondLevel.slug]?.unlocked).toBe(false);
  });

  it("scrambles only movable tiles when a field starts", () => {
    const firstLevel = placeholderColourFieldGameData.levels[0];
    const started = startColourFieldLevel({
      gameData: placeholderColourFieldGameData,
      progress: createColourFieldProgress(placeholderColourFieldGameData),
      levelSlug: firstLevel.slug,
      now: "2026-06-28T12:00:00.000Z"
    });

    const levelProgress = getColourFieldLevelProgress(placeholderColourFieldGameData, started, firstLevel.slug);
    const solvedOrder = getSolvedColourFieldOrder(firstLevel);

    expect(levelProgress?.currentOrder).not.toEqual(solvedOrder);

    for (const lockedIndex of firstLevel.fixedTileIndexes) {
      expect(levelProgress?.currentOrder?.[lockedIndex]).toBe(lockedIndex);
    }

    expect(readColourFieldStatusSummary(placeholderColourFieldGameData, started)).toBe("in-progress");
  });

  it("marks a solved field complete and unlocks the next one", () => {
    const [firstLevel, secondLevel] = placeholderColourFieldGameData.levels;
    const progress = createColourFieldProgress(placeholderColourFieldGameData);

    progress.levels[firstLevel.slug] = {
      ...progress.levels[firstLevel.slug],
      currentOrder: [0, 3, 2, 1, 4, 5, 6, 7, 8],
      startedAt: "2026-06-28T12:05:00.000Z"
    };

    const solved = swapColourFieldTiles({
      gameData: placeholderColourFieldGameData,
      progress,
      levelSlug: firstLevel.slug,
      sourceIndex: 1,
      targetIndex: 3,
      now: "2026-06-28T12:06:00.000Z"
    });

    expect(solved.solved).toBe(true);
    expect(solved.newlyCompleted).toBe(true);
    expect(solved.progress.levels[firstLevel.slug]?.completedAt).toBe("2026-06-28T12:06:00.000Z");
    expect(solved.progress.levels[firstLevel.slug]?.bestMoves).toBe(1);
    expect(solved.progress.levels[firstLevel.slug]?.lastMoves).toBe(1);
    expect(solved.progress.levels[secondLevel.slug]?.unlocked).toBe(true);
  });
});
