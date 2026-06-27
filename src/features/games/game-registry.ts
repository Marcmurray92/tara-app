import { Grid2X2, Puzzle, ScanSearch, Star } from "lucide-react";

import type { GameDefinition, GameType } from "@/features/games/game.types";

export const gameRegistry: GameDefinition[] = [
  {
    type: "crossword",
    title: "Tara's Crosswords",
    shortTitle: "Crossword",
    description: "A polished, clue-driven birthday grid with saves, checks, reveals, and a celebratory finish.",
    href: "/games/crossword",
    availability: "available",
    icon: Puzzle,
    sourceFormatName: "Clue / Answer / Category"
  },
  {
    type: "connections",
    title: "Connections",
    shortTitle: "Connections",
    description: "Sort sixteen movie titles into four hidden categories before the fourth mistake lands.",
    href: "/games/connections",
    availability: "available",
    icon: Grid2X2,
    sourceFormatName: "Category / Movie 1 / Movie 2 / Movie 3 / Movie 4"
  },
  {
    type: "guessing",
    title: "Movie Review Guess",
    shortTitle: "Review Guess",
    description: "Read the Letterboxd screenshot, clock the right poster, and clear Easy, Medium, and Hard.",
    href: "/games/guessing",
    availability: "available",
    icon: ScanSearch,
    sourceFormatName: "Round / Right Answer / Answer 2 / Answer 3 / Answer 4 / Letterboxd Review"
  },
  {
    type: "who-liked-it-better",
    title: "Who Liked It Better",
    shortTitle: "Liked It Better",
    description: "Guess whether Tara or the celeb rated the film higher, then see the receipt.",
    href: "/games/who-liked-it-better",
    availability: "available",
    icon: Star,
    sourceFormatName: "Movie / Poster / Tara Rating / Celebrity / Celebrity Rating / Optional Source Image"
  }
];

export function getGameDefinition(type: GameType) {
  return gameRegistry.find((game) => game.type === type);
}
