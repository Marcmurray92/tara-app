import { describe, expect, it } from "vitest";

import {
  getSeededColourFieldLevelBySlug,
  listSeededColourFieldSummaries,
  placeholderColourFieldGameData
} from "@/features/colour-field/seed/placeholder-colour-field";

describe("colour field seed manifest", () => {
  it("ships a seeded pack with unique levels and usable helpers", () => {
    expect(placeholderColourFieldGameData.levels.length).toBeGreaterThanOrEqual(12);

    const slugs = new Set<string>();
    let previousSize = 0;

    for (const level of placeholderColourFieldGameData.levels) {
      expect(slugs.has(level.slug)).toBe(false);
      slugs.add(level.slug);
      expect(level.fixedTileIndexes.length).toBeGreaterThan(0);
      expect(level.columns).toBeGreaterThanOrEqual(8);
      expect(level.rows).toBeGreaterThanOrEqual(8);
      expect(level.columns).toBeLessThanOrEqual(12);
      expect(level.rows).toBeLessThanOrEqual(12);
      expect(level.columns).toBe(level.rows);
      expect(level.columns).toBeGreaterThanOrEqual(previousSize);
      previousSize = level.columns;
    }

    const summaries = listSeededColourFieldSummaries();

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.levelCount).toBe(placeholderColourFieldGameData.levels.length);
    expect(getSeededColourFieldLevelBySlug("midnight-vows")?.title).toBe("Midnight Vows");
    expect(getSeededColourFieldLevelBySlug("midnight-vows")?.columns).toBe(8);
    expect(getSeededColourFieldLevelBySlug("last-dance")?.columns).toBe(12);
  });
});
