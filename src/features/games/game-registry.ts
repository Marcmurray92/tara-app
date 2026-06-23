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
    description: "A film-flavoured category challenge is on deck, with the data model already prepared behind the scenes.",
    href: "/games/connections",
    availability: "coming-soon",
    icon: Grid2X2,
    sourceFormatName: "Category / Movie 1 / Movie 2 / Movie 3 / Movie 4"
  },
  {
    type: "guessing",
    title: "Guessing Game",
    shortTitle: "Guessing Game",
    description: "Match deliciously specific Letterboxed reviews to the right film when the next phase lands.",
    href: "/games/guessing",
    availability: "coming-soon",
    icon: ScanSearch,
    sourceFormatName: "Right Answer / Answer 2 / Answer 3 / Answer 4 / Letterboxed Reviews"
  }
];

export function getGameDefinition(type: GameType) {
  return gameRegistry.find((game) => game.type === type);
}

