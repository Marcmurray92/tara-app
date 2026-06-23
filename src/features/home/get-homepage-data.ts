import { getPublishedCrossword } from "@/features/crossword/content/get-published-crossword";
import { getPlaceholderCrosswordSummary } from "@/features/crossword/seed/placeholder-crossword";

export async function getHomepageData() {
  const featuredCrossword = await getPublishedCrossword("taras-birthday-crossword");

  return {
    featuredCrossword: featuredCrossword
      ? {
          slug: "taras-birthday-crossword",
          href: "/games/crossword/taras-birthday-crossword",
          contentVersion: featuredCrossword.contentVersion
        }
      : getPlaceholderCrosswordSummary()
  };
}
