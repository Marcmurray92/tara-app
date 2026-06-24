import { getFeaturedCrossword } from "@/features/crossword/content/get-published-crossword";

export async function getHomepageData() {
  return {
    featuredCrossword: await getFeaturedCrossword()
  };
}
