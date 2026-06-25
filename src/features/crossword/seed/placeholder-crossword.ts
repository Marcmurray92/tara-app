import {
  getDefaultSeededCrossword,
  getSeededCrosswordBySlug,
  listSeededCrosswordSummaries,
  seededCrosswords
} from "@/features/crossword/seed/tara-crosswords";

const defaultCrossword = getDefaultSeededCrossword();

export const placeholderCrosswordSlug = defaultCrossword.slug;
export const placeholderCrosswordTitle = defaultCrossword.title;
export const placeholderCrosswordSubtitle = defaultCrossword.subtitle;
export const placeholderCrosswordDescription = defaultCrossword.description;
export const placeholderCrosswordContentVersion = defaultCrossword.contentVersion;
export const placeholderCrosswordSourceRows = defaultCrossword.sourceRows;
export const placeholderCrosswordSourceData = defaultCrossword.sourceData;
export const placeholderCrosswordCompiledData = defaultCrossword.compiledData;

export function getPlaceholderCrosswordSummary() {
  return {
    slug: defaultCrossword.slug,
    href: defaultCrossword.href,
    title: defaultCrossword.title,
    subtitle: defaultCrossword.subtitle,
    description: defaultCrossword.description,
    contentVersion: defaultCrossword.contentVersion,
    clueCount: defaultCrossword.clueCount
  };
}

export function getPlaceholderCrosswordContent() {
  return defaultCrossword;
}

export { getDefaultSeededCrossword, getSeededCrosswordBySlug, listSeededCrosswordSummaries, seededCrosswords };
