import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import type { GameContentRecord } from "@/features/content/content.types";
import { getLatestPublishedGameContent, getPublishedGameContentBySlug } from "@/features/content/game-content.repository";
import {
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

export async function getPublishedCrossword(slug: string) {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    if (slug === placeholderCrosswordSlug) {
      return getPlaceholderCrosswordContent();
    }

    return null;
  }

  try {
    const published = mapRecordToPublicCrossword(await getPublishedGameContentBySlug("crossword", slug));
    if (published) {
      return published;
    }
  } catch {
    // Fall back to placeholder content when the database is not configured yet.
  }

  if (slug === placeholderCrosswordSlug) {
    return getPlaceholderCrosswordContent();
  }

  return null;
}

export async function getFeaturedCrossword() {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    return getPlaceholderCrosswordContent();
  }

  try {
    return mapRecordToPublicCrossword(await getLatestPublishedGameContent("crossword")) ?? getPlaceholderCrosswordContent();
  } catch {
    return getPlaceholderCrosswordContent();
  }
}
