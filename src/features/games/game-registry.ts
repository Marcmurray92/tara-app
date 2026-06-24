import { Grid2X2, Puzzle, ScanSearch } from "lucide-react";

import type { GameDefinition, GameType } from "@/features/games/game.types";

export const gameRegistry: GameDefinition[] = [
  {
    type: "crossword",
    title: "Tara's Birthday Crossword",
    shortTitle: "Crossword",
    description: "A polished, clue-driven birthday grid with saves, checks, reveals, and a celebratory finish.",
    href: "/games/crossword/taras-birthday-crossword",
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
    title: "Guessing Game",
    shortTitle: "Guessing Game",
    description: "Match lovingly specific movie-review blurbs to the right film, one question at a time.",
    href: "/games/guessing",
    availability: "available",
    icon: ScanSearch,
    sourceFormatName: "Right Answer / Answer 2 / Answer 3 / Answer 4 / Letterboxed Reviews"
  }
];

export function getGameDefinition(type: GameType) {
  return gameRegistry.find((game) => game.type === type);
}
