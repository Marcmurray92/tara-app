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

    for (const level of placeholderColourFieldGameData.levels) {
      expect(slugs.has(level.slug)).toBe(false);
      slugs.add(level.slug);
      expect(level.fixedTileIndexes.length).toBeGreaterThan(0);
      expect(level.columns).toBeGreaterThanOrEqual(4);
      expect(level.rows).toBeGreaterThanOrEqual(4);
      expect(level.columns * level.rows).toBeGreaterThanOrEqual(16);
    }

    const summaries = listSeededColourFieldSummaries();

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.levelCount).toBe(placeholderColourFieldGameData.levels.length);
    expect(getSeededColourFieldLevelBySlug("midnight-vows")?.title).toBe("Midnight Vows");
    expect(getSeededColourFieldLevelBySlug("last-dance")?.columns).toBe(6);
  });
});
