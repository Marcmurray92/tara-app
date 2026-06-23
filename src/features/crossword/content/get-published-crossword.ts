import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { getPublishedGameContentBySlug } from "@/features/content/game-content.repository";
import { placeholderCrosswordCompiledData } from "@/features/crossword/seed/placeholder-crossword";
import { safeReadServerEnv } from "@/lib/environment/env";

export async function getPublishedCrossword(slug: string) {
  const env = safeReadServerEnv();

  if (!env.success || !env.data.DATABASE_URL) {
    if (slug === "taras-birthday-crossword") {
      return {
        compiledData: placeholderCrosswordCompiledData,
        contentVersion: 1
      };
    }

    return null;
  }

  try {
    const record = await getPublishedGameContentBySlug("crossword", slug);
    if (record?.compiledData) {
      return {
        compiledData: record.compiledData as CrosswordCompiledData,
        contentVersion: record.contentVersion
      };
    }
  } catch {
    // Fall back to placeholder content when the database is not configured yet.
  }

  if (slug === "taras-birthday-crossword") {
    return {
      compiledData: placeholderCrosswordCompiledData,
      contentVersion: 1
    };
  }

  return null;
}
