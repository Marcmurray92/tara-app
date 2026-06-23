import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";

const placeholderRows: CrosswordCompleteSourceRow[] = [
  {
    id: "seed-1",
    sourceRowNumber: 2,
    clue: "Placeholder clue for the biggest birthday line in the grid.",
    answer: "Happy Birthday",
    category: "Placeholder",
    gridAnswer: "HAPPYBIRTHDAY",
    status: "complete",
    issues: []
  },
  {
    id: "seed-2",
    sourceRowNumber: 3,
    clue: "Placeholder bubbly toast.",
    answer: "Champagne",
    category: "Placeholder",
    gridAnswer: "CHAMPAGNE",
    status: "complete",
    issues: []
  },
  {
    id: "seed-3",
    sourceRowNumber: 4,
    clue: "Placeholder cinema plan.",
    answer: "Movie Night",
    category: "Placeholder",
    gridAnswer: "MOVIENIGHT",
    status: "complete",
    issues: []
  },
  {
    id: "seed-4",
    sourceRowNumber: 5,
    clue: "Placeholder for what absolutely belongs on the table.",
    answer: "Cake",
    category: "Placeholder",
    gridAnswer: "CAKE",
    status: "complete",
    issues: []
  },
  {
    id: "seed-5",
    sourceRowNumber: 6,
    clue: "Placeholder for the sparkly finishing touch.",
    answer: "Confetti",
    category: "Placeholder",
    gridAnswer: "CONFETTI",
    status: "complete",
    issues: []
  },
  {
    id: "seed-6",
    sourceRowNumber: 7,
    clue: "Placeholder party essentials with little flames.",
    answer: "Candles",
    category: "Placeholder",
    gridAnswer: "CANDLES",
    status: "complete",
    issues: []
  },
  {
    id: "seed-7",
    sourceRowNumber: 8,
    clue: "Placeholder for what the whole event is.",
    answer: "Party",
    category: "Placeholder",
    gridAnswer: "PARTY",
    status: "complete",
    issues: []
  },
  {
    id: "seed-8",
    sourceRowNumber: 9,
    clue: "Placeholder dance-floor energy.",
    answer: "Dancing",
    category: "Placeholder",
    gridAnswer: "DANCING",
    status: "complete",
    issues: []
  }
];

const compilation = compileCrossword({
  rows: placeholderRows,
  seed: "tara-placeholder-v1",
  completion: {
    title: "Placeholder puzzle complete",
    message:
      "This is the temporary birthday crossword. The final clue set can replace it later without changing the app architecture.",
    actionLabel: "Back to home",
    actionHref: "/"
  }
});

if (!compilation.compiledData) {
  throw new Error("Placeholder crossword failed to compile.");
}

export const placeholderCrosswordSourceRows = placeholderRows;
export const placeholderCrosswordCompiledData = compilation.compiledData;

export function getPlaceholderCrosswordSummary() {
  return {
    slug: "taras-birthday-crossword",
    href: "/games/crossword/taras-birthday-crossword",
    contentVersion: 1
  };
}

