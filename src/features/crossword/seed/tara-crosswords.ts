import seededCrosswordContent from "@/features/crossword/seed/tara-crossword-seeded-content.json";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import type {
  CrosswordCompleteSourceRow,
  CrosswordSourceDataEnvelope
} from "@/features/crossword/source/crossword-source.types";

export type SeededCrosswordContent = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description: string;
  contentVersion: number;
  clueCount: number;
  sourceRows: CrosswordCompleteSourceRow[];
  sourceData: CrosswordSourceDataEnvelope;
  compiledData: CrosswordCompiledData;
};

export const seededCrosswords = seededCrosswordContent as SeededCrosswordContent[];

const seededCrosswordMap = new Map(seededCrosswords.map((crossword) => [crossword.slug, crossword]));

export function getSeededCrosswordBySlug(slug: string) {
  return seededCrosswordMap.get(slug) ?? null;
}

export function getDefaultSeededCrossword() {
  const crossword = seededCrosswords[0];

  if (!crossword) {
    throw new Error("At least one seeded crossword is required.");
  }

  return crossword;
}

export function listSeededCrosswordSummaries() {
  return seededCrosswords.map((crossword) => ({
    slug: crossword.slug,
    href: crossword.href,
    title: crossword.title,
    subtitle: crossword.subtitle,
    description: crossword.description,
    contentVersion: crossword.contentVersion,
    clueCount: crossword.clueCount
  }));
}
