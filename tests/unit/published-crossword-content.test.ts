import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameContentRecord } from "@/features/content/content.types";
import {
  placeholderCrosswordCompiledData,
  placeholderCrosswordContentVersion
} from "@/features/crossword/seed/placeholder-crossword";

const { safeReadServerEnv, getLatestPublishedGameContent, getPublishedGameContentBySlug } = vi.hoisted(() => ({
  safeReadServerEnv: vi.fn(),
  getLatestPublishedGameContent: vi.fn(),
  getPublishedGameContentBySlug: vi.fn()
}));

vi.mock("@/lib/environment/env", () => ({
  safeReadServerEnv
}));

vi.mock("@/features/content/game-content.repository", () => ({
  getLatestPublishedGameContent,
  getPublishedGameContentBySlug
}));

import { getFeaturedCrossword, getPublishedCrossword } from "@/features/crossword/content/get-published-crossword";

function buildPublishedRecord(overrides: Partial<GameContentRecord> = {}): GameContentRecord {
  return {
    id: "record-1",
    gameType: "crossword" as const,
    slug: "tara-30-live",
    title: "Tara's Real Birthday Crossword",
    subtitle: "Freshly published",
    description: "The final published crossword should drive the public homepage.",
    status: "published" as const,
    sourceSchemaVersion: 1,
    compiledSchemaVersion: 1,
    contentVersion: 3,
    sourceData: [],
    compiledData: placeholderCrosswordCompiledData,
    createdAt: "2026-06-24T10:00:00.000Z",
    updatedAt: "2026-06-24T10:00:00.000Z",
    publishedAt: "2026-06-24T10:00:00.000Z",
    ...overrides
  };
}

describe("published crossword content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to the seeded crossword when the database is unavailable", async () => {
    safeReadServerEnv.mockReturnValue({ success: false });

    const featured = await getFeaturedCrossword();

    expect(featured).toMatchObject({
      slug: "taras-birthday-crossword",
      href: "/games/crossword/taras-birthday-crossword",
      title: "June 30th",
      contentVersion: placeholderCrosswordContentVersion
    });
    expect(getLatestPublishedGameContent).not.toHaveBeenCalled();
  });

  it("returns the latest published crossword metadata for the homepage when available", async () => {
    safeReadServerEnv.mockReturnValue({
      success: true,
      data: {
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/tara_app"
      }
    });
    getLatestPublishedGameContent.mockResolvedValue(buildPublishedRecord());

    const featured = await getFeaturedCrossword();

    expect(featured).toMatchObject({
      slug: "tara-30-live",
      href: "/games/crossword/tara-30-live",
      title: "Tara's Real Birthday Crossword",
      subtitle: "Freshly published",
      description: "The final published crossword should drive the public homepage.",
      contentVersion: 3
    });
  });

  it("maps a published slug lookup to public crossword metadata", async () => {
    safeReadServerEnv.mockReturnValue({
      success: true,
      data: {
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/tara_app"
      }
    });
    getPublishedGameContentBySlug.mockResolvedValue(buildPublishedRecord({ slug: "tara-finale" }));

    const published = await getPublishedCrossword("tara-finale");

    expect(published).toMatchObject({
      slug: "tara-finale",
      href: "/games/crossword/tara-finale",
      title: "Tara's Real Birthday Crossword",
      subtitle: "Freshly published"
    });
  });
});
