import { describe, expect, it } from "vitest";

import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import {
  clearEntirePuzzle,
  createEmptyProgress,
  moveToAdjacentClue
} from "@/features/crossword/game/crossword-engine";

const puzzle: CrosswordCompiledData = {
  schemaVersion: 1,
  rows: 2,
  columns: 2,
  cells: [
    [
      { row: 0, column: 0, solution: "A", number: 1, acrossEntryId: "1-across", downEntryId: "1-down" },
      { row: 0, column: 1, solution: "B", acrossEntryId: "1-across", downEntryId: "2-down" }
    ],
    [
      { row: 1, column: 0, solution: "C", number: 3, acrossEntryId: "3-across", downEntryId: "1-down" },
      { row: 1, column: 1, solution: "D", acrossEntryId: "3-across", downEntryId: "2-down" }
    ]
  ],
  entries: [
    {
      id: "1-across",
      number: 1,
      direction: "across",
      clue: "First across",
      answer: "AB",
      displayAnswer: "AB",
      startRow: 0,
      startColumn: 0,
      length: 2
    },
    {
      id: "1-down",
      number: 1,
      direction: "down",
      clue: "First down",
      answer: "AC",
      displayAnswer: "AC",
      startRow: 0,
      startColumn: 0,
      length: 2
    },
    {
      id: "2-down",
      number: 2,
      direction: "down",
      clue: "Second down",
      answer: "BD",
      displayAnswer: "BD",
      startRow: 0,
      startColumn: 1,
      length: 2
    },
    {
      id: "3-across",
      number: 3,
      direction: "across",
      clue: "Second across",
      answer: "CD",
      displayAnswer: "CD",
      startRow: 1,
      startColumn: 0,
      length: 2
    }
  ],
  generation: {
    seed: "test-seed",
    attemptedEntryIds: [],
    placedEntryIds: ["1-across", "1-down", "2-down", "3-across"],
    unplacedEntryIds: [],
    generatedAt: "2026-06-27T00:00:00.000Z",
    algorithmVersion: 1
  },
  completion: {
    title: "Done",
    message: "Done"
  }
};

describe("crossword engine", () => {
  it("moves clue navigation to the next unfinished entry and focuses its first empty cell", () => {
    const progress = createEmptyProgress(puzzle);

    progress.cells[0][0].value = "A";
    progress.cells[0][1].value = "B";
    progress.selection = {
      row: 0,
      column: 0,
      direction: "across"
    };

    const moved = moveToAdjacentClue(puzzle, progress, 1);

    expect(moved.selection).toEqual({
      row: 1,
      column: 0,
      direction: "down"
    });
  });

  it("clears only the letters marked incorrect by a puzzle check", () => {
    const progress = createEmptyProgress(puzzle);

    progress.cells[0][0].value = "A";
    progress.cells[0][1].value = "Z";
    progress.cells[0][1].checkedIncorrect = true;
    progress.cells[1][0].value = "C";
    progress.cells[1][1].value = "D";

    const cleared = clearEntirePuzzle(puzzle, progress, "2026-06-27T12:00:00.000Z");

    expect(cleared.cells[0][0].value).toBe("A");
    expect(cleared.cells[0][1].value).toBe("");
    expect(cleared.cells[1][0].value).toBe("C");
    expect(cleared.cells[1][1].value).toBe("D");
  });
});
