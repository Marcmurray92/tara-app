import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import type { GameContentRecord } from "@/features/content/content.types";
import {
  getLatestPublishedGameContent,
  getPublishedGameContentBySlug,
  listPublishedGameContent
} from "@/features/content/game-content.repository";
import {
  getDefaultSeededCrossword,
  getSeededCrosswordBySlug,
  listSeededCrosswordSummaries,
  getPlaceholderCrosswordContent,
  placeholderCrosswordSlug
} from "@/features/crossword/seed/placeholder-crossword";
import { safeReadServerEnv } from "@/lib/environment/env";

export type PublicCrosswordContent = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  compiledData: CrosswordCompiledData;
  contentVersion: number;
};

export type PublicCrosswordSummary = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  contentVersion: number;
  clueCount: number;
  compiledData: CrosswordCompiledData;
};

function mapRecordToPublicCrossword(record: GameContentRecord | null): PublicCrosswordContent | null {
  if (!record || record.gameType !== "crossword" || !record.compiledData) {
    return null;
  }

  return {
    slug: record.slug,
    href: `/games/crossword/${record.slug}`,
    title: record.title,
    subtitle: record.subtitle,
    description: record.description,
    compiledData: record.compiledData as CrosswordCompiledData,
    contentVersion: record.contentVersion
  };
}

function mapRecordToPublicCrosswordSummary(record: GameContentRecord): PublicCrosswordSummary | null {
  const published = mapRecordToPublicCrossword(record);

  if (!published) {
    return null;
  }

  return {
    slug: published.slug,
    href: published.href,
    title: published.title,
    subtitle: published.subtitle,
    description: published.description,
    contentVersion: published.contentVersion,
    clueCount: published.compiledData.entries.length,
    compiledData: published.compiledData
  };
}

export async function getPublishedCrossword(slug: string) {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    return getSeededCrosswordBySlug(slug);
  }

  try {
    const published = mapRecordToPublicCrossword(await getPublishedGameContentBySlug("crossword", slug));
    if (published) {
      return published;
    }
  } catch {
    // Fall back to seeded content when the database is unavailable.
  }

  return getSeededCrosswordBySlug(slug);
}

export async function getFeaturedCrossword() {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    return getDefaultSeededCrossword();
  }

  try {
    return mapRecordToPublicCrossword(await getLatestPublishedGameContent("crossword")) ?? getDefaultSeededCrossword();
  } catch {
    return getDefaultSeededCrossword();
  }
}

export async function listPublishedCrosswords() {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    return listSeededCrosswordSummaries();
  }

  try {
    const published = (await listPublishedGameContent("crossword"))
      .map((record) => mapRecordToPublicCrosswordSummary(record))
      .filter((record): record is PublicCrosswordSummary => record !== null);

    return published.length > 0 ? published : listSeededCrosswordSummaries();
  } catch {
    return listSeededCrosswordSummaries();
  }
}
