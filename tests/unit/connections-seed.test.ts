import { describe, expect, it } from "vitest";

import {
  getSeededConnectionsBySlug,
  listSeededConnectionsSummaries,
  seededConnections
} from "@/features/connections/seed/placeholder-connections";

describe("connections seed manifest", () => {
  it("ships a playable collection of seeded Connections boards", () => {
    expect(seededConnections.length).toBeGreaterThanOrEqual(21);

    const slugs = new Set<string>();

    for (const board of seededConnections) {
      expect(slugs.has(board.slug)).toBe(false);
      slugs.add(board.slug);

      expect(board.gameData.groups).toHaveLength(4);

      for (const group of board.gameData.groups) {
        expect(group.items).toHaveLength(4);
      }
    }
  });

  it("exposes the newly added boards through the collection helpers", () => {
    const summaries = listSeededConnectionsSummaries();

    expect(summaries.some((board) => board.slug === "arctic-monkeys-round")).toBe(true);
    expect(summaries.some((board) => board.slug === "know-your-emojis")).toBe(true);
    expect(summaries.some((board) => board.slug === "red-herring-number-homophones")).toBe(true);

    expect(getSeededConnectionsBySlug("arctic-monkeys-round")?.title).toBe("Arctic Monkeys Round");
    expect(getSeededConnectionsBySlug("know-your-emojis")?.gameData.groups[0]?.items).toEqual(["🥂", "🎉", "🙌", "🎂"]);
  });
});
